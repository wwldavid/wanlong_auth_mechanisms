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
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, secure: false },
  })
);
app.use(passport.initialize());
app.use(passport.session());

//CSRF
app.use(csurf({ cookie: true }));
// global rate limiting and login-specific rate limiting
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

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
  console.log("Server running on http://localhost:${PORT}")
);
