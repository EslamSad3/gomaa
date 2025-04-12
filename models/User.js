const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  tenant_id: { type: String, required: true, ref: 'Team' },
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  emailVerified: { type: Boolean, default: false },
  verificationCode: String,
  loginOTP: String,
  createdAt: { type: Date, default: Date.now },
  lastLogin: Date,
  loginAttempts: { type: Number, default: 0 },
  roles: [String],
  status: { type: String, enum: ['active', 'suspended', 'pending'], default: 'pending' },
  tags: [String]
});

UserSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

module.exports = mongoose.model('User', UserSchema);