const express = require('express');
const axios = require('axios');
const router = express.Router();
const emailExtractor = require('../services/emailExtractor');

// Configuration
const GOOGLE_MAPS_BASE_URL = 'https://maps.googleapis.com/maps/api';

/**
 * Proxy pour l'API Google Places - Recherche à proximité
 */
router.post('/search', async (req, res) => {
  try {
    console.log('Requête reçue sur /api/google-places/search:', req.body);

    const {
      location,
      keyword,
      radius,
      type,
      apiKey,
      language,
      rankby,
      opennow,
      minprice,
      maxprice
    } = req.body;

    // Vérifier les paramètres requis
    if (!location || !apiKey) {
      return res.status(400).json({
        error: 'Les paramètres location et apiKey sont requis'
      });
    }

    // Vérifier que soit radius soit rankby est fourni, mais pas les deux
    if (rankby === 'distance' && radius) {
      return res.status(400).json({
        error: 'Les paramètres radius et rankby=distance ne peuvent pas être utilisés ensemble'
      });
    }

    if (!radius && rankby !== 'distance') {
      return res.status(400).json({
        error: 'Vous devez spécifier soit radius soit rankby=distance'
      });
    }

    // Convertir l'adresse en coordonnées géographiques
    console.log(`Géocodage de l'adresse: ${location}`);
    const geocodeUrl = `${GOOGLE_MAPS_BASE_URL}/geocode/json?address=${encodeURIComponent(
      location
    )}&key=${apiKey}`;
    console.log('URL de géocodage:', geocodeUrl);

    const geocodeResponse = await axios.get(geocodeUrl);

    console.log('Réponse du géocodage:', {
      status: geocodeResponse.data.status,
      hasResults: !!geocodeResponse.data.results,
      resultsLength: geocodeResponse.data.results ? geocodeResponse.data.results.length : 0
    });

    if (
      geocodeResponse.data.status !== 'OK' ||
      !geocodeResponse.data.results ||
      geocodeResponse.data.results.length === 0
    ) {
      console.error('Erreur de géocodage:', geocodeResponse.data);
      return res.status(400).json({
        error: `Impossible de géocoder l'adresse: ${location}`,
        status: geocodeResponse.data.status
      });
    }

    const { lat, lng } = geocodeResponse.data.results[0].geometry.location;

    // Construire l'URL avec les paramètres
    let url = `${GOOGLE_MAPS_BASE_URL}/place/nearbysearch/json?location=${lat},${lng}`;

    // Ajouter soit radius soit rankby (mutuellement exclusifs)
    if (rankby === 'distance') {
      url += `&rankby=distance`;
    } else {
      url += `&radius=${radius || 5000}`;
    }

    // Ajouter les autres paramètres
    if (keyword) {
      url += `&keyword=${encodeURIComponent(keyword)}`;
    }

    if (type) {
      url += `&type=${type}`;
    }

    // Paramètres optionnels
    if (req.body.opennow) {
      url += `&opennow=true`;
    }

    if (req.body.minprice !== undefined) {
      url += `&minprice=${req.body.minprice}`;
    }

    if (req.body.maxprice !== undefined) {
      url += `&maxprice=${req.body.maxprice}`;
    }

    // Ajouter la langue et la clé API
    url += `&language=${language || 'fr'}&key=${apiKey}`;

    console.log('URL de recherche à proximité:', url);

    // Effectuer la recherche à proximité
    const response = await axios.get(url);

    console.log('Réponse de la recherche à proximité:', {
      status: response.data.status,
      hasResults: !!response.data.results,
      resultsLength: response.data.results ? response.data.results.length : 0
    });

    if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
      return res.status(400).json({
        error: `Erreur API Google Places: ${response.data.status}`
      });
    }

    // Renvoyer les résultats
    return res.json({
      results: response.data.results || [],
      nextPageToken: response.data.next_page_token || null
    });
  } catch (error) {
    console.error('Erreur lors de la recherche à proximité:', error);
    return res.status(500).json({
      error: error.message || 'Une erreur est survenue lors de la recherche'
    });
  }
});

/**
 * Proxy pour l'API Google Places - Page suivante
 */
