const express = require('express');
const router = express.Router();
const { sendOTP, verifyOTP } = require('../controllers/otp.controller');

// POST /api/auth/otp/send   → send OTP email
// POST /api/auth/otp/verify → verify OTP + return JWT
router.post('/send',   sendOTP);
router.post('/verify', verifyOTP);

module.exports = router;