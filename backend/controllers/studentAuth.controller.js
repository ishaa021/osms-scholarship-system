const Student = require('../models/Student.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (id, userType) =>
  jwt.sign({ id, userType }, process.env.JWT_SECRET, { expiresIn: '7d' });

// @route  POST /api/auth/student/register
exports.registerStudent = async (req, res) => {
  try {
    const { name, email, enrollmentNumber, institutionName, password } = req.body;

    const exists = await Student.findOne({
      $or: [{ email }, { enrollmentNumber }],
    });
    if (exists)
      return res.status(400).json({ message: 'Student already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const student = await Student.create({
      name,
      email,
      enrollmentNumber,
      institutionName,
      password: hashedPassword,
    });

    res.status(201).json({
      message: 'Student registered successfully',
      token: generateToken(student._id, 'student'),
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        enrollmentNumber: student.enrollmentNumber,
        institutionName: student.institutionName,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @route  POST /api/auth/student/login
exports.loginStudent = async (req, res) => {
  try {
    const { email, password } = req.body;

    const student = await Student.findOne({ email });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    res.json({
      message: 'Login successful',
      token: generateToken(student._id, 'student'),
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        enrollmentNumber: student.enrollmentNumber,
        institutionName: student.institutionName,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @route  GET /api/auth/student/me  (protected)
exports.getStudentProfile = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id).select('-password');
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};