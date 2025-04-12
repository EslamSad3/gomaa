const User = require('../models/User');
const Team = require('../models/Team');

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('teamId');
    if (!user) {
      throw new Error('User not found');
    }
    
    res.send(user);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

const updateMe = async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'email', 'password', 'tags'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      throw new Error('Invalid updates!');
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      throw new Error('User not found');
    }

    updates.forEach(update => user[update] = req.body[update]);
    await user.save();

    res.send(user);
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

module.exports = {
  getMe,
  updateMe,
  getUser
};