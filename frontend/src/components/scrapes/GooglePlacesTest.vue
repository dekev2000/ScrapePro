<template>
  <div class="google-places-test">
    <h2>Test de l'API Google Places</h2>
    <p>Utilisez ce formulaire pour tester l'API Google Places et voir les résultats.</p>

    <div class="form-container">
      <div class="form-group">
        <label for="api-key">Clé API Google <span class="required">*</span></label>
        <input
          type="text"
          id="api-key"
          v-model="apiKey"
          placeholder="Entrez votre clé API Google"
          required
        />
        <span class="help-text">Votre clé API Google Places</span>
      </div>

      <div class="form-group">
        <label for="location">Lieu <span class="required">*</span></label>
        <input
          type="text"
          id="location"
          v-model="location"
          placeholder="Ex: Paris, France"
          required
        />
        <span class="help-text">Ville ou adresse où rechercher</span>
      </div>

      <div class="form-group">
        <label for="keyword">Mot-clé <span class="required">*</span></label>
        <input
          type="text"
          id="keyword"
          v-model="keyword"
          placeholder="Ex: restaurant, plombier, etc."
          required
        />
        <span class="help-text">Type d'entreprise à rechercher</span>
      </div>

      <div class="form-group">
        <label for="search-method">Méthode de recherche</label>
        <select
          id="search-method"
          v-model="searchMethod"
        >
          <option value="radius">Par rayon</option>
          <option value="distance">Par distance</option>
        </select>
        <span class="help-text">Méthode de recherche des lieux</span>
      </div>

      <div
        class="form-group"
        v-if="searchMethod === 'radius'"
      >
        <label for="radius">Rayon (mètres)</label>
        <input
          type="number"
          id="radius"
          v-model="radius"
          min="1"
          max="50000"
          placeholder="5000"
        />
        <span class="help-text">Rayon de recherche en mètres (max: 50000)</span>
      </div>

      <div class="form-group">
        <label for="opennow">Établissements ouverts</label>
        <input
          type="checkbox"
          id="opennow"
          v-model="opennow"
        />
        <span class="help-text">Afficher uniquement les établissements actuellement ouverts</span>
      </div>

      <div class="form-group">
        <label for="price-level">Niveau de prix</label>
        <div class="price-range">
          <select
            id="minprice"
            v-model="minprice"
          >
            <option value="">Min</option>
            <option value="0">€</option>
            <option value="1">€€</option>
            <option value="2">€€€</option>
            <option value="3">€€€€</option>
          </select>
          <span>à</span>
          <select
            id="maxprice"
            v-model="maxprice"
          >
            <option value="">Max</option>
            <option value="0">€</option>
            <option value="1">€€</option>
            <option value="2">€€€</option>
            <option value="3">€€€€</option>
            <option value="4">€€€€€</option>
          </select>
        </div>
        <span class="help-text">Filtrer par niveau de prix (0=Économique, 4=Luxe)</span>
      </div>

      <div class="form-group">
        <label for="type">Type de lieu</label>
        <select
          id="type"
          v-model="type"
        >
          <option value="">Tous</option>
          <option value="accounting">Comptabilité</option>
          <option value="airport">Aéroport</option>
          <option value="amusement_park">Parc d'attractions</option>
          <option value="aquarium">Aquarium</option>
          <option value="art_gallery">Galerie d'art</option>
          <option value="atm">Distributeur</option>
          <option value="bakery">Boulangerie</option>
          <option value="bank">Banque</option>
          <option value="bar">Bar</option>
          <option value="beauty_salon">Salon de beauté</option>
          <option value="bicycle_store">Magasin de vélos</option>
          <option value="book_store">Librairie</option>
          <option value="bowling_alley">Bowling</option>
          <option value="cafe">Café</option>
          <option value="car_dealer">Concessionnaire</option>
          <option value="car_rental">Location de voitures</option>
          <option value="car_repair">Réparation auto</option>
          <option value="car_wash">Lavage auto</option>
          <option value="casino">Casino</option>
          <option value="cemetery">Cimetière</option>
          <option value="church">Église</option>
          <option value="city_hall">Mairie</option>
          <option value="clothing_store">Magasin de vêtements</option>
          <option value="convenience_store">Épicerie</option>
          <option value="dentist">Dentiste</option>
          <option value="department_store">Grand magasin</option>
          <option value="doctor">Médecin</option>
          <option value="drugstore">Pharmacie</option>
          <option value="electrician">Électricien</option>
          <option value="electronics_store">Magasin d'électronique</option>
          <option value="embassy">Ambassade</option>
          <option value="fire_station">Caserne de pompiers</option>
          <option value="florist">Fleuriste</option>
          <option value="funeral_home">Pompes funèbres</option>
          <option value="furniture_store">Magasin de meubles</option>
          <option value="gas_station">Station-service</option>
          <option value="gym">Salle de sport</option>
          <option value="hair_care">Coiffeur</option>
          <option value="hardware_store">Quincaillerie</option>
          <option value="hindu_temple">Temple hindou</option>
          <option value="home_goods_store">Magasin d'articles ménagers</option>
          <option value="hospital">Hôpital</option>
          <option value="insurance_agency">Agence d'assurance</option>
          <option value="jewelry_store">Bijouterie</option>
          <option value="laundry">Laverie</option>
          <option value="lawyer">Avocat</option>
          <option value="library">Bibliothèque</option>
          <option value="light_rail_station">Station de tramway</option>
          <option value="liquor_store">Magasin d'alcool</option>
          <option value="local_government_office">Administration locale</option>
          <option value="locksmith">Serrurier</option>
          <option value="lodging">Hébergement</option>
          <option value="meal_delivery">Livraison de repas</option>
          <option value="meal_takeaway">Plats à emporter</option>
          <option value="mosque">Mosquée</option>
          <option value="movie_rental">Location de films</option>
          <option value="movie_theater">Cinéma</option>
          <option value="moving_company">Entreprise de déménagement</option>
          <option value="museum">Musée</option>
          <option value="night_club">Boîte de nuit</option>
          <option value="painter">Peintre</option>
          <option value="park">Parc</option>
          <option value="parking">Parking</option>
          <option value="pet_store">Animalerie</option>
          <option value="pharmacy">Pharmacie</option>
          <option value="physiotherapist">Kinésithérapeute</option>
          <option value="plumber">Plombier</option>
          <option value="police">Police</option>
          <option value="post_office">Bureau de poste</option>
          <option value="primary_school">École primaire</option>
          <option value="real_estate_agency">Agence immobilière</option>
          <option value="restaurant">Restaurant</option>
          <option value="roofing_contractor">Couvreur</option>
          <option value="rv_park">Camping-car</option>
          <option value="school">École</option>
          <option value="secondary_school">Collège/Lycée</option>
          <option value="shoe_store">Magasin de chaussures</option>
          <option value="shopping_mall">Centre commercial</option>
          <option value="spa">Spa</option>
          <option value="stadium">Stade</option>
          <option value="storage">Stockage</option>
          <option value="store">Magasin</option>
          <option value="subway_station">Station de métro</option>
          <option value="supermarket">Supermarché</option>
          <option value="synagogue">Synagogue</option>
          <option value="taxi_stand">Station de taxi</option>
          <option value="tourist_attraction">Attraction touristique</option>
          <option value="train_station">Gare</option>
          <option value="transit_station">Station de transport</option>
          <option value="travel_agency">Agence de voyage</option>
          <option value="university">Université</option>
          <option value="veterinary_care">Vétérinaire</option>
          <option value="zoo">Zoo</option>
        </select>
        <span class="help-text">Type spécifique de lieu (optionnel)</span>
      </div>

      <div class="form-actions">
        <button
          type="button"
          class="btn primary"
          @click="searchPlaces"
          :disabled="loading || !isFormValid"
        >
          <i :class="loading ? 'fas fa-spinner fa-spin' : 'fas fa-search'"></i>
          {{ loading ? 'Recherche en cours...' : 'Rechercher' }}
        </button>
      </div>
    </div>

    <div
      v-if="error"
      class="error-message"
    >
      <i class="fas fa-exclamation-triangle"></i>
      {{ error }}
    </div>

    <div
      v-if="results.length > 0"
      class="results-container"
    >
      <h3>Résultats ({{ results.length }})</h3>

      <div class="results-actions">
        <button
          v-if="nextPageToken"
          type="button"
          class="btn secondary"
          @click="loadNextPage"
          :disabled="loadingNextPage"
        >
          <i :class="loadingNextPage ? 'fas fa-spinner fa-spin' : 'fas fa-plus'"></i>
          {{ loadingNextPage ? 'Chargement...' : 'Charger plus de résultats' }}
        </button>

        <button
          type="button"
          class="btn success"
          @click="importResults"
          :disabled="loading"
        >
          <i class="fas fa-file-import"></i>
          Importer les résultats
        </button>
      </div>

      <div class="results-list">
        <div
          v-for="(place, index) in results"
          :key="place.place_id"
          class="result-card"
        >
          <div class="result-header">
            <h4>{{ place.name }}</h4>
            <span :class="['status-badge', getBusinessStatusClass(place.business_status)]">
              {{ formatBusinessStatus(place.business_status) }}
            </span>
          </div>

          <div class="result-body">
            <div class="result-info">
              <p><i class="fas fa-map-marker-alt"></i> {{ place.vicinity }}</p>
              <p v-if="place.rating">
                <i class="fas fa-star"></i> {{ place.rating }}
                <span class="rating-count">({{ place.user_ratings_total || 0 }} avis)</span>
              </p>
              <p v-if="place.types && place.types.length > 0">
                <i class="fas fa-tag"></i> {{ formatTypes(place.types) }}
              </p>
            </div>

            <div class="result-actions">
              <button
                type="button"
                class="btn-icon details-btn"
                @click="loadPlaceDetails(place.place_id, index)"
                :disabled="loadingDetails === place.place_id"
                :title="loadingDetails === place.place_id ? 'Chargement...' : 'Voir les détails'"
              >
                <i :class="loadingDetails === place.place_id ? 'fas fa-spinner fa-spin' : 'fas fa-info-circle'"></i>
              </button>
              <a
                :href="'https://www.google.com/maps/place/?q=place_id:' + place.place_id"
                target="_blank"
                class="btn-icon maps-btn"
                title="Voir sur Google Maps"
              >
                <i class="fas fa-map"></i>
              </a>
            </div>
          </div>

          <div
            v-if="place.details"
            class="result-details"
          >
            <h5>Détails supplémentaires</h5>
            <p v-if="place.details.formatted_address">
              <strong>Adresse:</strong> {{ place.details.formatted_address }}
            </p>
            <p v-if="place.details.formatted_phone_number">
              <strong>Téléphone:</strong> {{ place.details.formatted_phone_number }}
            </p>
            <p v-if="place.details.website">
              <strong>Site web:</strong>
              <a
                :href="place.details.website"
                target="_blank"
              >{{ place.details.website }}</a>
              <button
                class="btn-small"
                @click="extractEmailsFromWebsite(place.details.website, index)"
                :disabled="place.extractingEmails"
              >
                <i :class="place.extractingEmails ? 'fas fa-spinner fa-spin' : 'fas fa-envelope'"></i>
                {{ place.extractingEmails ? 'Extraction...' : 'Extraire les emails' }}
              </button>
            </p>
            <p v-if="place.details.email">
              <strong>Email:</strong> {{ place.details.email }}
            </p>
            <div v-if="place.emails && place.emails.length > 0">
              <p><strong>Emails trouvés:</strong></p>
              <ul class="email-list">
                <li
                  v-for="(email, i) in place.emails"
                  :key="i"
                >
                  {{ email }}
                </li>
              </ul>
            </div>
            <div v-if="place.details.opening_hours">
              <p><strong>Horaires:</strong></p>
              <ul class="opening-hours">
                <li
                  v-for="(day, i) in place.details.opening_hours.weekday_text"
                  :key="i"
                >
                  {{ day }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-else-if="!loading && !error && hasSearched"
      class="no-results"
    >
      <i class="fas fa-search"></i>
      <p>Aucun résultat trouvé. Essayez de modifier vos critères de recherche.</p>
    </div>

    <div class="api-usage">
      <h3>Utilisation de l'API</h3>
      <p>Quotas mensuels gratuits:</p>
      <ul>
        <li>Places API Nearby Search: 5000 appels</li>
        <li>Places API Place Details: 1000 appels</li>
      </ul>
      <p>Utilisation actuelle:</p>
      <ul>
        <li>Nearby Search: {{ apiUsage.nearbySearch }} appels</li>
        <li>Place Details: {{ apiUsage.placeDetails }} appels</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from "vue";
import { googlePlacesProxyService } from "@/services/googlePlacesProxyService";
import { useToast } from "@/composables/useToast";
import { useBusinessStore } from "@/stores/business";

const toast = useToast();
const businessStore = useBusinessStore();

// État du formulaire
const apiKey = ref("");
const location = ref("");
const keyword = ref("");
const radius = ref(5000);
const type = ref("");
const searchMethod = ref("radius");
const opennow = ref(false);
const minprice = ref("");
const maxprice = ref("");

// État des résultats
const results = ref<any[]>([]);
const nextPageToken = ref<string | null>(null);
const loading = ref(false);
const loadingNextPage = ref(false);
const loadingDetails = ref<string | null>(null);
const error = ref<string | null>(null);
const hasSearched = ref(false);

// Suivi de l'utilisation de l'API
const apiUsage = reactive({
  nearbySearch: 0,
  placeDetails: 0,
});

// Validation du formulaire
const isFormValid = computed(() => {
  return apiKey.value && location.value && keyword.value;
});

// Recherche de lieux
const searchPlaces = async () => {
  if (!isFormValid.value) {
    toast.error("Veuillez remplir tous les champs obligatoires");
    return;
  }

  loading.value = true;
  error.value = null;
  results.value = [];
  nextPageToken.value = null;
  hasSearched.value = true;

  try {
    // Préparer les paramètres de recherche
    const searchParams: any = {
      location: location.value,
      keyword: keyword.value,
      type: type.value,
      apiKey: apiKey.value,
      language: "fr",
    };

    // Ajouter les paramètres selon la méthode de recherche
    if (searchMethod.value === "radius") {
      searchParams.radius = radius.value;
    } else {
      searchParams.rankby = "distance";
    }

    // Ajouter les paramètres optionnels
    if (opennow.value) {
      searchParams.opennow = true;
    }

    if (minprice.value) {
      searchParams.minprice = parseInt(minprice.value);
    }

    if (maxprice.value) {
      searchParams.maxprice = parseInt(maxprice.value);
    }

    // Utiliser uniquement le service proxy pour éviter les problèmes CORS
    try {
      // Ajouter la langue par défaut si non spécifiée
      if (!searchParams.language) {
        searchParams.language = "fr";
      }

      const response = await googlePlacesProxyService.nearbySearch(
        searchParams
      );

      results.value = response.results;
      nextPageToken.value = response.nextPageToken;
      apiUsage.nearbySearch++;
    } catch (proxyError) {
      console.error("Erreur avec le proxy:", proxyError);
      error.value =
        "Erreur lors de la communication avec l'API Google Places. Veuillez vérifier votre clé API et réessayer.";
      toast.error(error.value);
    }

    if (results.value.length === 0) {
      toast.info("Aucun résultat trouvé pour cette recherche");
    } else {
      toast.success(`${results.value.length} résultats trouvés`);
    }
  } catch (err: any) {
    console.error("Erreur lors de la recherche:", err);
    error.value = err.message || "Une erreur est survenue lors de la recherche";
    toast.error(error.value);
  } finally {
    loading.value = false;
  }
};

// Chargement de la page suivante
const loadNextPage = async () => {
  if (!nextPageToken.value) return;

  loadingNextPage.value = true;

  // Sauvegarder le nombre de résultats actuels avant de charger la page suivante
  const previousResultsCount = results.value.length;

  try {
    // Utiliser uniquement le service proxy pour éviter les problèmes CORS
    try {
      const response = await googlePlacesProxyService.getNextPage(
        nextPageToken.value,
        apiKey.value
      );

      results.value = [...results.value, ...response.results];
      nextPageToken.value = response.nextPageToken;
      apiUsage.nearbySearch++;
    } catch (proxyError) {
      console.error("Erreur avec le proxy:", proxyError);
      toast.error(
        "Erreur lors du chargement des résultats supplémentaires. Veuillez réessayer."
      );
    }

    // Calculer le nombre de nouveaux résultats ajoutés
    const newResultsCount = results.value.length - (previousResultsCount || 0);
    toast.success(`${newResultsCount} résultats supplémentaires chargés`);
  } catch (err: any) {
    console.error("Erreur lors du chargement de la page suivante:", err);
    toast.error(
      err.message || "Erreur lors du chargement des résultats supplémentaires"
    );
  } finally {
    loadingNextPage.value = false;
  }
};

// Chargement des détails d'un lieu
const loadPlaceDetails = async (placeId: string, index: number) => {
  if (loadingDetails.value) return;

  // Vérifier si les détails sont déjà chargés
  if (results.value[index].details) {
    // Basculer l'affichage des détails
    results.value[index].details = null;
    return;
  }

  loadingDetails.value = placeId;

  try {
    let details: any;

    // Utiliser uniquement le service proxy pour éviter les problèmes CORS
    try {
      details = await googlePlacesProxyService.getPlaceDetails(
        placeId,
        apiKey.value
      );
      apiUsage.placeDetails++;
    } catch (proxyError) {
      console.error("Erreur avec le proxy:", proxyError);

      // Afficher plus de détails sur l'erreur
      if (proxyError.response) {
        console.error("Données de réponse d'erreur:", proxyError.response.data);
        console.error("Statut d'erreur:", proxyError.response.status);

        // Afficher un message d'erreur plus précis
        if (proxyError.response.data && proxyError.response.data.error) {
          toast.error(`Erreur: ${proxyError.response.data.error}`);
        } else {
          toast.error(
            `Erreur ${proxyError.response.status}: Erreur lors du chargement des détails.`
          );
        }
      } else {
        toast.error(
          "Erreur lors du chargement des détails. Veuillez réessayer."
        );
      }

      loadingDetails.value = null;
      return;
    }

    // Mettre à jour les détails du lieu
    results.value[index] = {
      ...results.value[index],
      details,
    };
  } catch (err: any) {
    console.error("Erreur lors du chargement des détails:", err);
    toast.error(err.message || "Erreur lors du chargement des détails");
  } finally {
    loadingDetails.value = null;
  }
};

// Importation des résultats
const importResults = async () => {
  if (results.value.length === 0) {
    toast.error("Aucun résultat à importer");
    return;
  }

  try {
    // Transformer les résultats en format compatible avec l'application
    const businesses = results.value.map((place) => {
      // Récupérer les détails si disponibles
      const details = place.details || {};

      // Récupérer les emails extraits si disponibles
      const emails = place.emails || [];

      return {
        name: place.name,
        address: {
          street: details.formatted_address || place.vicinity || "",
          city: place.vicinity ? place.vicinity.split(",").pop()?.trim() : "",
          postalCode: "",
          country: "France",
          formatted: details.formatted_address || place.vicinity || "",
          coordinates: place.geometry?.location
            ? {
                lat: place.geometry.location.lat,
                lng: place.geometry.location.lng,
              }
            : undefined,
        },
        contact: {
          phone: details.formatted_phone_number || "",
          email: emails.length > 0 ? emails[0] : details.email || "",
        },
        website: details.website || "",
        business: {
          type: place.types ? place.types[0] : "",
          rating: place.rating || 0,
          reviewCount: place.user_ratings_total || 0,
          priceLevel: place.price_level || 0,
        },
        source: {
          type: "google_maps",
          id: place.place_id,
          url: `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
        },
        // Ajouter des informations supplémentaires
        notes: `Importé depuis Google Places API le ${new Date().toLocaleDateString()}. ${
          emails.length > 0 ? `Emails trouvés: ${emails.join(", ")}` : ""
        }`,
        tags: place.types || [],
      };
    });

    // Créer un scrape job
    const scrapeJob = {
      name: `${keyword.value} à ${location.value}`,
      description: `Recherche de ${keyword.value} à ${location.value} avec un rayon de ${radius.value}m`,
      source: "google_maps",
      searchTerms: [keyword.value],
      locations: [location.value],
      filters: {
        type: type.value || "all",
      },
      configuration: {
        maxResults: results.value.length,
        includeContact: true,
        includeWebsite: true,
      },
      status: "completed",
      progress: 100,
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      resultsCount: businesses.length,
      logs: [
        {
          timestamp: new Date().toISOString(),
          level: "info",
          message: "Import depuis Google Places API",
        },
      ],
      createdAt: new Date().toISOString(),
    };

    // Importer les entreprises dans le store
    await businessStore.importBusinesses(businesses);

    toast.success(`${businesses.length} entreprises importées avec succès`);

    // Afficher les données importées dans la console pour le test
    console.log("Scrape job créé:", scrapeJob);
    console.log("Entreprises importées:", businesses);
  } catch (err: any) {
    console.error("Erreur lors de l'importation des résultats:", err);
    toast.error(err.message || "Erreur lors de l'importation des résultats");
  }
};

// Formatage des types de lieu
const formatTypes = (types: string[]) => {
  if (!types || types.length === 0) return "N/A";

  // Filtrer les types génériques
  const filteredTypes = types.filter(
    (type) => !["point_of_interest", "establishment"].includes(type)
  );

  if (filteredTypes.length === 0) return "Établissement";

  return filteredTypes
    .map((type) => {
      // Formater les types pour l'affichage
      return type
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    })
    .join(", ");
};

// Formatage du statut de l'entreprise
const formatBusinessStatus = (status: string) => {
  switch (status) {
    case "OPERATIONAL":
      return "Ouvert";
    case "CLOSED_TEMPORARILY":
      return "Fermé temporairement";
    case "CLOSED_PERMANENTLY":
      return "Fermé définitivement";
    default:
      return "Inconnu";
  }
};

// Classe CSS pour le statut de l'entreprise
const getBusinessStatusClass = (status: string) => {
  switch (status) {
    case "OPERATIONAL":
      return "success";
    case "CLOSED_TEMPORARILY":
      return "warning";
    case "CLOSED_PERMANENTLY":
      return "danger";
    default:
      return "secondary";
  }
};

// Extraction des emails depuis un site web
const extractEmailsFromWebsite = async (website: string, index: number) => {
  if (!website) {
    toast.error("Aucun site web disponible pour extraire les emails");
    return;
  }

  // Marquer comme en cours d'extraction
  results.value[index] = {
    ...results.value[index],
    extractingEmails: true,
  };

  try {
    // Appeler le service d'extraction d'emails
    const response = await googlePlacesProxyService.extractEmails(website);

    if (response.emails && response.emails.length > 0) {
      // Mettre à jour les emails trouvés
      results.value[index] = {
        ...results.value[index],
        emails: response.emails,
      };
      toast.success(
        `${response.emails.length} email(s) trouvé(s) sur ${website}`
      );
    } else {
      toast.info(`Aucun email trouvé sur ${website}`);
    }
  } catch (err: any) {
    console.error("Erreur lors de l'extraction des emails:", err);
    toast.error(err.message || "Erreur lors de l'extraction des emails");
  } finally {
    // Marquer comme terminé
    results.value[index] = {
      ...results.value[index],
      extractingEmails: false,
    };
  }
};
</script>

<style scoped>
.google-places-test {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.form-container {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #374151;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}

.help-text {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: #6b7280;
}

.required {
  color: #ef4444;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: background-color 0.2s;
}

.btn.primary {
  background-color: #4f46e5;
  color: white;
}

.btn.primary:hover:not(:disabled) {
  background-color: #4338ca;
}

.btn.secondary {
  background-color: #e5e7eb;
  color: #374151;
}

.btn.secondary:hover:not(:disabled) {
  background-color: #d1d5db;
}

.btn.success {
  background-color: #10b981;
  color: white;
}

.btn.success:hover:not(:disabled) {
  background-color: #059669;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error-message {
  background-color: #fee2e2;
  color: #b91c1c;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.results-container {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.results-actions {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.results-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.result-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.result-header {
  padding: 12px;
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.result-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.result-body {
  padding: 12px;
  display: flex;
  justify-content: space-between;
}

.result-info {
  flex: 1;
}

.result-info p {
  margin: 8px 0;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #4b5563;
  font-size: 14px;
}

.result-info i {
  color: #6b7280;
  width: 16px;
}

.rating-count {
  color: #9ca3af;
  font-size: 12px;
}

.result-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.details-btn {
  background-color: #e0e7ff;
  color: #4f46e5;
}

.details-btn:hover:not(:disabled) {
  background-color: #c7d2fe;
}

.maps-btn {
  background-color: #e0f2fe;
  color: #0ea5e9;
  text-decoration: none;
}

.maps-btn:hover {
  background-color: #bae6fd;
}

.result-details {
  padding: 12px;
  border-top: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

.result-details h5 {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.result-details p {
  margin: 8px 0;
  font-size: 14px;
  color: #4b5563;
}

.opening-hours {
  margin: 8px 0;
  padding-left: 16px;
  font-size: 14px;
  color: #4b5563;
}

.status-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.success {
  background-color: #d1fae5;
  color: #065f46;
}

.status-badge.warning {
  background-color: #fef3c7;
  color: #92400e;
}

.status-badge.danger {
  background-color: #fee2e2;
  color: #b91c1c;
}

.status-badge.secondary {
  background-color: #f3f4f6;
  color: #4b5563;
}

.no-results {
  background-color: #f9fafb;
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  color: #6b7280;
}

.no-results i {
  font-size: 48px;
  margin-bottom: 16px;
  color: #9ca3af;
}

.api-usage {
  margin-top: 24px;
  padding: 16px;
  background-color: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.api-usage h3 {
  margin-top: 0;
  margin-bottom: 12px;
  font-size: 16px;
  color: #374151;
}

.btn-small {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  margin-left: 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  background-color: #e0f2fe;
  color: #0ea5e9;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-small:hover:not(:disabled) {
  background-color: #bae6fd;
}

.btn-small:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.email-list {
  margin: 8px 0;
  padding-left: 16px;
  font-size: 14px;
  color: #4b5563;
}

.api-usage p {
  margin: 8px 0;
  color: #4b5563;
}

.api-usage ul {
  margin: 8px 0;
  padding-left: 24px;
  color: #4b5563;
}

@media (max-width: 768px) {
  .results-list {
    grid-template-columns: 1fr;
  }

  .results-actions {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
