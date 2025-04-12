const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendVerificationEmail = async (email, verificationCode) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Email Verification',
      html: `<p>Your verification code is: <strong>${verificationCode}</strong></p>`
    });
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};

const sendLoginOTP = async (email, otp) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Login OTP',
      html: `<p>Your login OTP is: <strong>${otp}</strong></p>`
    });
  } catch (error) {
    console.error('Error sending login OTP:', error);
    throw error;
  }
};

module.exports = { sendVerificationEmail, sendLoginOTP };