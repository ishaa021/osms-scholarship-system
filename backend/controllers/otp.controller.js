const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const OTP = require('../models/OTP.model');
const Student = require('../models/Student.model');
const Admin = require('../models/Admin.model');
const { sendOTPEmail } = require('../config/mailer');

// Helper: generate JWT token
const generateToken = (id, userType) =>
  jwt.sign({ id, userType }, process.env.JWT_SECRET, { expiresIn: '7d' });

// Helper: generate a 6-digit random OTP
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// ─────────────────────────────────────────────────────────
// @desc    Send OTP to email
// @route   POST /api/auth/otp/send
// @access  Public
// ─────────────────────────────────────────────────────────
exports.sendOTP = async (req, res) => {
  try {
    const { email, userType } = req.body;

    if (!email || !userType) {
      return res.status(400).json({ message: 'Email and userType are required' });
    }
    if (!['student', 'admin'].includes(userType)) {
      return res.status(400).json({ message: 'userType must be student or admin' });
    }

    // 1. Check if user actually exists
    const Model = userType === 'admin' ? Admin : Student;
    const user = await Model.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        message: `No ${userType} account found with this email`,
      });
    }

    // 2. Delete any previous OTP for this email
    await OTP.deleteMany({ email: email.toLowerCase(), userType });

    // 3. Generate OTP and hash it
    const otp = generateOTP();
    const otpHash = await bcrypt.hash(otp, 10);

    // 4. Save OTP (expires in 5 minutes)
    await OTP.create({
      email: email.toLowerCase(),
      otpHash,
      userType,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    // 5. Send email
    await sendOTPEmail(email, otp);

    res.json({ message: `OTP sent to ${email}` });
  } catch (err) {
    console.error('sendOTP error:', err);
    res.status(500).json({ message: 'Failed to send OTP', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────
// @desc    Verify OTP and login user
// @route   POST /api/auth/otp/verify
// @access  Public
// ─────────────────────────────────────────────────────────
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp, userType } = req.body;

    if (!email || !otp || !userType) {
      return res.status(400).json({ message: 'Email, OTP, and userType are required' });
    }

    // 1. Find OTP record
    const otpRecord = await OTP.findOne({
      email: email.toLowerCase(),
      userType,
    });

    if (!otpRecord) {
      return res.status(400).json({ message: 'OTP not found. Please request a new one.' });
    }

    // 2. Check expiry
    if (otpRecord.expiresAt < new Date()) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    // 3. Compare OTP with hash
    const isMatch = await bcrypt.compare(otp, otpRecord.otpHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
    }

    // 4. OTP is valid — delete it (one-time use)
    await OTP.deleteOne({ _id: otpRecord._id });

    // 5. Find the user and return JWT
    const Model = userType === 'admin' ? Admin : Student;
    const user = await Model.findOne({ email: email.toLowerCase() }).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const token = generateToken(user._id, userType);

    res.json({
      message: 'OTP verified successfully',
      token,
      [userType]: {
        id: user._id,
        name: user.name,
        email: user.email,
        institutionName: user.institutionName,
        ...(userType === 'student' && { enrollmentNumber: user.enrollmentNumber }),
      },
    });
  } catch (err) {
    console.error('verifyOTP error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};