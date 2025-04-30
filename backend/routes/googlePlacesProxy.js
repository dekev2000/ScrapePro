const express = require('express');
const axios = require('axios');
const router = express.Router();

// Configuration
const GOOGLE_MAPS_BASE_URL = 'https://maps.googleapis.com/maps/api';

/**
 * Proxy pour l'API Google Places - Recherche à proximité
 */
router.post('/search', async (req, res) => {
  try {
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
    const geocodeResponse = await axios.get(
      `${GOOGLE_MAPS_BASE_URL}/geocode/json?address=${encodeURIComponent(
        location
      )}&key=${apiKey}`
    );

    if (
      geocodeResponse.data.status !== 'OK' ||
      !geocodeResponse.data.results ||
      geocodeResponse.data.results.length === 0
    ) {
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

    // Effectuer la recherche à proximité
    const response = await axios.get(url);

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
    const { placeId, apiKey, language } = req.body;

    // Vérifier les paramètres requis
    if (!placeId || !apiKey) {
      return res.status(400).json({
        error: 'Les paramètres placeId et apiKey sont requis'
      });
    }

    // Effectuer la recherche des détails
    const response = await axios.get(
      `${GOOGLE_MAPS_BASE_URL}/place/details/json?place_id=${placeId}&fields=name,formatted_address,formatted_phone_number,website,url,rating,user_ratings_total,business_status,opening_hours,types,photos&language=${language || 'fr'}&key=${apiKey}`
    );

    if (response.data.status !== 'OK') {
      return res.status(400).json({
        error: `Erreur API Google Places: ${response.data.status}`
      });
    }

    // Renvoyer les résultats
    return res.json(response.data.result);
  } catch (error) {
    console.error('Erreur lors de la récupération des détails du lieu:', error);
    return res.status(500).json({
      error: error.message || 'Une erreur est survenue lors de la récupération des détails du lieu'
    });
  }
});

module.exports = router;
