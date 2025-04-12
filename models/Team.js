const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const TeamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  tags: [String],
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  superUser: { type: mongoose.Schema.Types.ObjectId, ref: 'SuperUser' },
  tenant_id: { type: String, required: true, ref: 'SuperUser' },
  status: { type: String, enum: ['active', 'suspended'], default: 'active' }
});

module.exports = mongoose.model('Team', TeamSchema);