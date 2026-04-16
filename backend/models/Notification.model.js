const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      // Can be Student or Admin — we use refPath for dynamic population
      refPath: 'userType',
    },
    userType: {
      type: String,
      required: true,
      enum: ['Student', 'Admin'],
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      // Category of notification — useful for frontend icons
      type: String,
      enum: ['application_approved', 'application_rejected', 'new_application', 'general'],
      default: 'general',
    },
    relatedApplication: {
      // Link to the application this notification is about
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);