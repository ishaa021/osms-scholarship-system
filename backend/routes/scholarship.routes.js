const express = require('express');
const router = express.Router();

const {
  createScholarship,
  getAllScholarships,
  getScholarshipById,
  updateScholarship,
  deleteScholarship,
  getScholarshipStats,
} = require('../controllers/scholarship.controller');

const { protect, adminOnly } = require('../middleware/auth.middleware');

// Stats — must be before /:id to avoid being caught as an id param
router.get('/stats', protect, adminOnly, getScholarshipStats);

// Core CRUD
router.post('/', protect, adminOnly, createScholarship);
router.get('/', protect, getAllScholarships);                        // both admin & student
router.get('/:id', protect, getScholarshipById);                    // both admin & student
router.patch('/:id', protect, adminOnly, updateScholarship);
router.delete('/:id', protect, adminOnly, deleteScholarship);

module.exports = router;