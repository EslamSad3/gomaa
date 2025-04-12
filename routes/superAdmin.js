const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getAllSuperAdmins, updateSuperAdminStatus, getAllUsers, updateUserStatus, getAllTeams, updateTeamStatus } = require('../controllers/superAdminController');

// SuperAdmin routes
router.get('/super-admins', auth, getAllSuperAdmins);
router.patch('/super-admins/:id/status', auth, updateSuperAdminStatus);

// User management routes
router.get('/users', auth, getAllUsers);
router.patch('/users/:id/status', auth, updateUserStatus);

// Team management routes
router.get('/teams', auth, getAllTeams);
router.patch('/teams/:id/status', auth, updateTeamStatus);

module.exports = router;