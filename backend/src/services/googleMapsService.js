const axios = require('axios');
const logger = require('../utils/logger');

/**
 * Google Maps API Service
 * Handles interactions with Google Maps/Places API
 */
class GoogleMapsService {
  constructor() {
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY;
    this.baseUrl = 'https://maps.googleapis.com/maps/api';
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
      params: {
        key: this.apiKey
      }
    });
  }

  /**
   * Search for businesses by query and location
   * @param {string} query - Search query (e.g., "restaurants", "plumbers")
   * @param {string} location - Location (e.g., "Paris, France")
   * @param {Object} options - Additional options
   * @returns {Promise<Array>} - Array of business results
   */
  async searchBusinesses(query, location, options = {}) {
    try {
      const response = await this.client.get('/place/textsearch/json', {
        params: {
          query: `${query} in ${location}`,
          language: 'fr',
          ...options
        }
      });

      if (response.data.status !== 'OK') {
        logger.error(`Google Maps API error: ${response.data.status}`, {
          query,
          location,
          error: response.data.error_message
        });
        throw new Error(`Google Maps API error: ${response.data.status}`);
      }

      return response.data.results.map(place => this.formatPlaceData(place));
    } catch (error) {
      logger.error('Error searching businesses with Google Maps API', {
        query,
        location,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Get business details by place ID
   * @param {string} placeId - Google Place ID
   * @returns {Promise<Object>} - Business details
   */
  async getBusinessDetails(placeId) {
    try {
      const response = await this.client.get('/place/details/json', {
        params: {
          place_id: placeId,
          fields: 'name,formatted_address,formatted_phone_number,website,url,business_status,geometry,types,opening_hours',
          language: 'fr'
        }
      });

      if (response.data.status !== 'OK') {
        logger.error(`Google Maps API error: ${response.data.status}`, {
          placeId,
          error: response.data.error_message
        });
        throw new Error(`Google Maps API error: ${response.data.status}`);
      }

      return this.formatPlaceData(response.data.result, true);
    } catch (error) {
      logger.error('Error getting business details with Google Maps API', {
        placeId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Search for businesses by location radius
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @param {number} radius - Radius in meters (max 50000)
   * @param {string} type - Business type (e.g., "restaurant", "store")
   * @param {Object} options - Additional options
   * @returns {Promise<Array>} - Array of business results
   */
  async searchByRadius(lat, lng, radius = 5000, type = '', options = {}) {
    try {
      const response = await this.client.get('/place/nearbysearch/json', {
        params: {
          location: `${lat},${lng}`,
          radius: Math.min(radius, 50000), // Google's max radius is 50km
          type,
          language: 'fr',
          ...options
        }
      });

      if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
        logger.error(`Google Maps API error: ${response.data.status}`, {
          location: `${lat},${lng}`,
          radius,
          type,
          error: response.data.error_message
        });
        throw new Error(`Google Maps API error: ${response.data.status}`);
      }

      return (response.data.results || []).map(place => this.formatPlaceData(place));
    } catch (error) {
      logger.error('Error searching businesses by radius with Google Maps API', {
        location: `${lat},${lng}`,
        radius,
        type,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Format place data to match our business model
   * @param {Object} place - Google Place data
   * @param {boolean} isDetailed - Whether this is from a detailed request
   * @returns {Object} - Formatted business data
   */
  formatPlaceData(place, isDetailed = false) {
    // Extract postal code and city from formatted address
    let postalCode = '';
    let city = '';
    
    if (place.formatted_address) {
      const addressParts = place.formatted_address.split(',');
      if (addressParts.length >= 2) {
        const cityPart = addressParts[addressParts.length - 2].trim();
        const cityMatch = cityPart.match(/(\d{5})\s+(.+)/);
        if (cityMatch) {
          postalCode = cityMatch[1];
          city = cityMatch[2];
        } else {
          city = cityPart;
        }
      }
    }

    return {
      name: place.name,
      address: {
        street: place.vicinity || (place.formatted_address ? place.formatted_address.split(',')[0].trim() : ''),
        city: city,
        postalCode: postalCode,
        country: 'France',
        coordinates: place.geometry ? {
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng
        } : null
      },
      contact: {
        phone: place.formatted_phone_number || '',
        website: place.website || '',
      },
      business: {
        type: place.types ? place.types[0] : '',
        // NAF code would need to be determined separately, not available in Google data
      },
      scrapingData: {
        source: 'google_maps',
        googlePlaceId: place.place_id,
        rawData: isDetailed ? place : null
      }
    };
  }
}

module.exports = new GoogleMapsService();
