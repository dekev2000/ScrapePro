import { ref } from 'vue';
import axios from 'axios';

// Compteur d'utilisation de l'API pour simuler les quotas
const apiUsage = ref({
  nearbySearch: 0,
  placeDetails: 0,
  geocoding: 0
});

// Création d'une instance axios personnalisée pour les appels au backend
const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api/google-places',
  withCredentials: true, // Permet l'envoi de cookies
  headers: {
    'Content-Type': 'application/json'
  }
});

// Données factices pour les résultats de recherche (utilisées uniquement si USE_REAL_GOOGLE_PLACES est false)
const mockBusinesses = [
  {
    place_id: 'mock_place_1',
    name: 'Restaurant Le Gourmet',
    vicinity: '123 Avenue des Champs-Élysées, Paris',
    business_status: 'OPERATIONAL',
    rating: 4.5,
    user_ratings_total: 128,
    types: ['restaurant', 'food', 'point_of_interest', 'establishment'],
    geometry: {
      location: {
        lat: 48.8566,
        lng: 2.3522
      }
    }
  },
  {
    place_id: 'mock_place_2',
    name: 'Café de Paris',
    vicinity: '45 Rue de Rivoli, Paris',
    business_status: 'OPERATIONAL',
    rating: 4.2,
    user_ratings_total: 96,
    types: ['cafe', 'restaurant', 'food', 'point_of_interest', 'establishment'],
    geometry: {
      location: {
        lat: 48.8584,
        lng: 2.3536
      }
    }
  },
  {
    place_id: 'mock_place_3',
    name: 'Boulangerie Traditionnelle',
    vicinity: '78 Rue Saint-Honoré, Paris',
    business_status: 'OPERATIONAL',
    rating: 4.8,
    user_ratings_total: 215,
    types: ['bakery', 'food', 'point_of_interest', 'establishment'],
    geometry: {
      location: {
        lat: 48.8605,
        lng: 2.3408
      }
    }
  },
  {
    place_id: 'mock_place_4',
    name: 'Librairie Ancienne',
    vicinity: '22 Rue Bonaparte, Paris',
    business_status: 'OPERATIONAL',
    rating: 4.6,
    user_ratings_total: 87,
    types: ['book_store', 'store', 'point_of_interest', 'establishment'],
    geometry: {
      location: {
        lat: 48.8539,
        lng: 2.3357
      }
    }
  },
  {
    place_id: 'mock_place_5',
    name: 'Hôtel de Luxe',
    vicinity: '228 Rue de Rivoli, Paris',
    business_status: 'OPERATIONAL',
    rating: 4.7,
    user_ratings_total: 342,
    types: ['lodging', 'point_of_interest', 'establishment'],
    geometry: {
      location: {
        lat: 48.8651,
        lng: 2.3295
      }
    }
  }
];

