const express = require('express');
const router = express.Router();
const { registerStudent, loginStudent, getStudentProfile } = require('../controllers/studentAuth.controller');
const { protect, studentOnly } = require('../middleware/auth.middleware');

router.post('/register', registerStudent);
router.post('/login', loginStudent);
router.get('/me', protect, studentOnly, getStudentProfile);

module.exports = router;