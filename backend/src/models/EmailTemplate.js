const mongoose = require('mongoose');

const EmailTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a template name'],
    trim: true,
    maxlength: [100, 'Template name cannot be more than 100 characters']
  },
  subject: {
    type: String,
    required: [true, 'Please add an email subject'],
    trim: true,
    maxlength: [150, 'Subject cannot be more than 150 characters']
  },
  body: {
    type: String,
    required: [true, 'Please add email content'],
    maxlength: [5000, 'Email content cannot be more than 5000 characters']
  },
  variables: [{
    name: String,
    defaultValue: String
  }],
  category: {
    type: String,
    enum: ['introduction', 'follow_up', 'proposal', 'other'],
    default: 'introduction'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  usage: {
    sentCount: {
      type: Number,
      default: 0
    },
    openRate: {
      type: Number,
      default: 0
    },
    responseRate: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('EmailTemplate', EmailTemplateSchema); 