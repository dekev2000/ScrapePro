const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// Import controllers
const {
  getBusinesses,
  getBusiness,
  createBusiness,
  updateBusiness,
  deleteBusiness,
  getBusinessesByLocation,
  getBusinessesByNafCode,
  generateWebsitePreview,
  approveWebsitePreview,
  rejectWebsitePreview
} = require('../controllers/businesses');

// All routes below use protect middleware
router.use(protect);

router.route('/')
  .get(getBusinesses)
  .post(createBusiness);

router.route('/:id')
  .get(getBusiness)
  .put(updateBusiness)
  .delete(authorize('admin'), deleteBusiness);

router.route('/location/:city')
  .get(getBusinessesByLocation);

router.route('/nafcode/:code')
  .get(getBusinessesByNafCode);

router.route('/:id/websitepreview')
  .post(generateWebsitePreview);

router.route('/:id/websitepreview/approve')
  .put(approveWebsitePreview);

router.route('/:id/websitepreview/reject')
  .put(rejectWebsitePreview);

module.exports = router; 