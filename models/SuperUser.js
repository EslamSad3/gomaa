const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const SuperUserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  orgName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  tenant_id: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  lastLogin: Date,
  lastLoginAttempt: Date,
  loginAttempts: { type: Number, default: 0 },
  mfaEnabled: { type: Boolean, default: false },
  teams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team' }],
  contactSupport: { type: Boolean, default: true },
  domains: [String],
  ips: [String],
  tags: [String],
  role: { type: String, default: 'super_admin' },
  status: { type: String, enum: ['active', 'suspended'], default: 'active' },
  emailVerified: { type: Boolean, default: false },
  verificationCode: {type:String , default : undefined},
  loginOTP: {type:String, default : undefined},
  loginOTPExpires: {type: Date, default: undefined},
});

SuperUserSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  if (this.isModified('loginOTP') && this.loginOTP) {
    this.loginOTPExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiration
  }
  next();
});

module.exports = mongoose.model('SuperUser', SuperUserSchema);