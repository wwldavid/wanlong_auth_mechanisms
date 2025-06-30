const express = require("express");
const router = express.Router();
const { ensureAuthenticated, requireRole } = require("../middleware/auth");
const verifyJWT = require("../middleware/jwtAuth");

// /api/profile accessible to all logged-in users
// router.get("/profile", ensureAuthenticated, (req, res) => {
//   res.json({
//     id: req.user.id,
//     email: req.user.email,
//     role: req.user.role,
//   });
// });

// /api/admin only admin could access
// router.get("/admin", ensureAuthenticated, requireRole("admin"), (req, res) => {
//   res.json({ secret: "This data is only read by admin" });
// });

// /api/dashboard display different content according to user roles
router.get("/dashboard", ensureAuthenticated, (req, res) => {
  if (req.user.role === "admin") {
    return res.json({ dashboard: "admin dashboard" });
  } else {
    return res.json({ dashboard: "user dashboard" });
  }
});

// 只要持有有效 access_token，就可以访问
router.get("/profile", verifyJWT, (req, res) => {
  res.json({
    id: req.user.id,
    email: req.user.email,
    role: req.user.role,
  });
});

// 只有 admin 角色才能访问
router.get("/admin", verifyJWT, requireRole("admin"), (req, res) => {
  res.json({ secret: "只有 admin 能看到我" });
});

// 演示一个仅 JWT 验证的专用路由
router.get("/jwt-only", verifyJWT, (req, res) => {
  res.json({ msg: "你已通过 JWT 验证" });
});

module.exports = router;
