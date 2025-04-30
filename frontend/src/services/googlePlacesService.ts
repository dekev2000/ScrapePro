import axios from 'axios';

// Créer une instance axios spécifique pour les API Google
const googleAxios = axios.create({
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Configuration
const API_BASE_URL = 'https://maps.googleapis.com/maps/api/place';

// Service pour l'API Google Places
export const googlePlacesService = {
  /**
   * Recherche des entreprises à proximité d'un lieu
   * @param params Paramètres de recherche
   * @returns Liste des entreprises trouvées
   */
  async nearbySearch(params: {
    location: string;
    keyword?: string;
    radius?: number;
    type?: string;
    apiKey: string;
    rankby?: string;
    opennow?: boolean;
    minprice?: number;
    maxprice?: number;
    language?: string;
  }) {
    try {
      const {
        location,
        keyword = '',
        radius,
        type = '',
        apiKey,
        rankby,
        opennow,
        minprice,
        maxprice,
        language = 'fr'
      } = params;

      // Convertir l'adresse en coordonnées géographiques
      const geocodeResponse = await googleAxios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          location
        )}&key=${apiKey}`
      );

      if (
        geocodeResponse.data.status !== 'OK' ||
        !geocodeResponse.data.results ||
        geocodeResponse.data.results.length === 0
      ) {
        throw new Error(`Impossible de géocoder l'adresse: ${location}`);
      }

      const { lat, lng } = geocodeResponse.data.results[0].geometry.location;

      // Construire l'URL avec les paramètres
      let url = `${API_BASE_URL}/nearbysearch/json?location=${lat},${lng}`;

      // Ajouter soit radius soit rankby (mutuellement exclusifs)
      if (rankby === 'distance') {
        url += `&rankby=distance`;
      } else if (radius) {
        url += `&radius=${radius}`;
      } else {
        url += `&radius=5000`; // Valeur par défaut
      }

      // Ajouter les autres paramètres
      if (keyword) {
        url += `&keyword=${encodeURIComponent(keyword)}`;
      }

      if (type) {
        url += `&type=${type}`;
      }

      // Paramètres optionnels
      if (opennow) {
        url += `&opennow=true`;
      }

      if (minprice !== undefined) {
        url += `&minprice=${minprice}`;
      }

      if (maxprice !== undefined) {
        url += `&maxprice=${maxprice}`;
      }

      // Ajouter la langue et la clé API
      url += `&language=${language}&key=${apiKey}`;

      // Effectuer la recherche à proximité
      const response = await googleAxios.get(url);

      if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
        throw new Error(`Erreur API Google Places: ${response.data.status}`);
      }

      return {
        results: response.data.results || [],
        nextPageToken: response.data.next_page_token || null,
      };
    } catch (error) {
      console.error('Erreur lors de la recherche à proximité:', error);
      throw error;
    }
  },

  /**
   * Obtient la page suivante de résultats
   * @param pageToken Token de page suivante
   * @param apiKey Clé API Google
   * @returns Liste des entreprises trouvées
   */
  async getNextPage(pageToken: string, apiKey: string) {
    try {
      // Attendre 2 secondes car le token de page suivante n'est pas immédiatement disponible
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const response = await googleAxios.get(
        `${API_BASE_URL}/nearbysearch/json?pagetoken=${pageToken}&language=fr&key=${apiKey}`
      );

      if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
        throw new Error(`Erreur API Google Places: ${response.data.status}`);
      }

      return {
        results: response.data.results || [],
        nextPageToken: response.data.next_page_token || null,
      };
    } catch (error) {
      console.error('Erreur lors de la récupération de la page suivante:', error);
      throw error;
    }
  },

  /**
   * Obtient les détails d'un lieu
   * @param placeId ID du lieu
   * @param apiKey Clé API Google
   * @returns Détails du lieu
   */
  async getPlaceDetails(placeId: string, apiKey: string) {
    try {
      const response = await googleAxios.get(
        `${API_BASE_URL}/details/json?place_id=${placeId}&fields=name,formatted_address,formatted_phone_number,website,url,rating,user_ratings_total,business_status,opening_hours,types,photos&language=fr&key=${apiKey}`
      );

      if (response.data.status !== 'OK') {
        throw new Error(`Erreur API Google Places: ${response.data.status}`);
      }

      return response.data.result;
    } catch (error) {
      console.error('Erreur lors de la récupération des détails du lieu:', error);
      throw error;
    }
  },

  /**
   * Transforme les résultats de l'API Google Places en format compatible avec l'application
   * @param places Lieux trouvés via l'API Google Places
   * @returns Entreprises formatées pour l'application
   */
  transformPlacesToBusinesses(places: any[]) {
    return places.map((place) => ({
      name: place.name,
      address: {
        street: place.vicinity || '',
        city: extractCity(place.vicinity || ''),
        postalCode: '',
        country: '',
        formatted: place.vicinity || '',
      },
      contact: {
        phone: '',
        email: '',
      },
      website: '',
      business: {
        type: place.types ? place.types[0] : '',
        rating: place.rating || 0,
        reviewCount: place.user_ratings_total || 0,
        priceLevel: place.price_level || 0,
      },
      source: {
        type: 'google_maps',
        id: place.place_id,
        url: `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
      },
      status: 'prospect',
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  },
};

// Fonction utilitaire pour extraire la ville à partir d'une adresse
function extractCity(address: string): string {
  // Logique simple pour extraire la ville (à améliorer selon le format des adresses)
  const parts = address.split(',');
  if (parts.length > 1) {
    return parts[parts.length - 1].trim();
  }
  return '';
}
