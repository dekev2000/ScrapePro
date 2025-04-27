const mongoose = require('mongoose');

const ScrapingJobSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name for this scraping job'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'failed', 'paused'],
    default: 'pending'
  },
  source: {
    type: String,
    enum: ['google_maps', 'insee', 'linkedin', 'website', 'other'],
    required: [true, 'Please specify a source']
  },
  sourceUrl: {
    type: String,
    match: [
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
      'Please use a valid URL'
    ]
  },
  searchTerms: [String],
  locations: [String],
  filters: {
    type: Object,
    default: {}
  },
  configuration: {
    type: Object,
    default: {}
  },
  schedule: {
    frequency: {
      type: String,
      enum: ['once', 'daily', 'weekly', 'monthly', 'custom'],
      default: 'once'
    },
    startDate: Date,
    endDate: Date,
    cronExpression: String
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  startedAt: Date,
  completedAt: Date,
  resultsCount: {
    type: Number,
    default: 0
  },
  logs: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    level: {
      type: String,
      enum: ['info', 'warning', 'error'],
      default: 'info'
    },
    message: String
  }],
  results: {
    type: [{
      type: mongoose.Schema.Types.Mixed
    }],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Static method to get count of scraping jobs by status
ScrapingJobSchema.statics.getCountByStatus = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  return stats;
};

// Middleware to update resultsCount before saving
ScrapingJobSchema.pre('save', function(next) {
  if (this.results) {
    this.resultsCount = this.results.length;
  }
  next();
});

module.exports = mongoose.model('ScrapingJob', ScrapingJobSchema); 