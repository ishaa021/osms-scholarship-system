const mongoose = require('mongoose');

// Sub-schema for each uploaded document
const documentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    // e.g. "Income Certificate", "Marksheet", etc.
  },
  url: {
    type: String,
    required: true,
    // Cloudinary URL
  },
  publicId: {
    // Cloudinary public_id — needed if you want to delete from Cloudinary later
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending',
  },
  adminNote: {
    // Admin can add a note when rejecting a specific document
    type: String,
    default: '',
  },
}, { _id: true });

const applicationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    scholarship: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Scholarship',
      required: true,
    },
    institution: {
      type: String,
      required: true,
    },

    // ── UPGRADED: richer status ──────────────────────────
    status: {
      type: String,
      enum: ['pending', 'under_review', 'approved', 'rejected', 'withdrawn'],
      default: 'pending',
    },

    // ── NEW: uploaded documents ──────────────────────────
    documents: [documentSchema],

    adminRemark: {
      type: String,
      default: '',
    },

    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Prevent duplicate applications — one student per scholarship
applicationSchema.index({ student: 1, scholarship: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);