const Document = require('../models/Document');
const ActivityLog = require('../models/ActivityLog');
const path = require('path');
const fs = require('fs');

// Helper to remove file from disk safely
const deleteFileSafe = (fileName) => {
  if (!fileName) return;
  const filePath = path.join(__dirname, '..', 'uploads', fileName);
  if (fs.existsSync(filePath)) {
    fs.unlink(filePath, (err) => {
      if (err) console.error('Error deleting file:', err);
    });
  }
};

// @desc    Get all documents for current user (or all if admin requested)
// @route   GET /api/documents
// @access  Private
exports.getDocuments = async (req, res) => {
  try {
    const {
      search,
      category,
      status,
      sort = 'expiry_asc',
      allUsers,
      tag,
    } = req.query;

    let query = {};

    // RBAC: Non-admin can only see their own docs
    if (req.user.role === 'admin' && allUsers === 'true') {
      // Admin viewing all docs
    } else {
      query.user = req.user.id;
    }

    // Search filter
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { documentNumber: searchRegex },
        { issuingAuthority: searchRegex },
        { notes: searchRegex },
      ];
    }

    // Category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // Tag filter
    if (tag) {
      query.tags = tag;
    }

    let documents = await Document.find(query).populate('user', 'name email');

    // Filter by virtual status if specified
    if (status && status !== 'all') {
      documents = documents.filter((doc) => doc.status === status);
    }

    // Sorting
    documents.sort((a, b) => {
      if (sort === 'expiry_asc') {
        if (!a.expiryDate) return 1;
        if (!b.expiryDate) return -1;
        return new Date(a.expiryDate) - new Date(b.expiryDate);
      } else if (sort === 'expiry_desc') {
        if (!a.expiryDate) return 1;
        if (!b.expiryDate) return -1;
        return new Date(b.expiryDate) - new Date(a.expiryDate);
      } else if (sort === 'newest') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sort === 'oldest') {
        return new Date(a.createdAt) - new Date(b.createdAt);
      } else if (sort === 'title_asc') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

    res.json({
      success: true,
      count: documents.length,
      data: documents,
    });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single document
// @route   GET /api/documents/:id
// @access  Private
exports.getDocumentById = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id).populate('user', 'name email');

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    // Ownership check
    if (document.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this document' });
    }

    res.json({ success: true, data: document });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new document
