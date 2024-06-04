const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const auth = require('../middlewares/auth');
const checkPermission = require('../middlewares/checkPermission');

// Role routes
router.post('/roles', auth, checkPermission('roles', 'create'), roleController.createRole);
router.get('/roles', auth, checkPermission('roles', 'read'), roleController.getRoles);
router.put('/roles/:id', auth, checkPermission('roles', 'update'), roleController.updateRole);
router.delete('/roles/:id', auth, checkPermission('roles', 'delete'), roleController.deleteRole);
router.post('/roles/:id/addModule', auth, checkPermission('roles', 'update'), roleController.addAccessModule);
router.post('/roles/:id/removeModule', auth, checkPermission('roles', 'update'), roleController.removeAccessModule);

module.exports = router;
