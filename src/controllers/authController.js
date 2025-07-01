const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const { generateAccessToken, generateRefreshToken } = require("../utils/jwt");

exports.register = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Both email and password are required." });
  }
  try {
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return res
        .status(409)
        .json({ message: "This email has already been registered." });
    }
    const hash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, passwordHash: hash },
    });
    res.status(201).json({
      message: "registered successfully",
      user: { id: user.id, email: user.email },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "server error" });
  }
};

exports.login = (req, res, next) => {
  // 1. Regenerate a new session ID to replace the old one
  req.session.regenerate((err) => {
    if (err) return next(err);

    // 2. Continue with the new sesssion tied to the user that passport.authenticate() just set on req.user
    const user = req.user;

    // 3. Generate a JWT and store it in an HttpOnly cookie.
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    res
      .cookie("access_token", accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        maxAge: 15 * 60 * 1000,
      })
      .cookie("refresh_token", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({
        message: "successfully logged in",
        user: { id: user.id, email: user.email, role: user.role },
      });
  });
};

exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.session.destroy();
    res
      .clearCookie("connect.sid")
      .clearCookie("access_token")
      .clearCookie("refresh_token")
      .json({ message: "log out successfully" });
  });
};
