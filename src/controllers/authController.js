const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

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
    res
      .status(201)
      .json({
        message: "registered successfully",
        user: { id: user.id, email: user.email },
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "server error" });
  }
};

exports.login = (req, res) => {
  res.json({
    message: "log in successfully",
    user: { id: req.user.id, email: req.user.email, role: req.user.role },
  });
};

exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.session.destroy();
    res.clearCookie("connect.sid");
    res.json({ message: "log out successfully" });
  });
};
