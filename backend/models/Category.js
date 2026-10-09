const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      maxlength: 50,
    },
    slug: {
      type: String,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      maxlength: 200,
    },
    color: {
      type: String,
      default: '#3B82F6', // Blue default
    },
    icon: {
      type: String,
      default: 'FileText',
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

categorySchema.pre('save', function () {
  if (this.name) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
  }
});

module.exports = mongoose.model('Category', categorySchema);
