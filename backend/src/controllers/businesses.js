const Business = require('../models/Business');
const websitePreviewService = require('../services/websitePreviewService');
const logger = require('../utils/logger');

// @desc    Get all businesses
// @route   GET /api/businesses
// @access  Private
exports.getBusinesses = async (req, res) => {
  try {
    // Build query with pagination and filtering
    let query;
    const reqQuery = { ...req.query };

    // Fields to exclude from filtering
    const removeFields = ['select', 'sort', 'page', 'limit'];
    removeFields.forEach(param => delete reqQuery[param]);

    // Create operators ($gt, $gte, etc)
    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Finding resource
    query = Business.find(JSON.parse(queryStr));

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
      query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Business.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    // Execute query
    const businesses = await query;

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
      count: businesses.length,
      pagination,
      total,
      data: businesses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get single business
// @route   GET /api/businesses/:id
// @access  Private
exports.getBusiness = async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);

    if (!business) {
      return res.status(404).json({
        success: false,
        error: 'Business not found'
      });
    }

    res.status(200).json({
      success: true,
      data: business
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Create new business
// @route   POST /api/businesses
// @access  Private
exports.createBusiness = async (req, res) => {
  try {
    // Add user to req.body
    req.body.scrapingData = {
      ...req.body.scrapingData,
      scrapedBy: req.user.id
    };

    // Check for existing business with same name and address
    const existingBusiness = await Business.findOne({
      name: req.body.name,
      'address.city': req.body.address?.city,
      'address.postalCode': req.body.address?.postalCode
    });

    if (existingBusiness) {
      return res.status(400).json({
        success: false,
        error: 'Business with this name and address already exists'
      });
    }

    const business = await Business.create(req.body);

    res.status(201).json({
      success: true,
      data: business
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update business
// @route   PUT /api/businesses/:id
// @access  Private
exports.updateBusiness = async (req, res) => {
  try {
    let business = await Business.findById(req.params.id);

    if (!business) {
      return res.status(404).json({
        success: false,
        error: 'Business not found'
      });
    }

    // Update business
    business = await Business.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: business
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Delete business
// @route   DELETE /api/businesses/:id
// @access  Private/Admin
exports.deleteBusiness = async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);

    if (!business) {
      return res.status(404).json({
        success: false,
        error: 'Business not found'
      });
    }

    await business.deleteOne();

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

// @desc    Get businesses by location
// @route   GET /api/businesses/location/:city
// @access  Private
exports.getBusinessesByLocation = async (req, res) => {
  try {
    const city = req.params.city;

    const businesses = await Business.find({
      'address.city': new RegExp(city, 'i')
    });

    res.status(200).json({
      success: true,
      count: businesses.length,
      data: businesses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get businesses by NAF code
// @route   GET /api/businesses/nafcode/:code
// @access  Private
exports.getBusinessesByNafCode = async (req, res) => {
  try {
    const code = req.params.code;

    const businesses = await Business.find({
      'business.nafCode': new RegExp(code, 'i')
    });

    res.status(200).json({
      success: true,
      count: businesses.length,
      data: businesses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Generate website preview
// @route   POST /api/businesses/:id/websitepreview
// @access  Private
exports.generateWebsitePreview = async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);

    if (!business) {
      return res.status(404).json({
        success: false,
        error: 'Business not found'
      });
    }

    // Get options from request body
    const {
      apiSource = 'deepsite',
      template,
      language = 'fr',
      colorScheme,
      theme,
      description
    } = req.body;

    // Validate API source
    if (apiSource !== 'deepsite' && apiSource !== 'bolt') {
      return res.status(400).json({
        success: false,
        error: 'Invalid API source specified. Must be "deepsite" or "bolt"'
      });
    }

    // Check if business has required data
    if (!business.name || !business.address || !business.address.city) {
      return res.status(400).json({
        success: false,
        error: 'Business is missing required data (name, address)'
      });
    }

    // Update status to pending
    business.websiteGeneration = {
      ...business.websiteGeneration,
      status: 'pending',
      apiSource
    };
    await business.save();

    // Generate preview
    const options = {
      template,
      language,
      colorScheme,
      theme,
      description,
      defaultEmail: `contact@${business.name.toLowerCase().replace(/\s+/g, '-')}.fr`
    };

    const previewData = await websitePreviewService.generatePreview(business, apiSource, options);

    // Update business with preview data
    business.websiteGeneration = {
      status: 'generated',
      previewLink: previewData.previewLink,
      previewScreenshot: previewData.previewScreenshot,
      generatedAt: Date.now(),
      apiSource: previewData.apiSource
    };

    await business.save();

    res.status(200).json({
      success: true,
      data: business
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Approve website preview
// @route   PUT /api/businesses/:id/websitepreview/approve
// @access  Private
exports.approveWebsitePreview = async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);

    if (!business) {
      return res.status(404).json({
        success: false,
        error: 'Business not found'
      });
    }

    if (business.websiteGeneration.status !== 'generated') {
      return res.status(400).json({
        success: false,
        error: 'No generated website preview to approve'
      });
    }

    // Update website generation status
    business.websiteGeneration.status = 'approved';
    await business.save();

    res.status(200).json({
      success: true,
      data: business
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Reject website preview
// @route   PUT /api/businesses/:id/websitepreview/reject
// @access  Private
exports.rejectWebsitePreview = async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);

    if (!business) {
      return res.status(404).json({
        success: false,
        error: 'Business not found'
      });
    }

    if (business.websiteGeneration.status !== 'generated') {
      return res.status(400).json({
        success: false,
        error: 'No generated website preview to reject'
      });
    }

    // Update website generation status
    business.websiteGeneration.status = 'rejected';
    await business.save();

    res.status(200).json({
      success: true,
      data: business
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};