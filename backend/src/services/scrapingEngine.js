const googleMapsService = require('./googleMapsService');
const inseeService = require('./inseeService');
const Business = require('../models/Business');
const ScrapingJob = require('../models/ScrapingJob');
const logger = require('../utils/logger');

/**
 * Scraping Engine
 * Handles the execution of scraping jobs and processing of scraped data
 */
class ScrapingEngine {
  /**
   * Run a scraping job
   * @param {string} jobId - ID of the scraping job to run
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - Updated job object
   */
  async runJob(jobId, options = {}) {
    try {
      // Get the job
      const job = await ScrapingJob.findById(jobId);
      if (!job) {
        throw new Error(`Scraping job with ID ${jobId} not found`);
      }

      // Update job status
      job.status = 'in_progress';
      job.startedAt = Date.now();
      job.progress = 0;
      
      // Add initial log
      job.logs.push({
        timestamp: Date.now(),
        level: 'info',
        message: `Started scraping job: ${job.name}`
      });
      
      await job.save();

      // Process based on source
      let results = [];
      
      try {
        switch (job.source) {
          case 'google_maps':
            results = await this.scrapeFromGoogleMaps(job);
            break;
          case 'insee':
            results = await this.scrapeFromInsee(job);
            break;
          default:
            throw new Error(`Unsupported source: ${job.source}`);
        }

        // Process and save results
        const savedBusinesses = await this.processResults(results, job);
        
        // Update job with results
        job.status = 'completed';
        job.completedAt = Date.now();
        job.progress = 100;
        job.resultsCount = savedBusinesses.length;
        
        // Add completion log
        job.logs.push({
          timestamp: Date.now(),
          level: 'info',
          message: `Completed scraping job: ${job.name}. Found ${savedBusinesses.length} businesses.`
        });
        
        await job.save();
        
        return job;
      } catch (error) {
        // Update job with error
        job.status = 'failed';
        job.progress = 0;
        
        // Add error log
        job.logs.push({
          timestamp: Date.now(),
          level: 'error',
          message: `Error in scraping job: ${error.message}`
        });
        
        await job.save();
        
        throw error;
      }
    } catch (error) {
      logger.error(`Error running scraping job: ${error.message}`, {
        jobId,
        error: error.stack
      });
      throw error;
    }
  }

