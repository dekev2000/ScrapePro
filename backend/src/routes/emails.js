const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// Import controllers
const {
  sendEmail,
  getEmails,
  getEmail,
  sendBusinessEmail,
  trackEmailResponse,
  createEmailTemplate,
  getEmailTemplates,
  getEmailTemplate,
  updateEmailTemplate
} = require('../controllers/emails');

// Public route for tracking emails (no auth required)
router.route('/track/:id')
  .get(trackEmailResponse);

// All routes below use protect middleware
router.use(protect);

// Basic email routes
router.route('/')
  .get(getEmails)
  .post(sendEmail);

router.route('/:id')
  .get(getEmail);

// Business email routes
router.route('/business/:id')
  .post(sendBusinessEmail);

// Email template routes
router.route('/templates')
  .get(getEmailTemplates)
  .post(createEmailTemplate);

router.route('/templates/:id')
  .get(getEmailTemplate)
  .put(updateEmailTemplate);

module.exports = router;