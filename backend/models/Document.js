const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Document title is required'],
      trim: true,
      maxlength: 120,
    },
    documentNumber: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: String,
      required: [true, 'Document category is required'],
      default: 'General',
    },
    issueDate: {
      type: Date,
      default: null,
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    hasNoExpiry: {
      type: Boolean,
      default: false,
    },
    issuingAuthority: {
      type: String,
      trim: true,
      default: '',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    tags: {
      type: [String],
      default: [],
    },
    fileUrl: {
      type: String,
      default: '',
    },
    filePath: {
      type: String,
      default: '',
    },
    fileName: {
      type: String,
      default: '',
    },
    fileOriginalName: {
      type: String,
      default: '',
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    fileMimeType: {
      type: String,
      default: '',
    },
    reminderDays: {
      type: Number,
      default: 30, // alert when within 30 days
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for dynamic status
documentSchema.virtual('status').get(function () {
  if (this.hasNoExpiry || !this.expiryDate) {
    return 'lifetime';
  }

  const now = new Date();
  const expiry = new Date(this.expiryDate);
  const diffTime = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return 'expired';
  } else if (diffDays <= (this.reminderDays || 30)) {
    return 'expiring_soon';
  } else {
    return 'valid';
  }
});

// Virtual for days remaining
documentSchema.virtual('daysRemaining').get(function () {
  if (this.hasNoExpiry || !this.expiryDate) {
    return null;
  }
  const now = new Date();
  const expiry = new Date(this.expiryDate);
  const diffTime = expiry.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

module.exports = mongoose.model('Document', documentSchema);
