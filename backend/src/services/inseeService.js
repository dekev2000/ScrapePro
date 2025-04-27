const axios = require('axios');
const logger = require('../utils/logger');

/**
 * INSEE API Service
 * Handles interactions with the French business registry API (INSEE)
 */
class InseeService {
  constructor() {
    this.apiKey = process.env.INSEE_API_KEY;
    this.baseUrl = 'https://api.insee.fr/entreprises/sirene/V3';
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Accept': 'application/json'
      }
    });
  }

  /**
   * Initialize the service with a new token if needed
   * INSEE tokens need to be refreshed periodically
   */
  async initialize() {
    // In a real implementation, this would handle token refresh
    // For now, we'll assume the token in .env is valid
    return true;
  }

  /**
   * Search for businesses by name
   * @param {string} name - Business name
   * @param {Object} options - Additional options
   * @returns {Promise<Array>} - Array of business results
   */
  async searchByName(name, options = {}) {
    try {
      await this.initialize();
      
      const response = await this.client.get('/siret', {
        params: {
          q: `denominationUniteLegale:"${name}"`,
          nombre: options.limit || 20,
          debut: options.offset || 0
        }
      });

      if (!response.data || !response.data.etablissements) {
        return [];
      }

      return response.data.etablissements.map(this.formatBusinessData);
    } catch (error) {
      logger.error('Error searching businesses by name with INSEE API', {
        name,
        error: error.message,
        response: error.response?.data
      });
      throw error;
    }
  }

  /**
   * Search for businesses by location
   * @param {string} city - City name
   * @param {string} postalCode - Postal code
   * @param {Object} options - Additional options
   * @returns {Promise<Array>} - Array of business results
   */
  async searchByLocation(city, postalCode = '', options = {}) {
    try {
      await this.initialize();
      
      let query = `libelleCommuneEtablissement:"${city}"`;
      if (postalCode) {
        query += ` AND codePostalEtablissement:${postalCode}`;
      }
      
      if (options.nafCode) {
        query += ` AND activitePrincipaleEtablissement:${options.nafCode}`;
      }

      const response = await this.client.get('/siret', {
        params: {
          q: query,
          nombre: options.limit || 20,
          debut: options.offset || 0
        }
      });

      if (!response.data || !response.data.etablissements) {
        return [];
      }

      return response.data.etablissements.map(this.formatBusinessData);
    } catch (error) {
      logger.error('Error searching businesses by location with INSEE API', {
        city,
        postalCode,
        error: error.message,
        response: error.response?.data
      });
      throw error;
    }
  }

  /**
   * Get business details by SIRET
   * @param {string} siret - SIRET number
   * @returns {Promise<Object>} - Business details
   */
  async getBusinessBySiret(siret) {
    try {
      await this.initialize();
      
      const response = await this.client.get(`/siret/${siret}`);

      if (!response.data || !response.data.etablissement) {
        throw new Error('Business not found');
      }

      return this.formatBusinessData(response.data.etablissement);
    } catch (error) {
      logger.error('Error getting business by SIRET with INSEE API', {
        siret,
        error: error.message,
        response: error.response?.data
      });
      throw error;
    }
  }

  /**
   * Format INSEE business data to match our business model
   * @param {Object} data - INSEE business data
   * @returns {Object} - Formatted business data
   */
  formatBusinessData(data) {
    const uniteLegale = data.uniteLegale || {};
    const adresseEtablissement = data.adresseEtablissement || {};
    
    return {
      name: uniteLegale.denominationUniteLegale || 
            (uniteLegale.prenom1UniteLegale && uniteLegale.nomUniteLegale ? 
              `${uniteLegale.prenom1UniteLegale} ${uniteLegale.nomUniteLegale}` : 
              'Unknown'),
      address: {
        street: [
          adresseEtablissement.numeroVoieEtablissement,
          adresseEtablissement.typeVoieEtablissement,
          adresseEtablissement.libelleVoieEtablissement
        ].filter(Boolean).join(' '),
        city: adresseEtablissement.libelleCommuneEtablissement || '',
        postalCode: adresseEtablissement.codePostalEtablissement || '',
        country: 'France'
      },
      business: {
        type: data.activitePrincipaleEtablissement || '',
        nafCode: data.activitePrincipaleEtablissement || '',
        siret: data.siret || '',
        siren: data.siren || uniteLegale.siren || ''
      },
      scrapingData: {
        source: 'insee',
        rawData: data
      }
    };
  }
}

module.exports = new InseeService();
