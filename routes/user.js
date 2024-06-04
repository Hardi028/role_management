const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middlewares/auth');
const checkPermission = require('../middlewares/checkPermission');

// User routes
router.post('/signup', userController.signup);
router.post('/login', userController.login);

router.put('/users/updateBulk', auth, checkPermission('users', 'update'), userController.bulkUpdateUsers);
router.put('/users/bulkUpdateDifferent', auth, checkPermission('users', 'update'), userController.bulkUpdateUsersWithDifferentData);
router.put('/users/me', auth, userController.updateOwnProfile);
router.get('/users/:userId/access/:moduleId', auth, userController.checkAccess);
router.get('/users', auth, checkPermission('users', 'read'), userController.getUsers);
router.put('/users/:id', auth, checkPermission('users', 'update'), userController.updateUser);
router.delete('/users/:id', auth, checkPermission('users', 'delete'), userController.deleteUser);

module.exports = router;
