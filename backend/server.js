const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ── Existing Routes ───────────────────────────────────────
app.use('/api/auth/admin',   require('./routes/adminAuth.routes'));
app.use('/api/auth/student', require('./routes/studentAuth.routes'));
app.use('/api/scholarships', require('./routes/scholarship.routes'));
app.use('/api/applications', require('./routes/application.routes'));
app.use('/api/notifications',require('./routes/notification.routes'));

// ── NEW Routes ────────────────────────────────────────────
app.use('/api/auth/otp',     require('./routes/otp.routes'));      // OTP login
app.use('/api/upload',       require('./routes/upload.routes'));    // Document upload

// Static serve for local uploads (fallback if not using Cloudinary)
app.use('/uploads', express.static('uploads'));

// Health check
app.get('/', (req, res) => res.json({ message: 'OSMS API running ✅' }));

// Connect DB + Start Server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');

 const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
  })
  .catch((err) => console.error('❌ DB connection error:', err));