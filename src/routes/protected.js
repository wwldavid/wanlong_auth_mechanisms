const express = require("express");
const router = express.Router();
const { ensureAuthenticated, requireRole } = require("../middleware/auth");

// /api/profile accessible to all logged-in users
router.get("/profile", ensureAuthenticated, (req, res) => {
  res.json({
    id: req.user.id,
    email: req.user.email,
    role: req.user.role,
  });
});

// /api/admin only admin could access
router.get("/admin", ensureAuthenticated, requireRole("admin"), (req, res) => {
  res.json({ secret: "This data is only read by admin" });
});

// /api/dashboard display different content according to user roles
router.get("/dashboard", ensureAuthenticated, (req, res) => {
  if (req.user.role === "admin") {
    return res.json({ dashboard: "admin dashboard" });
  } else {
    return res.json({ dashboard: "user dashboard" });
  }
});

module.exports = router;
