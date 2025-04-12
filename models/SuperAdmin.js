const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const SuperAdminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  lastLogin: Date,
  roles: { type: [String], default: ['super_admin'] },
  status: { type: String, enum: ['active', 'suspended'], default: 'active' }
});

SuperAdminSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

module.exports = mongoose.model('SuperAdmin', SuperAdminSchema);