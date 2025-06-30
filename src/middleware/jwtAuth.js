const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Verify the access token and attach the user info to req.user
async function verifyJWT(req, res, next) {
  // Extract the access token from the HttpOnly cookie
  const token = req.cookies["access_token"];
  if (!token) {
    return res.status(401).json({ message: "No access token provided" });
  }
  try {
    // Verify and decode
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Check the database to ensure the user is still valid
    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user) {
      return res.status(401).json({ message: "Invalid token: user not found" });
    }

    // Attach the user to the request object so downstream routes can use it
    req.user = { id: user.id, email: user.email, role: user.role };
    next();
  } catch (err) {
    console.error("JWT verification error:", err);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
}

module.exports = verifyJWT;
