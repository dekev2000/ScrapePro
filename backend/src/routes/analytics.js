const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// Import controllers
const {
  getDashboardStats,
  getScrapingStats,
  getEmailStats,
  getBusinessStats,
  getWeeklyActivity,
  getMonthlyActivity,
  getCustomReport,
  exportCsv,
  exportPdf
} = require('../controllers/analytics');

// All routes below use protect middleware
router.use(protect);

// Dashboard statistics
router.route('/dashboard')
  .get(getDashboardStats);

// Detailed statistics
router.route('/scraping')
  .get(getScrapingStats);

router.route('/emails')
  .get(getEmailStats);

router.route('/businesses')
  .get(getBusinessStats);

// Activity timelines
router.route('/activity/weekly')
  .get(getWeeklyActivity);

router.route('/activity/monthly')
  .get(getMonthlyActivity);

// Custom reports and exports
router.route('/reports/custom')
  .post(getCustomReport);

router.route('/export/csv')
  .post(exportCsv);

router.route('/export/pdf')
  .post(exportPdf);

module.exports = router; 