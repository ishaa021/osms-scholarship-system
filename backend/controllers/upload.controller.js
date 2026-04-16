const Application = require('../models/Application.model');
const { cloudinary } = require('../config/cloudinary');
const Notification = require('../models/Notification.model');

// ─────────────────────────────────────────────────────────
// @desc    Student uploads documents to an application
// @route   POST /api/upload/documents/:applicationId
// @access  Student only
// ─────────────────────────────────────────────────────────
exports.uploadDocuments = async (req, res) => {
  try {
    const { applicationId } = req.params;

    // Multer already uploaded files to Cloudinary — they're in req.files
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Ownership check
    if (application.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Prevent uploading to already-decided applications
    if (['approved', 'rejected'].includes(application.status)) {
      return res.status(400).json({
        message: 'Cannot upload documents to an already decided application',
      });
    }

    // Build document objects from uploaded files
    // req.files is array from multer — each item has: fieldname, originalname, path (cloudinary url), filename (public_id)
    const newDocs = req.files.map((file) => ({
       name: file.originalname,
       url: file.path,          // Cloudinary secure URL
      publicId: file.filename, // Cloudinary public_id
      status: 'pending',
    }));

    // Merge: replace existing doc with same name, or add new
    newDocs.forEach((newDoc) => {
      const existingIndex = application.documents.findIndex(
        (d) => d.name === newDoc.name
      );
      if (existingIndex >= 0) {
        application.documents[existingIndex] = newDoc; // replace
      } else {
        application.documents.push(newDoc); // add new
      }
    });

    // Move to under_review once documents are uploaded
    if (application.status === 'pending') {
      application.status = 'under_review';
    }

    await application.save();

    res.json({
      message: 'Documents uploaded successfully',
      documents: application.documents,
      status: application.status,
    });
  } catch (err) {
    console.error('uploadDocuments error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────
// @desc    Admin updates status of a single document
// @route   PATCH /api/upload/documents/:applicationId/:documentId
// @access  Admin only
// ─────────────────────────────────────────────────────────
exports.updateDocumentStatus = async (req, res) => {
  try {
  
    const { applicationId, documentId } = req.params;
    const { status, adminNote } = req.body;

    if (!['verified', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Invalid document status' });
    }

    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Institution guard
    if (application.institution !== req.user.institutionName) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Find the document inside the application
    const doc = application.documents.id(documentId);
    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }

    doc.status = status;
    if (adminNote) doc.adminNote = adminNote;

    await application.save();

    res.json({
      message: `Document marked as ${status}`,
      document: doc,
    });
  } catch (err) {
    console.error('updateDocumentStatus error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────
// @desc    Get single application with documents (for admin verify page)
// @route   GET /api/upload/application/:id
// @access  Admin only
// ─────────────────────────────────────────────────────────
exports.getApplicationWithDocs = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('student', 'name email enrollmentNumber')
      .populate('scholarship', 'title amount requiredDocuments');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.institution !== req.user.institutionName) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json({ application });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};