router.post('/next-page', async (req, res) => {
  try {
    const { pageToken, apiKey, language } = req.body;

    // Vérifier les paramètres requis
    if (!pageToken || !apiKey) {
      return res.status(400).json({
        error: 'Les paramètres pageToken et apiKey sont requis'
      });
    }

    // Attendre 2 secondes car le token de page suivante n'est pas immédiatement disponible
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Effectuer la recherche avec le token de page
    const response = await axios.get(
      `${GOOGLE_MAPS_BASE_URL}/place/nearbysearch/json?pagetoken=${pageToken}&language=${language || 'fr'}&key=${apiKey}`
    );

    if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
      return res.status(400).json({
        error: `Erreur API Google Places: ${response.data.status}`
      });
    }

    // Renvoyer les résultats
    return res.json({
      results: response.data.results || [],
      nextPageToken: response.data.next_page_token || null
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la page suivante:', error);
    return res.status(500).json({
      error: error.message || 'Une erreur est survenue lors de la récupération de la page suivante'
    });
  }
});

/**
 * Proxy pour l'API Google Places - Détails d'un lieu
 */
router.post('/details', async (req, res) => {
  try {
    console.log('Requête reçue sur /api/google-places/details:', req.body);

    const { placeId, apiKey, language } = req.body;

    // Vérifier les paramètres requis
    if (!placeId || !apiKey) {
      console.error('Paramètres manquants:', { placeId, apiKey });
      return res.status(400).json({
        error: 'Les paramètres placeId et apiKey sont requis'
      });
    }

    // Effectuer la recherche des détails (sans le champ email qui n'est pas supporté)
    const googleApiUrl = `${GOOGLE_MAPS_BASE_URL}/place/details/json?place_id=${placeId}&fields=name,formatted_address,formatted_phone_number,website,url,rating,user_ratings_total,business_status,opening_hours,types,photos&language=${language || 'fr'}&key=${apiKey}`;

    console.log('Appel à l\'API Google Places:', googleApiUrl.replace(apiKey, '***API_KEY_HIDDEN***'));

    const response = await axios.get(googleApiUrl);

    console.log('Réponse de l\'API Google Places - Status:', response.data.status);

    if (response.data.status !== 'OK') {
      console.error('Erreur API Google Places:', response.data.status);
      console.error('Message d\'erreur:', response.data.error_message || 'Pas de message d\'erreur');
      console.error('Réponse complète:', JSON.stringify(response.data, null, 2));

      return res.status(400).json({
        error: `Erreur API Google Places: ${response.data.status}`,
        message: response.data.error_message || 'Pas de message d\'erreur',
        details: response.data
      });
    }

    console.log('Détails du lieu récupérés avec succès');

    // Extraire l'email du site web si disponible
    const result = response.data.result;

    // Vérifier si le résultat contient déjà un email
    if (!result.email && result.website) {
      try {
        console.log(`Tentative d'extraction d'email depuis le site web: ${result.website}`);

        // Extraire les emails du site web principal
        const emailsFromWebsite = await emailExtractor.extractEmailsFromWebsite(result.website);

        // Si aucun email n'est trouvé sur la page principale, essayer les pages de contact
        if (emailsFromWebsite.length === 0) {
          console.log(`Aucun email trouvé sur la page principale, tentative sur les pages de contact...`);
          const emailsFromContactPage = await emailExtractor.extractEmailsFromContactPage(result.website);

          if (emailsFromContactPage.length > 0) {
            result.email = emailsFromContactPage[0]; // Utiliser le premier email trouvé
            console.log(`Email trouvé sur la page de contact: ${result.email}`);
          }
        } else {
          result.email = emailsFromWebsite[0]; // Utiliser le premier email trouvé
          console.log(`Email trouvé sur la page principale: ${result.email}`);
        }
      } catch (emailError) {
        console.error(`Erreur lors de l'extraction de l'email depuis ${result.website}:`, emailError);
        // Ne pas échouer la requête si l'extraction d'email échoue
      }
    }

    // Renvoyer les résultats
    return res.json(result);
  } catch (error) {
    console.error('Erreur lors de la récupération des détails du lieu:', error);
    return res.status(500).json({
      error: error.message || 'Une erreur est survenue lors de la récupération des détails du lieu'
    });
  }
});

/**
 * Route pour extraire les emails d'un site web
 */
router.post('/extract-emails', async (req, res) => {
  try {
    const { website } = req.body;

    if (!website) {
      return res.status(400).json({
        error: 'Le paramètre website est requis'
      });
    }

    console.log(`Tentative d'extraction d'emails depuis: ${website}`);

    // Extraire les emails du site web principal
    const emailsFromWebsite = await emailExtractor.extractEmailsFromWebsite(website);

    // Si aucun email n'est trouvé sur la page principale, essayer les pages de contact
    let allEmails = [...emailsFromWebsite];

    if (emailsFromWebsite.length === 0) {
      console.log(`Aucun email trouvé sur la page principale, tentative sur les pages de contact...`);
      const emailsFromContactPage = await emailExtractor.extractEmailsFromContactPage(website);
      allEmails = [...allEmails, ...emailsFromContactPage];
    }

    return res.json({
      website,
      emails: allEmails,
      count: allEmails.length
    });
  } catch (error) {
    console.error(`Erreur lors de l'extraction des emails depuis ${req.body.website}:`, error);
    return res.status(500).json({
      error: error.message || 'Une erreur est survenue lors de l\'extraction des emails'
    });
  }
});

module.exports = router;
