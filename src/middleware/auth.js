function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: "Please log in firstly" });
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res
        .status(403)
        .json({
          message: "You do not have permission to access this resource.",
        });
    }
    next();
  };
}
module.exports = { ensureAuthenticated, requireRole };
