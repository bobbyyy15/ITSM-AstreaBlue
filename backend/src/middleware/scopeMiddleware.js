const normalizeRole = (role = "") => {
  return role.toString().toLowerCase().replace(/[\s_-]/g, "");
};

const isSuperAdmin = (role = "") => normalizeRole(role) === "superadmin";
const isAdmin = (role = "") => normalizeRole(role) === "admin";
const isTechnician = (role = "") => normalizeRole(role) === "technician";
const isServiceRequestRole = (role = "") =>
  isSuperAdmin(role) || isAdmin(role) || isTechnician(role);

export const scopeMiddleware = (req, res, next) => {
  const role = req.user?.role;
  const branchId = req.user?.branchId;

  if (!role) {
    return res.status(403).json({ message: "User role is missing" });
  }

  if (!isServiceRequestRole(role)) {
    return res.status(403).json({
      message: "Access denied. User is not permitted to access service request resources.",
    });
  }

  if (isSuperAdmin(role)) {
    req.branchScope = {};
    return next();
  }

  if (!branchId) {
    return res.status(403).json({
      message: "Branch access denied. User has no branch assigned.",
    });
  }

  req.branchScope = {
    branchId,
  };

  next();
};