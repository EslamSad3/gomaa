const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const userController = require('../controllers/userController');

router.get('/me', auth, userController.getMe);
router.patch('/me', auth, userController.updateMe);
router.get('/:id', auth, userController.getUser);

module.exports = router;