// @route   POST /api/documents
// @access  Private
exports.createDocument = async (req, res) => {
  try {
    const {
      title,
      documentNumber,
      category,
      issueDate,
      expiryDate,
      hasNoExpiry,
      issuingAuthority,
      notes,
      tags,
      reminderDays,
    } = req.body;

    if (!title || !category) {
      // Remove uploaded file if validation failed
      if (req.file) deleteFileSafe(req.file.filename);
      return res.status(400).json({
        success: false,
        message: 'Title and Category are required',
      });
    }

    const isNoExpiry = hasNoExpiry === 'true' || hasNoExpiry === true;
    if (!isNoExpiry && !expiryDate) {
      // It's recommended to have expiry date unless lifetime
    }

    let parsedTags = [];
    if (tags) {
      if (Array.isArray(tags)) {
        parsedTags = tags;
      } else if (typeof tags === 'string') {
        parsedTags = tags.split(',').map((t) => t.trim()).filter(Boolean);
      }
    }

    const docData = {
      title,
      documentNumber: documentNumber || '',
      category,
      issueDate: issueDate ? new Date(issueDate) : null,
      expiryDate: isNoExpiry ? null : (expiryDate ? new Date(expiryDate) : null),
      hasNoExpiry: isNoExpiry,
      issuingAuthority: issuingAuthority || '',
      notes: notes || '',
      tags: parsedTags,
      reminderDays: reminderDays ? Number(reminderDays) : 30,
      user: req.user.id,
    };

    if (req.file) {
      docData.fileName = req.file.filename;
      docData.fileOriginalName = req.file.originalname;
      docData.filePath = req.file.path;
      docData.fileMimeType = req.file.mimetype;
      docData.fileSize = req.file.size;
      docData.fileUrl = `/api/documents/preview/${req.file.filename}`;
    }

    const document = await Document.create(docData);

    await ActivityLog.create({
      user: req.user.id,
      userName: req.user.name,
      action: 'CREATE',
      documentId: document._id,
      documentTitle: document.title,
      details: `Created new document in category '${document.category}'`,
    });

    res.status(201).json({
      success: true,
      message: 'Document created successfully',
      data: document,
    });
  } catch (error) {
    if (req.file) deleteFileSafe(req.file.filename);
    console.error('Create document error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update an existing document
// @route   PUT /api/documents/:id
// @access  Private
exports.updateDocument = async (req, res) => {
  try {
    let document = await Document.findById(req.params.id);

    if (!document) {
      if (req.file) deleteFileSafe(req.file.filename);
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    // Ownership check
    if (document.user.toString() !== req.user.id && req.user.role !== 'admin') {
      if (req.file) deleteFileSafe(req.file.filename);
      return res.status(403).json({ success: false, message: 'Not authorized to edit this document' });
    }

    const {
      title,
      documentNumber,
      category,
      issueDate,
      expiryDate,
      hasNoExpiry,
      issuingAuthority,
      notes,
      tags,
      reminderDays,
    } = req.body;

    if (title) document.title = title;
    if (documentNumber !== undefined) document.documentNumber = documentNumber;
    if (category) document.category = category;
    if (issueDate !== undefined) document.issueDate = issueDate ? new Date(issueDate) : null;

    if (hasNoExpiry !== undefined) {
      document.hasNoExpiry = hasNoExpiry === 'true' || hasNoExpiry === true;
    }

    if (document.hasNoExpiry) {
      document.expiryDate = null;
    } else if (expiryDate !== undefined) {
      document.expiryDate = expiryDate ? new Date(expiryDate) : null;
    }

    if (issuingAuthority !== undefined) document.issuingAuthority = issuingAuthority;
    if (notes !== undefined) document.notes = notes;
    if (reminderDays !== undefined) document.reminderDays = Number(reminderDays);

    if (tags !== undefined) {
      if (Array.isArray(tags)) {
        document.tags = tags;
      } else if (typeof tags === 'string') {
        document.tags = tags.split(',').map((t) => t.trim()).filter(Boolean);
      }
    }

    // If new file attached, replace old
    if (req.file) {
      if (document.fileName) {
        deleteFileSafe(document.fileName);
      }
      document.fileName = req.file.filename;
      document.fileOriginalName = req.file.originalname;
      document.filePath = req.file.path;
      document.fileMimeType = req.file.mimetype;
      document.fileSize = req.file.size;
      document.fileUrl = `/api/documents/preview/${req.file.filename}`;
    }

    await document.save();

    await ActivityLog.create({
      user: req.user.id,
      userName: req.user.name,
      action: 'UPDATE',
      documentId: document._id,
      documentTitle: document.title,
      details: 'Updated document details',
    });

    res.json({
      success: true,
      message: 'Document updated successfully',
      data: document,
    });
  } catch (error) {
    if (req.file) deleteFileSafe(req.file.filename);
    console.error('Update document error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete document
// @route   DELETE /api/documents/:id
// @access  Private
exports.deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    // Ownership check
    if (document.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this document' });
    }

    // Delete associated physical file
    if (document.fileName) {
      deleteFileSafe(document.fileName);
    }

    const docTitle = document.title;
    await document.deleteOne();

    await ActivityLog.create({
      user: req.user.id,
      userName: req.user.name,
      action: 'DELETE',
      documentId: document._id,
      documentTitle: docTitle,
      details: 'Deleted document permanently',
    });

    res.json({
      success: true,
      message: 'Document deleted successfully',
    });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Quick renew document expiry date
// @route   PATCH /api/documents/:id/renew
// @access  Private
exports.renewDocument = async (req, res) => {
  try {
    const { newExpiryDate, notes } = req.body;

    if (!newExpiryDate) {
      return res.status(400).json({ success: false, message: 'Please provide new expiry date' });
    }

    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    if (document.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    document.expiryDate = new Date(newExpiryDate);
    document.hasNoExpiry = false;
    if (notes) {
      document.notes = document.notes ? `${document.notes}\n[Renewed on ${new Date().toLocaleDateString()}: ${notes}]` : notes;
    }

    await document.save();

    await ActivityLog.create({
      user: req.user.id,
      userName: req.user.name,
      action: 'RENEW',
      documentId: document._id,
      documentTitle: document.title,
      details: `Renewed document with new expiry date: ${new Date(newExpiryDate).toLocaleDateString()}`,
    });

    res.json({
      success: true,
      message: 'Document renewed successfully',
      data: document,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Download document attachment
// @route   GET /api/documents/download/:filename
// @access  Public or Protected with query token
exports.downloadFile = async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '..', 'uploads', filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'File not found on server' });
    }

    const document = await Document.findOne({ fileName: filename });
    const originalName = document ? document.fileOriginalName : filename;

    res.download(filePath, originalName);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Preview file inline (for PDF / Images in iframe or modal)
// @route   GET /api/documents/preview/:filename
// @access  Public
exports.previewFile = async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '..', 'uploads', filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'File not found on server' });
    }

    res.sendFile(filePath);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
