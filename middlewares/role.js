module.exports = (requiredRole, allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).send('Access denied. User not authenticated.');
    }

    if (req.user.role.roleName !== requiredRole && !allowedRoles.includes(req.user.role.roleName)) {
      return res.status(403).send('Access denied. Insufficient permissions.');
    }

    next();
  };
};
