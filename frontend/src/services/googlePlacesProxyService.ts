import axios from 'axios';

// Création d'une instance axios personnalisée
const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api/google-places',
  withCredentials: true, // Changed to true to match CORS configuration
  headers: {
    'Content-Type': 'application/json'
  }
});

// Service pour l'API Google Places via un proxy
export const googlePlacesProxyService = {
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
      console.log('Envoi de la requête au proxy avec les paramètres:', {
        ...params,
        apiKey: params.apiKey ? '***API_KEY_HIDDEN***' : undefined
      });

      // Appel au proxy avec l'instance axios personnalisée
      const response = await apiClient.post('/search', params);

      console.log('Réponse du proxy:', response.data);

      return response.data;
    } catch (error: any) {
      console.error('Erreur lors de la recherche à proximité:', error);

      // Afficher plus de détails sur l'erreur
      if (error.response) {
        // La requête a été faite et le serveur a répondu avec un code d'état
        // qui n'est pas dans la plage 2xx
        console.error('Données de réponse d\'erreur:', error.response.data);
        console.error('Statut d\'erreur:', error.response.status);
        console.error('En-têtes d\'erreur:', error.response.headers);
      } else if (error.request) {
        // La requête a été faite mais aucune réponse n'a été reçue
        console.error('Requête sans réponse:', error.request);
      } else {
        // Une erreur s'est produite lors de la configuration de la requête
        console.error('Erreur de configuration:', error.message);
      }

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
      // Appel au proxy avec l'instance axios personnalisée
      const response = await apiClient.post('/next-page', {
        pageToken,
        apiKey,
        language: 'fr'
      });

      return response.data;
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
      console.log('Envoi de la requête de détails pour le lieu:', placeId);

      // Appel au proxy avec l'instance axios personnalisée
      const response = await apiClient.post('/details', {
        placeId,
        apiKey,
        language: 'fr'
      });

      console.log('Réponse reçue pour les détails du lieu');
      return response.data;
    } catch (error: any) {
      console.error('Erreur lors de la récupération des détails du lieu:', error);

      // Afficher plus de détails sur l'erreur
      if (error.response) {
        console.error('Données de réponse d\'erreur:', error.response.data);
        console.error('Statut d\'erreur:', error.response.status);
        console.error('En-têtes d\'erreur:', error.response.headers);
      } else if (error.request) {
        console.error('Requête sans réponse:', error.request);
      } else {
        console.error('Erreur de configuration:', error.message);
      }

      throw error;
    }
  },

  /**
   * Extrait les emails d'un site web
   * @param website URL du site web
   * @returns Liste des emails trouvés
   */
  async extractEmails(website: string) {
    try {
      // Appel au proxy avec l'instance axios personnalisée
      const response = await apiClient.post('/extract-emails', {
        website
      });

      return response.data;
    } catch (error) {
      console.error(`Erreur lors de l'extraction des emails depuis ${website}:`, error);
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
        phone: place.formatted_phone_number || '',
        email: place.email || '',
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
