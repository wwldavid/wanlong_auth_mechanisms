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
