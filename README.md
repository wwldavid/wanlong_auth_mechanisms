### wanlong_auth_mechanisms

A secure authentication system built with Node.js, Express, Prisma and Passport.js.

### Setting Up the Repository

1. Clone the repo
   git clone https://github.com/wwldavid/wanlong_auth_mechanisms.git

### Copy and configure environment variables

cp .env.example .env
then edit .env to set:
DATABASE_URL
SESSION_SECRET
JWT_SECRET
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET

### Install dependencies

2. npm install express helmet morgan dotenv cookie-parser cors
   (express: web framework;
   helmet: sets secure HTTP headers;
   morgan: HTTP request logger;
   dotenv: loads environment variables from .env file;
   cookie-parser: parses cookies
   cors: configures Cross-Origin Resource Sharing)

3. npm install bcryptjs express-session passport passport-local passport-google-oauth20 csurf express-rate-limit jsonwebtoken
   (bcryptjs: password hashing;
   express-session: session management;
   passport: core authentication framework;
   passport-local: username/password login strategy;
   csurf: CSRF protection;
   express-rate-limit: rate limiting(to prevent brute-force attacks);
   jsonwebtoken: Sign/verify JSON Web Token)

### Google Cloud Console

4. create a pair of OAuth2 credentials in Google Cloud Console to obtain GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET

### database

5. npm install -D prisma
   (CLI tool used for database migrations and generating the client)

6. npm install @prisma/client
   (@prisma/client: ORM client used in code to interact with the database)

7. npx prisma init --datasource-provider sqlite
   (prisma/schema.prisma: file where I define my data models)
   (.env automatically includes a DATABASE_URL, which by default points to file: ./dev.db)

8. npx prisma migrate dev --name init

9. Generate Prisma client
   npx prisma generate

10. Start the server
    node src/app.js

### Authentication Mechanisms

Registration: POST /auth/register with email & password.
Password hashing: bcryptjs
Login: POST /auth/login via passport-local, issues access_token (15 min) & refresh_token (7 days) as HttpOnly, SameSite=Strict cookies.

Google OAuth
passport-google-oauth20 strategy on /auth/google, callback to /auth/google/callback.

New users auto-created with googleId + email.

Session & Cookie Security
All cookies set HttpOnly, Secure, SameSite='strict'.
Session cookies time out after 30 min (maxAge), with touch to extend on activity.

JWT Refresh Flow
verifyJWT middleware on protected routes.
POST /auth/refresh reads refresh_token, issues new access_token.

CSRF Protection csurf({ cookie: true })
GET /csrf-token returns a one-time token for each request.

### Role-Based Access Control

Roles:
user (default)
admin (set manually in the database)

Middleware (src/middleware/auth.js):
ensureAuthenticated: blocks unauthenticated
requireRole(role): blocks users without the required role

Protected Routes:
GET /api/profile any authenticated user
GET /api/admin only admin users
GET /api/dashboard renders different views for user vs admin

### Lessons Learned

# Reflection - Part A design and implementation of authentication system

In this part, I implemented a dual authentication strategy that combines local username + password authentication with Google OAuth. For local authentication, I used bcryptjs to hash user password before storing them in the database. During login, the system uses bcrypt.compare() to verify the password. This logic is handled in the authController. For Google SSO, I integrated the passport-google-oauth20 strategy, allowing user to log in directly with their existing Google accounts. For integrating SSO, I need to provide environment variables in .env configuration also the callback URL list.The reason for choosing both methods is to retain a locally controlled login option for users who either do not have third-parth accounts or prefer not to use them, while also offering Google SSO to lower the barrier for first-time users.

# Reflection - Part B role-based access control

In my schema.prisma, I added a string-type role field to the user model to distinguish between regular users and admins. Then, I created two middleware functions in src>middleware>auth.js, ensureAuthenticatec: blocks unauthenticated requests and return a 401 error. requireRole: checks whether req.user.role matches the required role and return a 403 error if not.
At routing, I applied ensureAuthenticated to /api/profile, allowing all logged-in users to view. For /api/admiin, I used both ensureAuthenticated and requireRole so that only admins can access sensitive data. To make role management extensible, I used the RequireRole('role') pattern.

11. npm install jsonwebtoken

12. npx prisma generate

# Reflection - Part C JWT

I have stored both the access_token and refresh_token in HttpOnly cookies. This helps prevent XSS attacks since JavaScript can't access these cookies, making it more secure than using localStorage. With SameSite='Strict' setting, it also reduces the risk of CSRF attacks.
The access_token expires in 15 minutes to limit the window for potential misuse. The refresh_token lasts for 7 days, so users don't have to log in frequently. By calling auth/refresh, user can get a new access_token. Using cookies for token storage need to enable cors and set the secure flag on the server. This approach avoids storing sensitive tokens in the client and also removes the need to manually add authorization headers for every request.
One problem I faced was: How to detect if the token is expired and handle it smoothly, instead of always sending the user back to the login page. My solution: In the middleware, I used 401 if the token is missing(the user didn't log in), 403 if the token is invalid or expired. If the frone end sees 403, it knows "the token is expired", it can automatically refresh the token using /auth/refresh; If it sees 401, it knows the user isn't logged in, then redirect to login. This makes the app both secure and user-freindly, invalid tokens are blocked and users don't get logged out just because the token expired.

# Reflection - Part D Mitigating Session-Related Security Risks

In this part, I have dealt with four session security threats: stealing cookies, unthorized actions, brute-force login attempts, and session fixation.
To prevent XSS, I set all cookies with HttpOnly, Secure, and SameSite='Strict', so they cann't be accessed by JavaScript or other websites.
To stop SDRF, I used csurf middleware with {cookie: true}, and added a csrf-token route so the front end can get a valid CSRF token for forms.
To protect against brute-force attacks, I limited the login endpoints to 5 failed attempts every 15 minutes, based on email or IP. I also returned the same error message "invalid credentials" whether the email or password is wrong, thus prevents attackers from guessing valid emails.
For session fixatioin, I called req.session.regenerate() after successful login. This replaces the old session ID with a new one, so attackers cann't resue an existing session.
For a balanced security and user experience I used a 30-minute session timeout and session.touch() to extend sessions if the user is active. Error messages are kept clear, but do not reveal sensitive details.
