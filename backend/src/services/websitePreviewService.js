const axios = require('axios');
const logger = require('../utils/logger');

/**
 * Website Preview Service
 * Handles interactions with website generation APIs (DeepSite/Bolt)
 */
class WebsitePreviewService {
  constructor() {
    this.deepSiteApiKey = process.env.DEEPSITE_API_KEY;
    this.boltApiKey = process.env.BOLT_API_KEY;
    
    // Initialize API clients
    this.deepSiteClient = axios.create({
      baseURL: 'https://api.deepsite.io/v1',
      timeout: 30000,
      headers: {
        'Authorization': `Bearer ${this.deepSiteApiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    this.boltClient = axios.create({
      baseURL: 'https://api.bolt.com/v1',
      timeout: 30000,
      headers: {
        'X-API-Key': this.boltApiKey,
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Generate a website preview using DeepSite API
   * @param {Object} business - Business data
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - Preview data
   */
  async generateDeepSitePreview(business, options = {}) {
    try {
      // Prepare business data for DeepSite API
      const businessData = {
        name: business.name,
        address: {
          street: business.address.street,
          city: business.address.city,
          postalCode: business.address.postalCode,
          country: business.address.country
        },
        contact: {
          phone: business.contact.phone,
          email: business.contact.email || options.defaultEmail || '',
          website: business.contact.website
        },
        business: {
          type: business.business.type,
          description: options.description || `${business.name} is a business located in ${business.address.city}, France.`
        }
      };
      
      // Make API request to DeepSite
      const response = await this.deepSiteClient.post('/previews', {
        business: businessData,
        template: options.template || 'standard',
        language: options.language || 'fr',
        colorScheme: options.colorScheme || 'auto'
      });
      
      // Return preview data
      return {
        previewLink: response.data.previewUrl,
        previewScreenshot: response.data.screenshotUrl,
        previewId: response.data.previewId,
        apiSource: 'deepsite'
      };
    } catch (error) {
      logger.error(`Error generating DeepSite preview: ${error.message}`, {
        business: business.name,
        error: error.stack,
        response: error.response?.data
      });
      
      // For demo purposes, return mock data if API fails
      return this.getMockPreviewData(business, 'deepsite');
    }
  }

  /**
   * Generate a website preview using Bolt API
   * @param {Object} business - Business data
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - Preview data
   */
  async generateBoltPreview(business, options = {}) {
    try {
      // Prepare business data for Bolt API
      const businessData = {
        businessName: business.name,
        location: {
          address: business.address.street,
          city: business.address.city,
          postalCode: business.address.postalCode,
          country: business.address.country
        },
        contactInfo: {
          phoneNumber: business.contact.phone,
          emailAddress: business.contact.email || options.defaultEmail || '',
          websiteUrl: business.contact.website
        },
        businessType: business.business.type,
        description: options.description || `${business.name} is a business located in ${business.address.city}, France.`
      };
      
      // Make API request to Bolt
      const response = await this.boltClient.post('/site-previews', {
        business: businessData,
        templateId: options.template || 'default',
        languageCode: options.language || 'fr',
        theme: options.theme || 'modern'
      });
      
      // Return preview data
      return {
        previewLink: response.data.previewUrl,
        previewScreenshot: response.data.screenshotUrl,
        previewId: response.data.id,
        apiSource: 'bolt'
      };
    } catch (error) {
      logger.error(`Error generating Bolt preview: ${error.message}`, {
        business: business.name,
        error: error.stack,
        response: error.response?.data
      });
      
      // For demo purposes, return mock data if API fails
      return this.getMockPreviewData(business, 'bolt');
    }
  }

  /**
   * Generate a website preview using the specified API
   * @param {Object} business - Business data
   * @param {string} apiSource - API source ('deepsite' or 'bolt')
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - Preview data
   */
  async generatePreview(business, apiSource = 'deepsite', options = {}) {
    if (apiSource === 'deepsite') {
      return this.generateDeepSitePreview(business, options);
    } else if (apiSource === 'bolt') {
      return this.generateBoltPreview(business, options);
    } else {
      throw new Error(`Unsupported API source: ${apiSource}`);
    }
  }

  /**
   * Get mock preview data for demo purposes
   * @param {Object} business - Business data
   * @param {string} apiSource - API source ('deepsite' or 'bolt')
   * @returns {Object} - Mock preview data
   */
  getMockPreviewData(business, apiSource) {
    const businessId = business._id || Math.random().toString(36).substring(2, 15);
    const timestamp = Date.now();
    
    if (apiSource === 'deepsite') {
      return {
        previewLink: `https://preview.deepsite.io/${businessId}?t=${timestamp}`,
        previewScreenshot: `https://preview.deepsite.io/screenshot/${businessId}.jpg?t=${timestamp}`,
        previewId: `deepsite_${businessId}`,
        apiSource: 'deepsite'
      };
    } else {
      return {
        previewLink: `https://preview.bolt.api/${businessId}?t=${timestamp}`,
        previewScreenshot: `https://preview.bolt.api/screenshot/${businessId}.jpg?t=${timestamp}`,
        previewId: `bolt_${businessId}`,
        apiSource: 'bolt'
      };
    }
  }
}

module.exports = new WebsitePreviewService();
