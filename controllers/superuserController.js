const Team = require('../models/Team');
const User = require('../models/User');

const createTeam = async (req, res) => {
  try {
    const team = new Team({
      ...req.body,
      tenant_id: req.tenant_id
    });
    
    await team.save();
    
    // Add team to superuser's teams array
    req.user.teams.push(team._id);
    await req.user.save();
    
    res.status(201).send(team);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

const getTeams = async (req, res) => {
  try {
    const teams = await Team.find({ tenant_id: req.tenant_id });
    res.send(teams);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

const getTeam = async (req, res) => {
  try {
    const team = await Team.findOne({
      _id: req.params.id,
      tenant_id: req.tenant_id
    }).populate('users');
    
    if (!team) {
      throw new Error('Team not found');
    }
    
    res.send(team);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

const updateTeam = async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'tags'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      throw new Error('Invalid updates!');
    }

    const team = await Team.findOne({
      _id: req.params.id,
      tenant_id: req.tenant_id
    });
    
    if (!team) {
      throw new Error('Team not found');
    }

    updates.forEach(update => team[update] = req.body[update]);
    await team.save();

    res.send(team);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

const deleteTeam = async (req, res) => {
  try {
    const team = await Team.findOneAndDelete({
      _id: req.params.id,
      tenant_id: req.tenant_id
    });
    
    if (!team) {
      throw new Error('Team not found');
    }
    
    // Remove team from users
    await User.updateMany(
      { _id: { $in: team.users } },
      { $pull: { teamId: team._id } }
    );
    
    // Remove team from superuser's teams array
    req.user.teams = req.user.teams.filter(
      teamId => teamId.toString() !== team._id.toString()
    );
    await req.user.save();
    
    res.send(team);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

const createUser = async (req, res) => {
  try {
    const user = new User({
      ...req.body,
      tenant_id: req.tenant_id
    });
    
    await user.save();
    
    // Add user to team if specified
    if (req.body.teamId) {
      const team = await Team.findOne({
        _id: req.body.teamId,
        tenant_id: req.tenant_id
      });
      
      if (team) {
        team.users.push(user._id);
        await team.save();
        
        user.teamId = team._id;
        await user.save();
      }
    }
    
    res.status(201).send(user);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find({ tenant_id: req.tenant_id }).populate('teamId');
    res.send(users);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

const getUser = async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.params.id,
      tenant_id: req.tenant_id
    }).populate('teamId');
    
    if (!user) {
      throw new Error('User not found');
    }
    
    res.send(user);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'email', 'password', 'tags', 'roles', 'status', 'teamId'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      throw new Error('Invalid updates!');
    }

    const user = await User.findOne({
      _id: req.params.id,
      tenant_id: req.tenant_id
    });
    
    if (!user) {
      throw new Error('User not found');
    }

    // Handle team changes
    if (updates.includes('teamId')) {
      // Remove from old team
      if (user.teamId) {
        const oldTeam = await Team.findById(user.teamId);
        if (oldTeam) {
          oldTeam.users = oldTeam.users.filter(
            userId => userId.toString() !== user._id.toString()
          );
          await oldTeam.save();
        }
      }
      
      // Add to new team
      if (req.body.teamId) {
        const newTeam = await Team.findOne({
          _id: req.body.teamId,
          tenant_id: req.tenant_id
        });
        
        if (newTeam) {
          newTeam.users.push(user._id);
          await newTeam.save();
        }
      }
    }

    updates.forEach(update => user[update] = req.body[update]);
    await user.save();

    res.send(user);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findOneAndDelete({
      _id: req.params.id,
      tenant_id: req.tenant_id
    });
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Remove user from team
    if (user.teamId) {
      const team = await Team.findById(user.teamId);
      if (team) {
        team.users = team.users.filter(
          userId => userId.toString() !== user._id.toString()
        );
        await team.save();
      }
    }
    
    res.send(user);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

module.exports = {
  createTeam,
  getTeams,
  getTeam,
  updateTeam,
  deleteTeam,
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser
};