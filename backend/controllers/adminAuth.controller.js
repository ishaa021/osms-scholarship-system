const Admin = require('../models/Admin.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// generate token
const generateToken = (id, userType) =>
  jwt.sign({ id, userType }, process.env.JWT_SECRET, { expiresIn: '7d' });


exports.registerAdmin = async (req, res) => {
  try {
    const { name, email, phone, institutionName, password } = req.body;

  
    const exists = await Admin.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Admin already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await Admin.create({
      name,
      email,
      phone,
      institutionName,
      password: hashedPassword,
    });

    res.status(201).json({
      message: 'Admin registered successfully',
      token: generateToken(admin._id, 'admin'),
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        institutionName: admin.institutionName,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: 'Admin not found' });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    res.json({
      message: 'Login successful',
      token: generateToken(admin._id, 'admin'),
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        institutionName: admin.institutionName,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


exports.getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select('-password');
    res.json(admin);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};