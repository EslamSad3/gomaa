const SuperAdmin = require('../models/SuperAdmin');
const User = require('../models/User');
const Team = require('../models/Team');

const superAdminController = {
  // Get all super admins
  getAllSuperAdmins: async (req, res) => {
    try {
      const superAdmins = await SuperAdmin.find({});
      res.status(200).json(superAdmins);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update super admin status
  updateSuperAdminStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const superAdmin = await SuperAdmin.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );
      
      if (!superAdmin) {
        return res.status(404).json({ error: 'Super admin not found' });
      }
      
      res.status(200).json(superAdmin);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get all users
  getAllUsers: async (req, res) => {
    try {
      const users = await User.find({});
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update user status
  updateUserStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const user = await User.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get all teams
  getAllTeams: async (req, res) => {
    try {
      const teams = await Team.find({});
      res.status(200).json(teams);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update team status
  updateTeamStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const team = await Team.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );
      
      if (!team) {
        return res.status(404).json({ error: 'Team not found' });
      }
      
      res.status(200).json(team);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = superAdminController;