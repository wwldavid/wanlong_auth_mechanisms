require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const csurf = require("csurf");
const rateLimit = require("express-rate-limit");

const passport = require("./config/passport");
const authRoutes = require("./routes/auth");
const protectedRoutes = require("./routes/protected");

const app = express();

// security middleware
app.use(helmet());
app.use(morgan("dev"));
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(cookieParser());

// session and passport
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false, // Do not save the session back to the store if it hasn't been modified during the request.
    saveUninitialized: false, // Do not save unmodified new sessions to the store and do not send set-cookie headers for them.
    // This avoids storing empty sessions and prevents sending cookies before user interaction.
    cookie: {
      httpOnly: true, //  Prevent client-side JavaScript from accessing the cookie
      secure: process.env.NODE_ENV === "production", // Send cookie only over HTTPS in production
      sameSite: "strict", // Protect against CSRF attacks
      maxAge: 30 * 60 * 1000, // Session expires after 30 minutes of inactivityy
    },
  })
);

app.use((req, res, next) => {
  if (req.session) {
    req.session._garbage = Date(); // Write a dummy field (_garbage) with the current timestamp to flag the session as mofified(dirty).

    req.session.touch(); // call express-session's touch() to extend req.session.cookie.expire by maxAge and reset cookie.maxAge.
  }
  next();
});

app.use(passport.initialize());
app.use(passport.session());

//CSRF
app.use(csurf({ cookie: true })); // CSRF protection is applied to all state-changing routes(POST,PUT, DELETE)
// Rate limiting is applied as a defense against brute-force login attempts.
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

app.get("/csrf-token", (req, res) => {
  // 把生成的 token 返回给客户端
  res.json({ csrfToken: req.csrfToken() });
});

// routes
app.use("/auth", authRoutes);
app.use("/api", protectedRoutes);

//global error handling
app.use((err, req, res, next) => {
  if (err.code === "EBADCSRFTOKEN")
    return res.status(403).send("CSRF token mismatch");
  console.error(err);
  res.status(500).send("Server Error");
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
