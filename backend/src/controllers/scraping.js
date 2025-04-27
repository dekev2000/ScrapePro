const ScrapingJob = require('../models/ScrapingJob');
const scrapingEngine = require('../services/scrapingEngine');
const logger = require('../utils/logger');

// @desc    Get all scraping jobs
// @route   GET /api/scraping
// @access  Private
exports.getScrapingJobs = async (req, res) => {
  try {
    const jobs = await ScrapingJob.find({ user: req.user.id });

    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get single scraping job
// @route   GET /api/scraping/:id
// @access  Private
exports.getScrapingJob = async (req, res) => {
  try {
    const job = await ScrapingJob.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Scraping job not found'
      });
    }

    // Make sure user owns the job
    if (job.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this job'
      });
    }

    res.status(200).json({
      success: true,
      data: job
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Create new scraping job
// @route   POST /api/scraping
// @access  Private
exports.createScrapingJob = async (req, res) => {
  try {
    // Add user to request body
    req.body.user = req.user.id;

    const job = await ScrapingJob.create(req.body);

    res.status(201).json({
      success: true,
      data: job
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update scraping job
// @route   PUT /api/scraping/:id
// @access  Private
exports.updateScrapingJob = async (req, res) => {
  try {
    let job = await ScrapingJob.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Scraping job not found'
      });
    }

    // Make sure user owns the job
    if (job.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this job'
      });
    }

    job = await ScrapingJob.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: job
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Delete scraping job
// @route   DELETE /api/scraping/:id
// @access  Private/Admin
exports.deleteScrapingJob = async (req, res) => {
  try {
    const job = await ScrapingJob.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Scraping job not found'
      });
    }

    await job.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Run scraping job
// @route   POST /api/scraping/:id/run
// @access  Private
exports.runScrapingJob = async (req, res) => {
  try {
    const job = await ScrapingJob.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Scraping job not found'
      });
    }

    // Make sure user owns the job
    if (job.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to run this job'
      });
    }

    // Check if job is already running
    if (job.status === 'in_progress') {
      return res.status(400).json({
        success: false,
        error: 'Job is already running'
      });
    }

    // Start the job (initial status update)
    job.status = 'in_progress';
    job.startedAt = Date.now();
    job.progress = 0;
    await job.save();

    // Return immediate response to client
    res.status(200).json({
      success: true,
      message: 'Scraping job started',
      data: job
    });

    // Run the job asynchronously (don't await)
    scrapingEngine.runJob(job._id)
      .catch(error => {
        logger.error(`Error in scraping job ${job._id}: ${error.message}`, {
          jobId: job._id,
          error: error.stack
        });
      });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Pause scraping job
// @route   POST /api/scraping/:id/pause
// @access  Private
exports.pauseScrapingJob = async (req, res) => {
  try {
    const job = await ScrapingJob.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Scraping job not found'
      });
    }

    // Make sure user owns the job
    if (job.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to pause this job'
      });
    }

    // Update job status
    job.status = 'paused';
    await job.save();

    res.status(200).json({
      success: true,
      data: job
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Resume scraping job
// @route   POST /api/scraping/:id/resume
// @access  Private
exports.resumeScrapingJob = async (req, res) => {
  try {
    const job = await ScrapingJob.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Scraping job not found'
      });
    }

    // Make sure user owns the job
    if (job.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to resume this job'
      });
    }

    // Update job status
    job.status = 'in_progress';
    await job.save();

    res.status(200).json({
      success: true,
      data: job
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get scraping job logs
// @route   GET /api/scraping/:id/logs
// @access  Private
exports.getScrapingJobLogs = async (req, res) => {
  try {
    const job = await ScrapingJob.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Scraping job not found'
      });
    }

    // Make sure user owns the job
    if (job.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this job logs'
      });
    }

    res.status(200).json({
      success: true,
      data: job.logs || []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get scraping job results
// @route   GET /api/scraping/:id/results
// @access  Private
exports.getScrapingJobResults = async (req, res) => {
  try {
    const job = await ScrapingJob.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Scraping job not found'
      });
    }

    // Make sure user owns the job
    if (job.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this job results'
      });
    }

    res.status(200).json({
      success: true,
      data: job.results || []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};