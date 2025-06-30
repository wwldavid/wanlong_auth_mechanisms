const jwt = require("jsonwebtoken");

// issue a short-lived access token with a payload containing the user ID and role.
function generateAccessToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });
}

// issue a long-lived refresh token with a payload containing only the user ID
function generateRefreshToken(user) {
  return jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

// verify and decode the token
function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
};
