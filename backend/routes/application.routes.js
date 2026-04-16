const express = require('express');
const router = express.Router();

const {
  applyForScholarship,
  getMyApplications,
  getAllApplications,
  updateApplicationStatus,
  withdrawApplication,
  getApplicationStats,
} = require('../controllers/application.controller');

const { protect, adminOnly, studentOnly } = require('../middleware/auth.middleware');

// Stats — must come before /:id to avoid param collision
router.get('/stats', protect, adminOnly, getApplicationStats);

// Student routes
router.post('/',                   protect, studentOnly, applyForScholarship);
router.get('/my',                  protect, studentOnly, getMyApplications);
router.patch('/:id/withdraw',      protect, studentOnly, withdrawApplication);

// Admin routes
router.get('/',                    protect, adminOnly, getAllApplications);
router.patch('/:id',               protect, adminOnly, updateApplicationStatus);

module.exports = router;