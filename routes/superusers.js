const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const superAdminController = require('../controllers/superuserController');

router.post('/teams', auth, superAdminController.createTeam);
router.get('/teams', auth, superAdminController.getTeams);
router.get('/teams/:id', auth, superAdminController.getTeam);
router.patch('/teams/:id', auth, superAdminController.updateTeam);
router.delete('/teams/:id', auth, superAdminController.deleteTeam);

router.post('/users', auth, superAdminController.createUser);
router.get('/users', auth, superAdminController.getUsers);
router.get('/users/:id', auth, superAdminController.getUser);
router.patch('/users/:id', auth, superAdminController.updateUser);
router.delete('/users/:id', auth, superAdminController.deleteUser);

module.exports = router;