const mongoose = require('mongoose');

const scholarshipSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    eligibility: { type: String, required: true },
    requiredDocuments: [{ type: String }],   // e.g. ["Marksheet", "Income Certificate"]
    deadline: { type: Date, required: true },
    amount: { type: Number, required: true },
    organizationName: { type: String, required: true },
    type: {
      type: String,
      enum: ['internal', 'external'],
      required: true,
    },
    applyUrl: {
      type: String,
      // Required only when type is external (validated in controller)
    },
    institution: {
      type: String,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Scholarship', scholarshipSchema);