  /**
   * Scrape data from Google Maps
   * @param {Object} job - Scraping job object
   * @returns {Promise<Array>} - Array of scraped business data
   */
  async scrapeFromGoogleMaps(job) {
    try {
      const results = [];
      
      // Log progress
      job.logs.push({
        timestamp: Date.now(),
        level: 'info',
        message: `Starting Google Maps scraping for: ${job.searchTerms.join(', ')} in ${job.locations.join(', ')}`
      });
      
      await job.save();

      // Process each search term and location combination
      for (let i = 0; i < job.searchTerms.length; i++) {
        const searchTerm = job.searchTerms[i];
        
        for (let j = 0; j < job.locations.length; j++) {
          const location = job.locations[j];
          
          // Log current search
          job.logs.push({
            timestamp: Date.now(),
            level: 'info',
            message: `Searching for "${searchTerm}" in "${location}"`
          });
          
          // Calculate and update progress
          const totalSearches = job.searchTerms.length * job.locations.length;
          const currentSearch = i * job.locations.length + j + 1;
          job.progress = Math.floor((currentSearch / totalSearches) * 100);
          
          await job.save();
          
          // Perform the search
          const searchResults = await googleMapsService.searchBusinesses(searchTerm, location);
          
          // Add results to the collection
          results.push(...searchResults);
          
          // Log results count
          job.logs.push({
            timestamp: Date.now(),
            level: 'info',
            message: `Found ${searchResults.length} results for "${searchTerm}" in "${location}"`
          });
          
          await job.save();
          
          // Avoid rate limiting
          if (j < job.locations.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }
      
      return results;
    } catch (error) {
      logger.error(`Error scraping from Google Maps: ${error.message}`, {
        job: job._id,
        error: error.stack
      });
      throw error;
    }
  }

  /**
   * Scrape data from INSEE
   * @param {Object} job - Scraping job object
   * @returns {Promise<Array>} - Array of scraped business data
   */
  async scrapeFromInsee(job) {
    try {
      const results = [];
      
      // Log progress
      job.logs.push({
        timestamp: Date.now(),
        level: 'info',
        message: `Starting INSEE scraping for locations: ${job.locations.join(', ')}`
      });
      
      await job.save();

      // Process each location
      for (let i = 0; i < job.locations.length; i++) {
        const location = job.locations[i];
        
        // Parse city and postal code
        let city = location;
        let postalCode = '';
        
        const postalMatch = location.match(/(\d{5})\s+(.+)/);
        if (postalMatch) {
          postalCode = postalMatch[1];
          city = postalMatch[2];
        }
        
        // Log current search
        job.logs.push({
          timestamp: Date.now(),
          level: 'info',
          message: `Searching in "${city}"${postalCode ? ` (${postalCode})` : ''}`
        });
        
        // Calculate and update progress
        job.progress = Math.floor(((i + 1) / job.locations.length) * 100);
        await job.save();
        
        // Prepare search options
        const searchOptions = {};
        
        // Add NAF code filter if available
        if (job.filters && job.filters.nafCode) {
          searchOptions.nafCode = job.filters.nafCode;
        }
        
        // Perform the search
        const searchResults = await inseeService.searchByLocation(city, postalCode, searchOptions);
        
        // Add results to the collection
        results.push(...searchResults);
        
        // Log results count
        job.logs.push({
          timestamp: Date.now(),
          level: 'info',
          message: `Found ${searchResults.length} results in "${city}"${postalCode ? ` (${postalCode})` : ''}`
        });
        
        await job.save();
        
        // Avoid rate limiting
        if (i < job.locations.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      return results;
    } catch (error) {
      logger.error(`Error scraping from INSEE: ${error.message}`, {
        job: job._id,
        error: error.stack
      });
      throw error;
    }
  }

  /**
   * Process and save scraped results
   * @param {Array} results - Array of scraped business data
   * @param {Object} job - Scraping job object
   * @returns {Promise<Array>} - Array of saved business objects
   */
  async processResults(results, job) {
    try {
      const savedBusinesses = [];
      
      // Log progress
      job.logs.push({
        timestamp: Date.now(),
        level: 'info',
        message: `Processing ${results.length} results`
      });
      
      await job.save();

      // Process each result
      for (let i = 0; i < results.length; i++) {
        const businessData = results[i];
        
        // Add scraping metadata
        businessData.scrapingData = {
          ...businessData.scrapingData,
          scrapedBy: job.user,
          scrapedAt: Date.now(),
          lastUpdated: Date.now()
        };
        
        try {
          // Check for existing business
          let existingBusiness = null;
          
          // Check by name and address
          if (businessData.name && businessData.address && businessData.address.city) {
            existingBusiness = await Business.findOne({
              name: businessData.name,
              'address.city': businessData.address.city,
              'address.postalCode': businessData.address.postalCode || { $exists: false }
            });
          }
          
          // Check by SIRET if available
          if (!existingBusiness && businessData.business && businessData.business.siret) {
            existingBusiness = await Business.findOne({
              'business.siret': businessData.business.siret
            });
          }
          
          let savedBusiness;
          
          if (existingBusiness) {
            // Update existing business
            existingBusiness.scrapingData.lastUpdated = Date.now();
            
            // Merge data (prioritize existing data where available)
            if (!existingBusiness.contact.phone && businessData.contact && businessData.contact.phone) {
              existingBusiness.contact.phone = businessData.contact.phone;
            }
            
            if (!existingBusiness.contact.website && businessData.contact && businessData.contact.website) {
              existingBusiness.contact.website = businessData.contact.website;
            }
            
            if (!existingBusiness.business.nafCode && businessData.business && businessData.business.nafCode) {
              existingBusiness.business.nafCode = businessData.business.nafCode;
            }
            
            if (!existingBusiness.business.siret && businessData.business && businessData.business.siret) {
              existingBusiness.business.siret = businessData.business.siret;
            }
            
            if (!existingBusiness.business.siren && businessData.business && businessData.business.siren) {
              existingBusiness.business.siren = businessData.business.siren;
            }
            
            savedBusiness = await existingBusiness.save();
          } else {
            // Create new business
            savedBusiness = await Business.create(businessData);
          }
          
          savedBusinesses.push(savedBusiness);
        } catch (error) {
          // Log error but continue processing
          job.logs.push({
            timestamp: Date.now(),
            level: 'error',
            message: `Error processing business "${businessData.name}": ${error.message}`
          });
          
          logger.error(`Error processing business: ${error.message}`, {
            business: businessData.name,
            error: error.stack
          });
        }
        
        // Update progress periodically
        if (i % 10 === 0 || i === results.length - 1) {
          job.progress = Math.floor(((i + 1) / results.length) * 100);
          await job.save();
        }
      }
      
      return savedBusinesses;
    } catch (error) {
      logger.error(`Error processing results: ${error.message}`, {
        job: job._id,
        error: error.stack
      });
      throw error;
    }
  }
}

module.exports = new ScrapingEngine();
