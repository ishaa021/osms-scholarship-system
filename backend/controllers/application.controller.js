const Application = require('../models/Application.model');
const Scholarship = require('../models/Scholarship.model');
const Notification = require('../models/Notification.model');
const Admin = require('../models/Admin.model');

// Helper: create a notification
const createNotification = async ({ userId, userType, message, type, relatedApplication }) => {
  await Notification.create({ userId, userType, message, type, relatedApplication });
};

// ─────────────────────────────────────────────────────────
// @desc    Student applies for a scholarship
// @route   POST /api/applications
// @access  Student only
// ─────────────────────────────────────────────────────────
exports.applyForScholarship = async (req, res) => {
  try {
    const { scholarshipId } = req.body;
    const studentId = req.user._id;

    const scholarship = await Scholarship.findById(scholarshipId);
    if (!scholarship || !scholarship.isActive) {
      return res.status(404).json({ message: 'Scholarship not found or no longer active' });
    }

    if (scholarship.type === 'external') {
      return res.status(400).json({
        message: 'External scholarships cannot be applied here. Use the provided apply URL.',
      });
    }

    if (scholarship.institution !== req.user.institutionName) {
      return res.status(403).json({
        message: 'You can only apply to scholarships from your institution',
      });
    }

    if (new Date(scholarship.deadline) < new Date()) {
      return res.status(400).json({ message: 'Scholarship deadline has passed' });
    }

    const alreadyApplied = await Application.findOne({ student: studentId, scholarship: scholarshipId });
    if (alreadyApplied) {
      return res.status(400).json({
        message: `You already applied for this scholarship. Status: ${alreadyApplied.status}`,
      });
    }

    const application = await Application.create({
      student: studentId,
      scholarship: scholarshipId,
      institution: req.user.institutionName,
      status: 'pending',
      documents: [],
    });

    // Notify admin
    const admin = await Admin.findOne({ institutionName: req.user.institutionName });
    if (admin) {
      await createNotification({
        userId: admin._id,
        userType: 'Admin',
        message: `New application received from ${req.user.name} for "${scholarship.title}"`,
        type: 'new_application',
        relatedApplication: application._id,
      });
    }

    const populated = await application.populate([
      { path: 'scholarship', select: 'title amount deadline type requiredDocuments' },
      { path: 'student', select: 'name email enrollmentNumber' },
    ]);

    res.status(201).json({ message: 'Application submitted successfully', application: populated });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'You have already applied for this scholarship' });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────
// @desc    Student views their own applications
// @route   GET /api/applications/my
// @access  Student only
// ─────────────────────────────────────────────────────────
exports.getMyApplications = async (req, res) => {
  try {
    const filter = { student: req.user._id };
    if (req.query.status) filter.status = req.query.status;

    const applications = await Application.find(filter)
      .populate('scholarship', 'title amount deadline type organizationName description requiredDocuments')
      .sort({ appliedAt: -1 });

    res.json({ count: applications.length, applications });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────
// @desc    Admin views all applications from their institution
// @route   GET /api/applications
// @access  Admin only
// ─────────────────────────────────────────────────────────
exports.getAllApplications = async (req, res) => {
  try {
    const filter = { institution: req.user.institutionName };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.scholarshipId) filter.scholarship = req.query.scholarshipId;

    const applications = await Application.find(filter)
      .populate('student', 'name email enrollmentNumber')
      .populate('scholarship', 'title amount type deadline requiredDocuments')
      .sort({ appliedAt: -1 });

    res.json({ count: applications.length, applications });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────
// @desc    Admin updates application status (approve/reject)
// @route   PATCH /api/applications/:id
// @access  Admin only
// ─────────────────────────────────────────────────────────
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status, adminRemark } = req.body;

    if (!['approved', 'rejected', 'under_review'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const application = await Application.findById(req.params.id).populate('scholarship', 'title');
    if (!application) return res.status(404).json({ message: 'Application not found' });

    if (application.institution !== req.user.institutionName) {
      return res.status(403).json({ message: 'Not authorized to update this application' });
    }

    if (['approved', 'rejected'].includes(application.status)) {
      return res.status(400).json({
        message: `Application is already ${application.status}. Cannot update again.`,
      });
    }

    application.status = status;
    if (adminRemark) application.adminRemark = adminRemark;
    await application.save();

    // Send notification to student on approve/reject
    if (['approved', 'rejected'].includes(status)) {
      let notificationMessage = '';
      let notificationType = '';

      if (status === 'approved') {
        notificationMessage = `🎉 Congratulations! Your application for "${application.scholarship.title}" has been approved. Please visit the college office with your original documents and bank details for final verification.`;
        notificationType = 'application_approved';
      } else {
        notificationMessage = `Your application for "${application.scholarship.title}" has been reviewed. Unfortunately, it was not approved this time.`;
        if (adminRemark) notificationMessage += ` Reason: ${adminRemark}`;
        notificationType = 'application_rejected';
      }

      await createNotification({
        userId: application.student,
        userType: 'Student',
        message: notificationMessage,
        type: notificationType,
        relatedApplication: application._id,
      });
    }

    const updated = await application.populate('student', 'name email enrollmentNumber');
    res.json({ message: `Application ${status} successfully`, application: updated });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────
// @desc    Student withdraws a pending application
// @route   PATCH /api/applications/:id/withdraw
// @access  Student only
// ─────────────────────────────────────────────────────────
exports.withdrawApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ message: 'Application not found' });

    if (application.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (!['pending', 'under_review'].includes(application.status)) {
      return res.status(400).json({
        message: `Cannot withdraw — application is already ${application.status}`,
      });
    }

    application.status = 'withdrawn';
    await application.save();
    res.json({ message: 'Application withdrawn successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────
// @desc    Admin gets application stats for dashboard
// @route   GET /api/applications/stats
// @access  Admin only
// ─────────────────────────────────────────────────────────
exports.getApplicationStats = async (req, res) => {
  try {
    const institution = req.user.institutionName;
    const [total, pending, under_review, approved, rejected, withdrawn] = await Promise.all([
      Application.countDocuments({ institution }),
      Application.countDocuments({ institution, status: 'pending' }),
      Application.countDocuments({ institution, status: 'under_review' }),
      Application.countDocuments({ institution, status: 'approved' }),
      Application.countDocuments({ institution, status: 'rejected' }),
      Application.countDocuments({ institution, status: 'withdrawn' }),
    ]);
    res.json({ total, pending, under_review, approved, rejected, withdrawn });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};