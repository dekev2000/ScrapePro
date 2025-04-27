const mongoose = require('mongoose');

const EmailSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: [true, 'Please add an email subject'],
    trim: true,
    maxlength: [200, 'Subject cannot be more than 200 characters']
  },
  body: {
    type: String,
    required: [true, 'Please add an email body']
  },
  recipient: {
    type: String,
    required: [true, 'Please add a recipient email'],
    match: [
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      'Please add a valid email'
    ]
  },
  sender: {
    type: String,
    required: [true, 'Please add a sender email']
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  sentAt: {
    type: Date,
    default: Date.now
  },
  isOpened: {
    type: Boolean,
    default: false
  },
  openedAt: Date,
  isClicked: {
    type: Boolean,
    default: false
  },
  clickedAt: Date,
  trackingId: {
    type: String,
    default: function() {
      return this._id;
    }
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'failed', 'scheduled'],
    default: 'sent'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Email', EmailSchema); 