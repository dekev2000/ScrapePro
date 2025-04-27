const Email = require('../models/Email');
const EmailTemplate = require('../models/EmailTemplate');
const Business = require('../models/Business');
const emailService = require('../services/emailService');
const logger = require('../utils/logger');

// @desc    Send an email to a business
// @route   POST /api/emails/business/:id
// @access  Private
exports.sendBusinessEmail = async (req, res) => {
  try {
    const { templateId } = req.body;

    if (!templateId) {
      return res.status(400).json({
        success: false,
        error: 'Template ID is required'
      });
    }

    // Get business
    const business = await Business.findById(req.params.id);

    if (!business) {
      return res.status(404).json({
        success: false,
        error: 'Business not found'
      });
    }

    // Check if business has an email or if one is provided
    if (!business.contact.email && !req.body.recipientEmail) {
      return res.status(400).json({
        success: false,
        error: 'Business has no email address and no recipient email provided'
      });
    }

    // Send email
    const email = await emailService.sendBusinessEmail(business._id, templateId, {
      userId: req.user.id,
      recipientEmail: req.body.recipientEmail,
      variables: req.body.variables,
      sender: req.body.sender,
      senderName: req.body.senderName
    });

    res.status(200).json({
      success: true,
      data: email
    });
  } catch (error) {
    logger.error(`Error sending business email: ${error.message}`, {
      businessId: req.params.id,
      error: error.stack
    });

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Send an email
// @route   POST /api/emails
// @access  Private
exports.sendEmail = async (req, res) => {
  try {
    const { subject, body, recipient, sender } = req.body;

    // Validate required fields
    if (!subject || !body || !recipient) {
      return res.status(400).json({
        success: false,
        error: 'Please provide subject, body, and recipient'
      });
    }

    // Create email record
    const email = await Email.create({
      subject,
      body,
      recipient,
      sender: sender || emailService.fromEmail,
      user: req.user.id,
      trackingId: `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`
    });

    // Send the email
    await emailService.sendEmail({
      to: recipient,
      from: sender || emailService.fromEmail,
      fromName: req.body.senderName || emailService.fromName,
      subject,
      body,
      trackingId: email.trackingId
    });

    // Update email status
    email.status = 'sent';
    email.sentAt = Date.now();
    await email.save();

    res.status(201).json({
      success: true,
      data: email
    });
  } catch (error) {
    logger.error(`Error sending email: ${error.message}`, {
      error: error.stack
    });

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get all emails for a user
// @route   GET /api/emails
// @access  Private
exports.getEmails = async (req, res) => {
  try {
    // Build query with pagination and filtering
    let query;
    const reqQuery = { ...req.query };

    // Fields to exclude from filtering
    const removeFields = ['select', 'sort', 'page', 'limit'];
    removeFields.forEach(param => delete reqQuery[param]);

    // Add user filter
    reqQuery.user = req.user.id;

    // Create operators ($gt, $gte, etc)
    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Finding resource
    query = Email.find(JSON.parse(queryStr));

    // Select fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-sentAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Email.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    // Execute query
    const emails = await query;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: emails.length,
      pagination,
      total,
      data: emails
    });
  } catch (error) {
    logger.error(`Error getting emails: ${error.message}`, {
      error: error.stack
    });

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get email by ID
// @route   GET /api/emails/:id
// @access  Private
exports.getEmail = async (req, res) => {
  try {
    const email = await Email.findById(req.params.id);

    if (!email) {
      return res.status(404).json({
        success: false,
        error: 'Email not found'
      });
    }

    // Make sure user owns the email
    if (email.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this email'
      });
    }

    res.status(200).json({
      success: true,
      data: email
    });
  } catch (error) {
    logger.error(`Error getting email: ${error.message}`, {
      emailId: req.params.id,
      error: error.stack
    });

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Track email open/click
// @route   GET /api/emails/track/:id
// @access  Public
exports.trackEmailResponse = async (req, res) => {
  try {
    const trackingId = req.params.id;
    const trackType = req.query.type || 'open';
    const linkId = req.query.link;

    if (trackType === 'open') {
      await emailService.trackEmailOpen(trackingId);
    } else if (trackType === 'click') {
      await emailService.trackEmailClick(trackingId, linkId);
    }

    // Return a 1x1 transparent pixel for tracking
    res.set('Content-Type', 'image/gif');
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.send(Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64'));
  } catch (error) {
    logger.error(`Error tracking email: ${error.message}`, {
      trackingId: req.params.id,
      error: error.stack
    });

    // Still return a tracking pixel to avoid errors in email clients
    res.set('Content-Type', 'image/gif');
    res.send(Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64'));
  }
};

// @desc    Create email template
// @route   POST /api/emails/templates
// @access  Private
exports.createEmailTemplate = async (req, res) => {
  try {
    const { name, subject, body, category, variables } = req.body;

    // Validate required fields
    if (!name || !subject || !body) {
      return res.status(400).json({
        success: false,
        error: 'Please provide name, subject, and body'
      });
    }

    // Create template
    const template = await emailService.createTemplate({
      name,
      subject,
      body,
      category: category || 'introduction',
      variables: variables || [],
      createdBy: req.user.id,
      isActive: true,
      usage: {
        sentCount: 0,
        openRate: 0,
        responseRate: 0
      }
    });

    res.status(201).json({
      success: true,
      data: template
    });
  } catch (error) {
    logger.error(`Error creating email template: ${error.message}`, {
      error: error.stack
    });

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get all email templates
// @route   GET /api/emails/templates
// @access  Private
exports.getEmailTemplates = async (req, res) => {
  try {
    const templates = await EmailTemplate.find({
      $or: [
        { createdBy: req.user.id },
        { isActive: true }
      ]
    }).sort('-createdAt');

    res.status(200).json({
      success: true,
      count: templates.length,
      data: templates
    });
  } catch (error) {
    logger.error(`Error getting email templates: ${error.message}`, {
      error: error.stack
    });

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get email template by ID
// @route   GET /api/emails/templates/:id
// @access  Private
exports.getEmailTemplate = async (req, res) => {
  try {
    const template = await EmailTemplate.findById(req.params.id);

    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Email template not found'
      });
    }

    res.status(200).json({
      success: true,
      data: template
    });
  } catch (error) {
    logger.error(`Error getting email template: ${error.message}`, {
      templateId: req.params.id,
      error: error.stack
    });

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update email template
// @route   PUT /api/emails/templates/:id
// @access  Private
exports.updateEmailTemplate = async (req, res) => {
  try {
    let template = await EmailTemplate.findById(req.params.id);

    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Email template not found'
      });
    }

    // Make sure user owns the template or is admin
    if (template.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this template'
      });
    }

    template = await EmailTemplate.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: template
    });
  } catch (error) {
    logger.error(`Error updating email template: ${error.message}`, {
      templateId: req.params.id,
      error: error.stack
    });

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};