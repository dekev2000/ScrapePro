const Business = require('../models/Business');
const ScrapingJob = require('../models/ScrapingJob');
const User = require('../models/User');
const EmailTemplate = require('../models/EmailTemplate');

// @desc    Get dashboard statistics
// @route   GET /api/analytics/dashboard
// @access  Private
exports.getDashboardStats = async (req, res) => {
  try {
    // Get total businesses
    const totalBusinesses = await Business.countDocuments();
    
    // Get total preview sites
    const totalPreviewSites = await Business.countDocuments({
      'websiteGeneration.status': { $in: ['generated', 'approved'] }
    });
    
    // Get active clients (businesses with approved website and email sent)
    const activeClients = await Business.countDocuments({
      'websiteGeneration.status': 'approved',
      'emailOutreach.status': { $in: ['sent', 'opened', 'responded'] }
    });
    
    // Calculate revenue (simplified for demo)
    // This would normally come from a separate payments/subscriptions model
    const revenue = activeClients * 500; // Assuming €500 per active client
    
    // Get weekly metrics for comparison
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const businessesLastWeek = await Business.countDocuments({
      createdAt: { $lt: oneWeekAgo }
    });
    
    const previewSitesLastWeek = await Business.countDocuments({
      'websiteGeneration.status': { $in: ['generated', 'approved'] },
      'websiteGeneration.generatedAt': { $lt: oneWeekAgo }
    });
    
    const activeClientsLastWeek = await Business.countDocuments({
      'websiteGeneration.status': 'approved',
      'emailOutreach.status': { $in: ['sent', 'opened', 'responded'] },
      'emailOutreach.sentAt': { $lt: oneWeekAgo }
    });
    
    // Calculate percentage changes
    const businessesChange = businessesLastWeek > 0 
      ? Math.round(((totalBusinesses - businessesLastWeek) / businessesLastWeek) * 100) 
      : 100;
      
    const previewSitesChange = previewSitesLastWeek > 0 
      ? Math.round(((totalPreviewSites - previewSitesLastWeek) / previewSitesLastWeek) * 100) 
      : 100;
      
    const activeClientsChange = activeClientsLastWeek > 0 
      ? Math.round(((activeClients - activeClientsLastWeek) / activeClientsLastWeek) * 100) 
      : 100;
      
    const revenueLastWeek = activeClientsLastWeek * 500;
    const revenueChange = revenueLastWeek > 0 
      ? Math.round(((revenue - revenueLastWeek) / revenueLastWeek) * 100) 
      : 100;
    
    res.status(200).json({
      success: true,
      data: {
        totalScrapes: {
          count: totalBusinesses,
          change: businessesChange
        },
        previewSites: {
          count: totalPreviewSites,
          change: previewSitesChange
        },
        activeClients: {
          count: activeClients,
          change: activeClientsChange
        },
        revenue: {
          amount: revenue,
          change: revenueChange
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get scraping statistics
// @route   GET /api/analytics/scraping
// @access  Private
exports.getScrapingStats = async (req, res) => {
  try {
    // Get total scraping jobs
    const totalJobs = await ScrapingJob.countDocuments();
    
    // Get jobs by status
    const pendingJobs = await ScrapingJob.countDocuments({ status: 'pending' });
    const inProgressJobs = await ScrapingJob.countDocuments({ status: 'in_progress' });
    const completedJobs = await ScrapingJob.countDocuments({ status: 'completed' });
    const failedJobs = await ScrapingJob.countDocuments({ status: 'failed' });
    
    // Get source distribution
    const googleMapsBusinesses = await Business.countDocuments({ 'scrapingData.source': 'google_maps' });
    const inseeBusinesses = await Business.countDocuments({ 'scrapingData.source': 'insee' });
    const manualBusinesses = await Business.countDocuments({ 'scrapingData.source': 'manual' });
    const otherBusinesses = await Business.countDocuments({ 'scrapingData.source': 'other' });
    
    res.status(200).json({
      success: true,
      data: {
        jobs: {
          total: totalJobs,
          byStatus: {
            pending: pendingJobs,
            inProgress: inProgressJobs,
            completed: completedJobs,
            failed: failedJobs
          }
        },
        businesses: {
          bySource: {
            googleMaps: googleMapsBusinesses,
            insee: inseeBusinesses,
            manual: manualBusinesses,
            other: otherBusinesses
          }
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get email statistics
// @route   GET /api/analytics/emails
// @access  Private
exports.getEmailStats = async (req, res) => {
  try {
    // Get total emails sent
    const totalSent = await Business.countDocuments({
      'emailOutreach.status': { $in: ['sent', 'opened', 'responded', 'bounced'] }
    });
    
    // Get emails by status
    const openedEmails = await Business.countDocuments({ 'emailOutreach.status': 'opened' });
    const respondedEmails = await Business.countDocuments({ 'emailOutreach.status': 'responded' });
    const bouncedEmails = await Business.countDocuments({ 'emailOutreach.status': 'bounced' });
    
    // Calculate rates
    const openRate = totalSent > 0 ? (openedEmails / totalSent) * 100 : 0;
    const responseRate = totalSent > 0 ? (respondedEmails / totalSent) * 100 : 0;
    const bounceRate = totalSent > 0 ? (bouncedEmails / totalSent) * 100 : 0;
    
    // Get template performance
    const templates = await EmailTemplate.find();
    const templatePerformance = [];
    
    for (const template of templates) {
      const sentCount = template.usage.sentCount;
      const openRate = template.usage.openRate;
      const responseRate = template.usage.responseRate;
      
      templatePerformance.push({
        id: template._id,
        name: template.name,
        sentCount,
        openRate,
        responseRate
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalSent,
          openedEmails,
          respondedEmails,
          bouncedEmails
        },
        rates: {
          openRate: parseFloat(openRate.toFixed(2)),
          responseRate: parseFloat(responseRate.toFixed(2)),
          bounceRate: parseFloat(bounceRate.toFixed(2))
        },
        templatePerformance
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get business statistics
// @route   GET /api/analytics/businesses
// @access  Private
exports.getBusinessStats = async (req, res) => {
  try {
    // Get total businesses
    const totalBusinesses = await Business.countDocuments();
    
    // Get businesses by region
    const businessesByRegion = await Business.aggregate([
      {
        $group: {
          _id: '$address.region',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    // Get businesses by type
    const businessesByType = await Business.aggregate([
      {
        $group: {
          _id: '$business.nafCode',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      }
    ]);
    
    // Get businesses by status in pipeline
    const notContacted = await Business.countDocuments({
      'emailOutreach.status': 'not_sent'
    });
    
    const contacted = await Business.countDocuments({
      'emailOutreach.status': { $in: ['sent', 'opened'] }
    });
    
    const responded = await Business.countDocuments({
      'emailOutreach.status': 'responded'
    });
    
    res.status(200).json({
      success: true,
      data: {
        total: totalBusinesses,
        byRegion: businessesByRegion,
        byType: businessesByType,
        byStatus: {
          notContacted,
          contacted,
          responded
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get weekly activity
// @route   GET /api/analytics/activity/weekly
// @access  Private
exports.getWeeklyActivity = async (req, res) => {
  try {
    // Get start and end of week
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)); // Set to Monday
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Set to Sunday
    endOfWeek.setHours(23, 59, 59, 999);
    
    // Get daily scraping activity for the week
    const scrapingActivity = await Business.aggregate([
      {
        $match: {
          'scrapingData.scrapedAt': {
            $gte: startOfWeek,
            $lte: endOfWeek
          }
        }
      },
      {
        $group: {
          _id: {
            $dayOfWeek: '$scrapingData.scrapedAt'
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    // Get daily preview generation activity for the week
    const previewActivity = await Business.aggregate([
      {
        $match: {
          'websiteGeneration.generatedAt': {
            $gte: startOfWeek,
            $lte: endOfWeek
          }
        }
      },
      {
        $group: {
          _id: {
            $dayOfWeek: '$websiteGeneration.generatedAt'
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    // Format data for chart
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const scrapingData = Array(7).fill(0);
    const previewData = Array(7).fill(0);
    
    scrapingActivity.forEach(item => {
      // MongoDB $dayOfWeek returns 1 for Sunday, 2 for Monday, etc.
      const index = item._id % 7; // Convert to 0-indexed array
      scrapingData[index] = item.count;
    });
    
    previewActivity.forEach(item => {
      const index = item._id % 7;
      previewData[index] = item.count;
    });
    
    // Rotate arrays to start with Monday
    const rotatedDays = [...daysOfWeek.slice(1), daysOfWeek[0]];
    const rotatedScrapingData = [...scrapingData.slice(1), scrapingData[0]];
    const rotatedPreviewData = [...previewData.slice(1), previewData[0]];
    
    res.status(200).json({
      success: true,
      data: {
        labels: rotatedDays,
        scrapes: rotatedScrapingData,
        previews: rotatedPreviewData
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get monthly activity
// @route   GET /api/analytics/activity/monthly
// @access  Private
exports.getMonthlyActivity = async (req, res) => {
  try {
    // Get start and end of month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    
    // Get daily scraping activity for the month
    const scrapingActivity = await Business.aggregate([
      {
        $match: {
          'scrapingData.scrapedAt': {
            $gte: startOfMonth,
            $lte: endOfMonth
          }
        }
      },
      {
        $group: {
          _id: {
            $dayOfMonth: '$scrapingData.scrapedAt'
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    // Get daily preview generation activity for the month
    const previewActivity = await Business.aggregate([
      {
        $match: {
          'websiteGeneration.generatedAt': {
            $gte: startOfMonth,
            $lte: endOfMonth
          }
        }
      },
      {
        $group: {
          _id: {
            $dayOfMonth: '$websiteGeneration.generatedAt'
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    // Format data for chart
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const labels = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const scrapingData = Array(daysInMonth).fill(0);
    const previewData = Array(daysInMonth).fill(0);
    
    scrapingActivity.forEach(item => {
      const index = item._id - 1; // Convert to 0-indexed array
      scrapingData[index] = item.count;
    });
    
    previewActivity.forEach(item => {
      const index = item._id - 1;
      previewData[index] = item.count;
    });
    
    res.status(200).json({
      success: true,
      data: {
        labels,
        scrapes: scrapingData,
        previews: previewData
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Generate custom report
// @route   POST /api/analytics/reports/custom
// @access  Private
exports.getCustomReport = async (req, res) => {
  try {
    const { startDate, endDate, metrics, filters } = req.body;
    
    // Validate input
    if (!startDate || !endDate || !metrics || !Array.isArray(metrics)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide valid startDate, endDate, and metrics array'
      });
    }
    
    // Parse dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Initialize report data
    const reportData = {};
    
    // For each requested metric, gather data
    for (const metric of metrics) {
      switch (metric) {
        case 'businessesScraped':
          reportData.businessesScraped = await Business.countDocuments({
            'scrapingData.scrapedAt': { $gte: start, $lte: end },
            ...(filters && filters)
          });
          break;
          
        case 'websitesGenerated':
          reportData.websitesGenerated = await Business.countDocuments({
            'websiteGeneration.generatedAt': { $gte: start, $lte: end },
            'websiteGeneration.status': { $in: ['generated', 'approved'] },
            ...(filters && filters)
          });
          break;
          
        case 'emailsSent':
          reportData.emailsSent = await Business.countDocuments({
            'emailOutreach.sentAt': { $gte: start, $lte: end },
            'emailOutreach.status': { $in: ['sent', 'opened', 'responded'] },
            ...(filters && filters)
          });
          break;
          
        case 'responseRate':
          const totalSent = await Business.countDocuments({
            'emailOutreach.sentAt': { $gte: start, $lte: end },
            'emailOutreach.status': { $in: ['sent', 'opened', 'responded'] },
            ...(filters && filters)
          });
          
          const responded = await Business.countDocuments({
            'emailOutreach.sentAt': { $gte: start, $lte: end },
            'emailOutreach.status': 'responded',
            ...(filters && filters)
          });
          
          reportData.responseRate = totalSent > 0 
            ? parseFloat(((responded / totalSent) * 100).toFixed(2))
            : 0;
          break;
          
        default:
          // Ignore unrecognized metrics
          break;
      }
    }
    
    res.status(200).json({
      success: true,
      data: reportData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Export data as CSV
// @route   POST /api/analytics/export/csv
// @access  Private
exports.exportCsv = async (req, res) => {
  try {
    const { startDate, endDate, dataType, filters } = req.body;
    
    // Validate input
    if (!startDate || !endDate || !dataType) {
      return res.status(400).json({
        success: false,
        error: 'Please provide valid startDate, endDate, and dataType'
      });
    }
    
    // For this demo, we'll just return a message
    // In a real app, you would generate and return a CSV file
    res.status(200).json({
      success: true,
      message: `CSV export would be generated for ${dataType} from ${startDate} to ${endDate}`,
      note: 'In a real application, this would return a downloadable CSV file'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Export data as PDF
// @route   POST /api/analytics/export/pdf
// @access  Private
exports.exportPdf = async (req, res) => {
  try {
    const { startDate, endDate, reportType, filters } = req.body;
    
    // Validate input
    if (!startDate || !endDate || !reportType) {
      return res.status(400).json({
        success: false,
        error: 'Please provide valid startDate, endDate, and reportType'
      });
    }
    
    // For this demo, we'll just return a message
    // In a real app, you would generate and return a PDF file
    res.status(200).json({
      success: true,
      message: `PDF report would be generated for ${reportType} from ${startDate} to ${endDate}`,
      note: 'In a real application, this would return a downloadable PDF file'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}; 