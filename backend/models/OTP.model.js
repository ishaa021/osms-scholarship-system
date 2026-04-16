const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
  },
  // We store a bcrypt hash of the OTP — never raw
  otpHash: {
    type: String,
    required: true,
  },
  userType: {
    // We need to know which model to look up on verification
    type: String,
    enum: ['student', 'admin'],
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  // Auto-delete expired OTPs from MongoDB after expiry
}, { timestamps: true });

// TTL index — MongoDB auto-deletes documents after expiresAt
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('OTP', otpSchema);