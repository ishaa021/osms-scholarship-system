const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin.model');
const Student = require('../models/Student.model');

// Verify JWT and attach user to req
exports.protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer '))
      return res.status(401).json({ message: 'No token provided' });

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach correct user based on userType in token
    if (decoded.userType === 'admin') {
      req.user = await Admin.findById(decoded.id).select('-password');
    } else if (decoded.userType === 'student') {
      req.user = await Student.findById(decoded.id).select('-password');
    }

    if (!req.user) return res.status(401).json({ message: 'User not found' });

    req.user.userType = decoded.userType; // attach type for use in next middleware
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Allow only admins
exports.adminOnly = (req, res, next) => {
  if (req.user.userType !== 'admin')
    return res.status(403).json({ message: 'Admin access only' });
  next();
};

// Allow only students
exports.studentOnly = (req, res, next) => {
  if (req.user.userType !== 'student')
    return res.status(403).json({ message: 'Student access only' });
  next();
};