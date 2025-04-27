const mongoose = require('mongoose');

const BusinessSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a business name'],
    trim: true,
    maxlength: [100, 'Business name cannot be more than 100 characters']
  },
  address: {
    street: String,
    city: {
      type: String,
      required: [true, 'Please add a city']
    },
    postalCode: String,
    region: String,
    country: {
      type: String,
      default: 'France'
    },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  contact: {
    phone: String,
    email: String,
    website: String
  },
  business: {
    type: {
      type: String,
      trim: true
    },
    nafCode: String,
    siret: String,
    siren: String
  },
  scrapingData: {
    source: {
      type: String,
      enum: ['google_maps', 'insee', 'manual', 'other'],
      default: 'other'
    },
    scrapedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    scrapedAt: {
      type: Date,
      default: Date.now
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  websiteGeneration: {
    status: {
      type: String,
      enum: ['pending', 'generated', 'approved', 'rejected', 'not_generated'],
      default: 'not_generated'
    },
    previewLink: String,
    previewScreenshot: String,
    generatedAt: Date,
    apiSource: {
      type: String,
      enum: ['deepsite', 'bolt', 'other', null],
      default: null
    }
  },
  emailOutreach: {
    status: {
      type: String,
      enum: ['not_sent', 'sent', 'opened', 'responded', 'bounced'],
      default: 'not_sent'
    },
    template: {
      type: mongoose.Schema.ObjectId,
      ref: 'EmailTemplate'
    },
    sentAt: Date,
    openedAt: Date,
    respondedAt: Date
  },
  tags: [String],
  notes: String,
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create index for faster searches
BusinessSchema.index({ 'address.city': 1, 'business.nafCode': 1, name: 1 });
BusinessSchema.index({ 'address.coordinates': '2dsphere' });

module.exports = mongoose.model('Business', BusinessSchema); 