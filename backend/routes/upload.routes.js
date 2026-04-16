const express = require('express');
const router = express.Router();

const {
  uploadDocuments,
  updateDocumentStatus,
  getApplicationWithDocs,
} = require('../controllers/upload.controller');

const { protect, adminOnly, studentOnly } = require('../middleware/auth.middleware');
const { upload } = require('../config/cloudinary');

// Student uploads documents (multiple files, up to 5)
// Field name in FormData can be anything — we use it as the document name
// POST /api/upload/documents/:applicationId
router.post(
  '/documents/:applicationId',
  protect,
  studentOnly,
  upload.array('files', 5),
  uploadDocuments
);

// Admin verifies or rejects a single document
// PATCH /api/upload/documents/:applicationId/:documentId
router.patch(
  '/documents/:applicationId/:documentId',
  protect,
  adminOnly,
  updateDocumentStatus
);

// Admin fetches a single application with all documents populated
// GET /api/upload/application/:id
router.get(
  '/application/:id',
  protect,
  adminOnly,
  getApplicationWithDocs
);

module.exports = router;