// Données factices pour les détails des lieux
const mockPlaceDetails = {
  'mock_place_1': {
    name: 'Restaurant Le Gourmet',
    formatted_address: '123 Avenue des Champs-Élysées, 75008 Paris, France',
    formatted_phone_number: '+33 1 23 45 67 89',
    website: 'https://www.restaurant-legourmet.fr',
    url: 'https://maps.google.com/?cid=12345678901234567890',
    rating: 4.5,
    user_ratings_total: 128,
    business_status: 'OPERATIONAL',
    opening_hours: {
      weekday_text: [
        'Lundi: 12:00 – 14:30, 19:00 – 22:30',
        'Mardi: 12:00 – 14:30, 19:00 – 22:30',
        'Mercredi: 12:00 – 14:30, 19:00 – 22:30',
        'Jeudi: 12:00 – 14:30, 19:00 – 22:30',
        'Vendredi: 12:00 – 14:30, 19:00 – 23:00',
        'Samedi: 12:00 – 15:00, 19:00 – 23:00',
        'Dimanche: 12:00 – 15:00, 19:00 – 22:00'
      ]
    },
    types: ['restaurant', 'food', 'point_of_interest', 'establishment']
  },
  'mock_place_2': {
    name: 'Café de Paris',
    formatted_address: '45 Rue de Rivoli, 75004 Paris, France',
    formatted_phone_number: '+33 1 98 76 54 32',
    website: 'https://www.cafedeparis.fr',
    url: 'https://maps.google.com/?cid=09876543210987654321',
    rating: 4.2,
    user_ratings_total: 96,
    business_status: 'OPERATIONAL',
    opening_hours: {
      weekday_text: [
        'Lundi: 07:30 – 20:00',
        'Mardi: 07:30 – 20:00',
        'Mercredi: 07:30 – 20:00',
        'Jeudi: 07:30 – 20:00',
        'Vendredi: 07:30 – 22:00',
        'Samedi: 08:00 – 22:00',
        'Dimanche: 09:00 – 18:00'
      ]
    },
    types: ['cafe', 'restaurant', 'food', 'point_of_interest', 'establishment']
  },
  'mock_place_3': {
    name: 'Boulangerie Traditionnelle',
    formatted_address: '78 Rue Saint-Honoré, 75001 Paris, France',
    formatted_phone_number: '+33 1 45 67 89 01',
    website: 'https://www.boulangerie-traditionnelle.fr',
    url: 'https://maps.google.com/?cid=13579246801357924680',
    rating: 4.8,
    user_ratings_total: 215,
    business_status: 'OPERATIONAL',
    opening_hours: {
      weekday_text: [
        'Lundi: 06:30 – 20:00',
        'Mardi: 06:30 – 20:00',
        'Mercredi: 06:30 – 20:00',
        'Jeudi: 06:30 – 20:00',
        'Vendredi: 06:30 – 20:00',
        'Samedi: 06:30 – 20:00',
        'Dimanche: 07:00 – 13:00'
      ]
    },
    types: ['bakery', 'food', 'point_of_interest', 'establishment']
  },
  'mock_place_4': {
    name: 'Librairie Ancienne',
    formatted_address: '22 Rue Bonaparte, 75006 Paris, France',
    formatted_phone_number: '+33 1 23 45 67 89',
    website: 'https://www.librairie-ancienne.fr',
    url: 'https://maps.google.com/?cid=24680135792468013579',
    rating: 4.6,
    user_ratings_total: 87,
    business_status: 'OPERATIONAL',
    opening_hours: {
      weekday_text: [
        'Lundi: 10:00 – 19:00',
        'Mardi: 10:00 – 19:00',
        'Mercredi: 10:00 – 19:00',
        'Jeudi: 10:00 – 19:00',
        'Vendredi: 10:00 – 19:00',
        'Samedi: 10:00 – 19:30',
        'Dimanche: Fermé'
      ]
    },
    types: ['book_store', 'store', 'point_of_interest', 'establishment']
  },
  'mock_place_5': {
    name: 'Hôtel de Luxe',
    formatted_address: '228 Rue de Rivoli, 75001 Paris, France',
    formatted_phone_number: '+33 1 49 49 49 49',
    website: 'https://www.hoteldeluxe.fr',
    url: 'https://maps.google.com/?cid=36925814703692581470',
    rating: 4.7,
    user_ratings_total: 342,
    business_status: 'OPERATIONAL',
    opening_hours: {
      weekday_text: [
        'Lundi: Ouvert 24h/24',
        'Mardi: Ouvert 24h/24',
        'Mercredi: Ouvert 24h/24',
        'Jeudi: Ouvert 24h/24',
        'Vendredi: Ouvert 24h/24',
        'Samedi: Ouvert 24h/24',
        'Dimanche: Ouvert 24h/24'
      ]
    },
    types: ['lodging', 'point_of_interest', 'establishment']
  }
};

// Constante pour déterminer si on utilise l'API Google Places réelle
const USE_REAL_GOOGLE_PLACES = import.meta.env.VITE_USE_REAL_GOOGLE_PLACES !== 'false';

