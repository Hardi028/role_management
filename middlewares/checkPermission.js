const User = require('../models/user');

const checkPermission = (moduleId, permission) => async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate('role');

    if (!user) {
      return res.status(404).send('User not found.');
    }

    const accessModule = user.role.accessModules.find(module => module.moduleId === moduleId);

    if (accessModule && accessModule.permissions.includes(permission)) {
      next();
    } else {
      res.status(403).send({ message: `User does not have ${permission} access to module: ${moduleId}` });
    }
  } catch (err) {
    res.status(500).send(err);
  }
};

module.exports = checkPermission;
