const express = require('express');
const router = express.Router();
const { registerAdmin, loginAdmin, getAdminProfile } = require('../controllers/adminAuth.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');

router.post('/register', registerAdmin);
router.post('/login', loginAdmin);
router.get('/me', protect, adminOnly, getAdminProfile);

module.exports = router;