// Service mock pour l'API Google Places
export const mockGooglePlacesService = {
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
    // Incrémenter le compteur d'utilisation
    apiUsage.value.nearbySearch++;

    if (USE_REAL_GOOGLE_PLACES) {
      try {
        // Utiliser l'API réelle via le backend
        console.log('Utilisation de l\'API Google Places réelle pour la recherche');
        console.log('Paramètres de recherche:', JSON.stringify(params, null, 2));

        // Vérifier que la clé API est présente
        if (!params.apiKey) {
          console.error('Clé API Google manquante');
          throw new Error('Clé API Google manquante. Veuillez fournir une clé API valide.');
        }

        try {
          const response = await apiClient.post('/search', params);
          console.log('Réponse de l\'API:', response.status, response.statusText);
          return response.data;
        } catch (axiosError: any) {
          console.error('Erreur Axios:', axiosError.message);

          if (axiosError.response) {
            // La requête a été faite et le serveur a répondu avec un code d'état
            console.error('Données de réponse:', axiosError.response.data);
            console.error('Statut:', axiosError.response.status);
            console.error('En-têtes:', axiosError.response.headers);

            if (axiosError.response?.data?.error) {
              throw new Error(`Erreur API: ${axiosError.response.data.error}`);
            }
          } else if (axiosError.request) {
            // La requête a été faite mais aucune réponse n'a été reçue
            console.error('Aucune réponse reçue:', axiosError.request);
            throw new Error('Aucune réponse du serveur. Veuillez vérifier que le backend est en cours d\'exécution.');
          } else {
            // Une erreur s'est produite lors de la configuration de la requête
            console.error('Erreur de configuration:', axiosError.message);
          }

          throw axiosError;
        }
      } catch (error: any) {
        console.error('Erreur lors de la recherche avec l\'API réelle:', error);
        throw error;
      }
    } else {
      // Simuler un délai réseau
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Filtrer les résultats en fonction des paramètres
      let results = [...mockBusinesses];

      // Filtrer par type si spécifié
      if (params.type) {
        results = results.filter(business =>
          business.types.includes(params.type ?? '')
        );
      }

      // Filtrer par mot-clé si spécifié
      if (params.keyword) {
        const keyword = params.keyword.toLowerCase();
        results = results.filter(business =>
          business.name.toLowerCase().includes(keyword) ||
          business.types.some(type => type.includes(keyword))
        );
      }

      // Simuler un token de page suivante si plus de 3 résultats
      const nextPageToken = results.length > 3 ? 'mock_next_page_token' : null;

      // Limiter à 3 résultats pour simuler la pagination
      results = results.slice(0, 3);

      return {
        results,
        nextPageToken
      };
    }
  },

  /**
   * Récupère la page suivante de résultats
   * @param pageToken Token de page suivante
   * @param apiKey Clé API Google
   * @param language Langue des résultats
   * @returns Liste des entreprises trouvées
   */
  async getNextPage(pageToken: string, apiKey: string, language: string = 'fr') {
    // Incrémenter le compteur d'utilisation
    apiUsage.value.nearbySearch++;

    if (USE_REAL_GOOGLE_PLACES) {
      try {
        // Utiliser l'API réelle via le backend
        console.log('Utilisation de l\'API Google Places réelle pour la page suivante');
        const response = await apiClient.post('/next-page', {
          pageToken,
          apiKey,
          language
        });
        return response.data;
      } catch (error) {
        console.error('Erreur lors de la récupération de la page suivante avec l\'API réelle:', error);
        throw error;
      }
    } else {
      // Simuler un délai réseau
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Retourner les résultats restants
      const results = mockBusinesses.slice(3);

      return {
        results,
        nextPageToken: null
      };
    }
  },

  /**
   * Récupère les détails d'un lieu
   * @param placeId ID du lieu
   * @param apiKey Clé API Google
   * @param language Langue des résultats
   * @returns Détails du lieu
   */
  async getPlaceDetails(placeId: string, apiKey: string, language: string = 'fr') {
    // Incrémenter le compteur d'utilisation
    apiUsage.value.placeDetails++;

    if (USE_REAL_GOOGLE_PLACES) {
      try {
        // Utiliser l'API réelle via le backend
        console.log('Utilisation de l\'API Google Places réelle pour les détails');
        const response = await apiClient.post('/details', {
          placeId,
          apiKey,
          language
        });
        return response.data;
      } catch (error) {
        console.error('Erreur lors de la récupération des détails avec l\'API réelle:', error);
        throw error;
      }
    } else {
      // Simuler un délai réseau
      await new Promise(resolve => setTimeout(resolve, 800));

      // Récupérer les détails du lieu
      const details = mockPlaceDetails[placeId as keyof typeof mockPlaceDetails];

      if (!details) {
        throw new Error(`Place with ID ${placeId} not found`);
      }

      return details;
    }
  },

  /**
   * Extrait les emails d'un site web
   * @param website URL du site web
   * @returns Liste des emails trouvés
   */
  async extractEmails(website: string) {
    if (USE_REAL_GOOGLE_PLACES) {
      try {
        // Utiliser l'API réelle via le backend
        console.log('Utilisation de l\'API d\'extraction d\'emails réelle');
        const response = await apiClient.post('/extract-emails', {
          website
        });
        return response.data;
      } catch (error) {
        console.error('Erreur lors de l\'extraction des emails avec l\'API réelle:', error);
        throw error;
      }
    } else {
      // Simuler un délai réseau
      await new Promise(resolve => setTimeout(resolve, 1200));

      // Générer des emails factices basés sur le nom de domaine
      const domain = website.replace(/^https?:\/\/(?:www\.)?/, '').split('/')[0];
      const emails = [
        `contact@${domain}`,
        `info@${domain}`
      ];

      return {
        website,
        emails,
        count: emails.length
      };
    }
  },

  /**
   * Récupère les statistiques d'utilisation de l'API
   * @returns Statistiques d'utilisation
   */
  getApiUsage() {
    return apiUsage.value;
  },

  /**
   * Réinitialise les statistiques d'utilisation de l'API
   */
  resetApiUsage() {
    apiUsage.value = {
      nearbySearch: 0,
      placeDetails: 0,
      geocoding: 0
    };
  }
};
