const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const SuperUser = require('../models/SuperUser');
const User = require('../models/User');
const { sendVerificationEmail, sendLoginOTP } = require('../utils/email');

const register = async (req, res) => {
  try {
    const { name, email, password, orgName } = req.body;

    if (!name || !email || !password || !orgName) {
      throw new Error('All fields are required');
    }

    const tenant_id = uuidv4();
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    const superuser = new SuperUser({
      name,
      email,
      password,
      orgName,
      tenant_id,
      verificationCode
    });

    await superuser.save();
    await sendVerificationEmail(email, verificationCode);

    res.status(201).send({
      message: 'Registration successful. Please check your email for verification.'
    });
  } catch (error) {
    res.status(400).send({
      error: error.message,
      code: 'REGISTRATION_FAILED'
    });
  }
};
const verifyEmail = async (req, res) => {
  try {
    const { email, verificationCode } = req.body;

    if (!email || !verificationCode) {
      throw new Error('Email and verification code are required');
    }

    const superuser = await SuperUser.findOne({ email });

    if (!superuser) {
      throw new Error('User not found');
    }

    if (superuser.verificationCode !== verificationCode) {
      throw new Error('Invalid verification code');
    }

    superuser.emailVerified = true;
    superuser.verificationCode = undefined;
    await superuser.save();

    res.send({
      message: 'Email verified successfully',
      code: 'EMAIL_VERIFIED'
    });
  } catch (error) {
    res.status(400).send({
      error: error.message,
      code: 'EMAIL_VERIFICATION_FAILED'
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const superuser = await SuperUser.findOne({ email });
    if (!superuser) {
      throw new Error('Invalid login credentials');
    }

    // Check if account is locked due to too many attempts
    if (superuser.loginAttempts >= 5 && new Date() < new Date(superuser.lastLoginAttempt.getTime() + 15 * 60 * 1000)) {
      throw new Error('Account temporarily locked. Try again later.');
    }

    const isMatch = await bcrypt.compare(password, superuser.password);
    if (!isMatch) {
      superuser.loginAttempts += 1;
      superuser.lastLoginAttempt = new Date();
      await superuser.save();
      throw new Error('Invalid login credentials');
    }

    // Reset login attempts on successful password match
    superuser.loginAttempts = 0;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    superuser.loginOTP = otp;
    await superuser.save();

    await sendLoginOTP(email, otp);

    res.send({
      message: 'OTP sent to your email',
      code: 'OTP_SENT'
    });
  } catch (error) {
    res.status(400).send({
      error: error.message,
      code: 'LOGIN_FAILED'
    });
  }
};

const requestOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email }) || await SuperUser.findOne({ email });
    if (!user) {
      throw new Error('User not found');
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.loginOTP = otp;
    await user.save();

    // Send OTP email
    await sendLoginOTP(email, otp);

    res.send({ message: 'OTP sent to your email' });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      throw new Error('Email and OTP are required');
    }
      const user = await SuperUser.findOne({ email });
    if (!user) {
      throw new Error('Invalid OTP');
    }
    user.loginOTP = undefined;
    await user.save();
    const token = jwt.sign(
      {
        _id: user._id,
        tenant_id: user.tenant_id,
        email:user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { _id: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    res.send({
      token,
      refreshToken,
      name:user.name,
      role:user.role,
      message: 'Authentication successful',
      code: 'AUTH_SUCCESS'
    });
  } catch (error) {
    res.status(400).send({
      error: error.message,
      code: 'OTP_VERIFICATION_FAILED'
    });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const user = await User.findById(decoded._id) ||
      await SuperUser.findById(decoded._id);

    if (!user) {
      throw new Error('Invalid refresh token');
    }

    const token = jwt.sign(
      {
        _id: user._id,
        tenant_id: user.tenant_id,
        role: user.roles ? user.roles[0] : 'user'
      },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.send({ token });
  } catch (error) {
    res.status(401).send({ error: 'Invalid refresh token' });
  }
};

const changePassword = async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;

    const user = await User.findOne({ email }) ||
      await SuperUser.findOne({ email });

    if (!user) {
      throw new Error('User not found');
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new Error('Current password is incorrect');
    }

    user.password = newPassword;
    await user.save();

    res.send({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

module.exports = {
  register,
  verifyEmail,
  login,
  requestOTP,
  verifyOTP,
  refreshToken,
  changePassword
};