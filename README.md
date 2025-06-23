Node.js + Express + Prisma + Passport

1. npm install express helmet morgan dotenv cookie-parser cors
   (express: web framework;
   helmet: sets secure HTTP headers;
   morgan: HTTP request logger;
   dotenv: loads environment variables from .env file;
   cookie-parser: parses cookies
   cors: configures Cross-Origin Resource Sharing)

2. npm install bcryptjs express-session passport passport-local passport-google-oauth20 csurf express-rate-limit jsonwebtoken
   (bcryptjs: password hashing;
   express-session: session management;
   passport: core authentication framework;
   passport-local: username/password login strategy;
   csurf: CSRF protection;
   express-rate-limit: rate limiting(to prevent brute-force attacks);
   jsonwebtoken: Sign/verify JSON Web Token)

3. npm install -D prisma
   (CLI tool used for database migrations and generating the client)

4. npm install @prisma/client
   (@prisma/client: ORM client used in code to interact with the database)

5. npx prisma init --datasource-provider sqlite
   (prisma/schema.prisma: file where I define my data models)
   (.env automatically includes a DATABASE_URL, which by default points to file: ./dev.db)

6. create a pair of OAuth2 credentials in Google Cloud Console to obtain GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET

7. npx prisma migrate dev --name init

## Reflection - Part A design and implementation of authentication system

In this part, I implemented a dual authentication strategy that combines local username + password authentication with Google OAuth. For local authentication, I used bcryptjs to hash user password before storing them in the database. During login, the system uses bcrypt.compare() to verify the password. This logic is handled in the authController. For Google SSO, I integrated the passport-google-oauth20 strategy, allowing user to log in directly with their existing Google accounts. For integrating SSO, I need to provide environment variables in .env configuration also the callback URL list.The reason for choosing both methods is to retain a locally controlled login option for users who either do not have third-parth accounts or prefer not to use them, while also offering Google SSO to lower the barrier for first-time users.

## Reflection - Part B role-based access control

In my schema.prisma, I added a string-type role field to the user model to distinguish between regular users and admins. Then, I created two middleware functions in src>middleware>auth.js, ensureAuthenticatec: blocks unauthenticated requests and return a 401 error. requireRole: checks whether req.user.role matches the required role and return a 403 error if not.
At routing, I applied ensureAuthenticated to /api/profile, allowing all logged-in users to view. For /api/admiin, I used both ensureAuthenticated and requireRole so that only admins can access sensitive data. To make role management extensible, I used the RequireRole('role') pattern.
