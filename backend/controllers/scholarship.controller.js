const Scholarship = require('../models/Scholarship.model');

exports.createScholarship = async (req, res) => {
  try {
    const {
      title,
      description,
      eligibility,
      requiredDocuments,
      deadline,
      amount,
      organizationName,
      type,
      applyUrl,
    } = req.body;

    // Validate: applyUrl required for external scholarships
    if (type === 'external' && !applyUrl) {
      return res.status(400).json({
        message: 'applyUrl is required for external scholarships',
      });
    }

    const scholarship = await Scholarship.create({
      title,
      description,
      eligibility,
      requiredDocuments: requiredDocuments || [],
      deadline,
      amount,
      organizationName,
      type,
      applyUrl: type === 'external' ? applyUrl : undefined,
      institution: req.user.institutionName,  // Auto-attached from admin's profile
      createdBy: req.user._id,
    });

    res.status(201).json({
      message: 'Scholarship created successfully',
      scholarship,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


exports.getAllScholarships = async (req, res) => {
  try {
    // Build base filter by institution
    const filter = { institution: req.user.institutionName, isActive: true };

    // Optional: filter by type  ?type=internal or ?type=external
    if (req.query.type && ['internal', 'external'].includes(req.query.type)) {
      filter.type = req.query.type;
    }

    // Optional: search by title  ?search=merit
    if (req.query.search) {
      filter.title = { $regex: req.query.search, $options: 'i' };
    }

    // Optional: filter only active (deadline not passed)
    if (req.query.active === 'true') {
      filter.deadline = { $gte: new Date() };
    }

    const scholarships = await Scholarship.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      count: scholarships.length,
      scholarships,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getScholarshipById = async (req, res) => {
  try {
    const scholarship = await Scholarship.findById(req.params.id).populate(
      'createdBy',
      'name email institutionName'
    );

    if (!scholarship) {
      return res.status(404).json({ message: 'Scholarship not found' });
    }

    // Institution guard — prevent cross-institution access
    if (scholarship.institution !== req.user.institutionName) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ scholarship });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


exports.updateScholarship = async (req, res) => {
  try {
    const scholarship = await Scholarship.findById(req.params.id);

    if (!scholarship) {
      return res.status(404).json({ message: 'Scholarship not found' });
    }

    // Only the admin who created it (or same institution) can update
    if (scholarship.institution !== req.user.institutionName) {
      return res.status(403).json({ message: 'Not authorized to update this scholarship' });
    }

    // If changing type to external, applyUrl becomes required
    const newType = req.body.type || scholarship.type;
    if (newType === 'external' && !req.body.applyUrl && !scholarship.applyUrl) {
      return res.status(400).json({ message: 'applyUrl is required for external scholarships' });
    }

    const updatedScholarship = await Scholarship.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Scholarship updated successfully',
      scholarship: updatedScholarship,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteScholarship = async (req, res) => {
  try {
    const scholarship = await Scholarship.findById(req.params.id);

    if (!scholarship) {
      return res.status(404).json({ message: 'Scholarship not found' });
    }

    if (scholarship.institution !== req.user.institutionName) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Soft delete — keeps data but hides from students
    scholarship.isActive = false;
    await scholarship.save();

    res.json({ message: 'Scholarship removed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


exports.getScholarshipStats = async (req, res) => {
  try {
    const institution = req.user.institutionName;

    const [total, internal, external, active] = await Promise.all([
      Scholarship.countDocuments({ institution }),
      Scholarship.countDocuments({ institution, type: 'internal' }),
      Scholarship.countDocuments({ institution, type: 'external' }),
      Scholarship.countDocuments({ institution, isActive: true, deadline: { $gte: new Date() } }),
    ]);

    res.json({ total, internal, external, active });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};