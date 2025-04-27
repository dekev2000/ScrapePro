const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// Import controllers
const {
  getScrapingJobs,
  getScrapingJob,
  createScrapingJob,
  updateScrapingJob,
  deleteScrapingJob,
  runScrapingJob,
  pauseScrapingJob,
  resumeScrapingJob,
  getScrapingJobLogs,
  getScrapingJobResults
} = require('../controllers/scraping');

// All routes below use protect middleware
router.use(protect);

router.route('/')
  .get(getScrapingJobs)
  .post(createScrapingJob);

router.route('/:id')
  .get(getScrapingJob)
  .put(updateScrapingJob)
  .delete(authorize('admin'), deleteScrapingJob);

router.route('/:id/run')
  .post(runScrapingJob);

router.route('/:id/pause')
  .post(pauseScrapingJob);

router.route('/:id/resume')
  .post(resumeScrapingJob);

router.route('/:id/logs')
  .get(getScrapingJobLogs);

router.route('/:id/results')
  .get(getScrapingJobResults);

module.exports = router; 