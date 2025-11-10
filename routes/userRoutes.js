const express = require('express');
const userController = require('../controllers/userController');
const router = express.Router();

// Routes principales CRUD
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

// Routes spécifiques
router.get('/email/:email', userController.getUserByEmail);
router.get('/role/:role', userController.getUsersByRole);
router.get('/teachers/courses', userController.getTeachersWithCourses);
router.patch('/:id/status', userController.updateUserStatus);
router.get('/stats/overview', userController.getUserStats);
router.get('/search/:term', userController.searchUsers);
router.post('/:id/reassign-courses', userController.reassignUserCourses);

module.exports = router;