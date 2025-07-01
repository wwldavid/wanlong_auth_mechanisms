const express = require("express");
const passport = require("passport");
const { register, login, logout } = require("../controllers/authController");
const router = express.Router();

const { verifyToken, generateAccessToken } = require("../utils/jwt");
const { PrismaClient } = require("@prisma/client");
const { default: rateLimit } = require("express-rate-limit");
const prisma = new PrismaClient();

// Apply rare limiting specifically to the /auth/login route.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  keyGenerator: (req) => req.body.email || req.ip,
  handler: (req, res) => {
    res
      .status(429)
      .json({ message: "Too many login attempts, please try again later." });
  },
});

// local register  /auth/register
router.post("/register", register);

// local login  /auth/login (apply rate limiting first, then authenticate, and finally execute the login controller)
router.post(
  "/login",
  loginLimiter,
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

// refresh access token
router.post("/refresh", async (req, res) => {
  try {
    const token = req.cookies["refresh_token"];
    if (!token)
      return res.status(401).json({ message: "refreshToken is missing" });

    // vierify the refresh token and extract payload.id
    const payload = verifyToken(token);

    // ensure the user is still valid
    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user)
      return res.status(401).json({ message: "Invalid refresh token" });

    //reissue a new access token
    const newAccessToken = generateAccessToken(user);
    res
      .cookie("access_token", newAccessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        maxAge: 15 * 60 * 1000,
      })
      .json({ message: "access token has been refreshed" });
  } catch (err) {
    console.error(err);
    res.status(403).json({ message: "Failed to verify refresh token" });
  }
});

module.exports = router;
