const express = require("express");
const passport = require("passport");
const { register, login, logout } = require("../controllers/authController");

const router = express.Router();

// local register  /auth/register
router.post("/register", register);

// local login  /auth/login
router.post(
  "/login",
  passport.authenticate("local", { failureStatus: 401 }),
  login
);

// logout  /auth/logout
router.get("/logout", logout);

// Initiate Google OAuth2 login at   /auth/google
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google OAuth2 callback at /auth/google/callback
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    res.redirect("/");
  }
);

module.exports = router;
