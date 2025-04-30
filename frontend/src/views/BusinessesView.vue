<template>
  <div class="businesses-view">
    <div class="page-header">
      <h1>Entreprises</h1>
      <div class="header-actions">
        <button class="btn primary" @click="refreshBusinesses">
          <i class="fas fa-sync-alt"></i> Rafraîchir
        </button>
      </div>
    </div>

    <div class="filters-container">
      <div class="search-box">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Rechercher une entreprise..."
          @input="filterBusinesses"
        />
        <i class="fas fa-search"></i>
      </div>

      <div class="filter-group">
        <label>Filtrer par type:</label>
        <select v-model="typeFilter" @change="filterBusinesses">
          <option value="">Tous les types</option>
          <option v-for="type in businessTypes" :key="type" :value="type">
            {{ formatType(type) }}
          </option>
        </select>
      </div>

      <div class="filter-group">
        <label>Filtrer par ville:</label>
        <select v-model="cityFilter" @change="filterBusinesses">
          <option value="">Toutes les villes</option>
          <option v-for="city in cities" :key="city" :value="city">
            {{ city }}
          </option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Chargement des entreprises...</p>
    </div>

    <div v-else-if="error" class="error-message">
      <i class="fas fa-exclamation-triangle"></i>
      <p>{{ error }}</p>
      <button class="btn secondary" @click="refreshBusinesses">Réessayer</button>
    </div>

    <div v-else-if="filteredBusinesses.length === 0" class="empty-state">
      <i class="fas fa-store-slash"></i>
      <p v-if="hasFilters">Aucune entreprise ne correspond à vos critères de recherche.</p>
      <p v-else>Aucune entreprise n'a été importée. Utilisez l'outil de recherche Google Places pour importer des entreprises.</p>
      <router-link to="/scrapes/google-places" class="btn primary">
        <i class="fas fa-search"></i> Rechercher des entreprises
      </router-link>
    </div>

    <div v-else class="businesses-container">
      <table class="businesses-table">
        <thead>
          <tr>
            <th @click="sortBy('name')" :class="{ active: sortKey === 'name' }">
              Nom
              <i v-if="sortKey === 'name'" :class="sortOrder === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'"></i>
            </th>
            <th @click="sortBy('address.city')" :class="{ active: sortKey === 'address.city' }">
              Ville
              <i v-if="sortKey === 'address.city'" :class="sortOrder === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'"></i>
            </th>
            <th @click="sortBy('business.type')" :class="{ active: sortKey === 'business.type' }">
              Type
              <i v-if="sortKey === 'business.type'" :class="sortOrder === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'"></i>
            </th>
            <th @click="sortBy('contact.email')" :class="{ active: sortKey === 'contact.email' }">
              Email
              <i v-if="sortKey === 'contact.email'" :class="sortOrder === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'"></i>
            </th>
            <th @click="sortBy('contact.phone')" :class="{ active: sortKey === 'contact.phone' }">
              Téléphone
              <i v-if="sortKey === 'contact.phone'" :class="sortOrder === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'"></i>
            </th>
            <th @click="sortBy('website')" :class="{ active: sortKey === 'website' }">
              Site web
              <i v-if="sortKey === 'website'" :class="sortOrder === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'"></i>
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="business in paginatedBusinesses" :key="business._id">
            <td>{{ business.name }}</td>
            <td>{{ business.address.city }}</td>
            <td>{{ formatType(business.business.type) }}</td>
            <td>
              <span v-if="business.contact.email">
                <a :href="`mailto:${business.contact.email}`">{{ business.contact.email }}</a>
              </span>
              <span v-else class="empty-value">Non disponible</span>
            </td>
            <td>
              <span v-if="business.contact.phone">
                <a :href="`tel:${business.contact.phone}`">{{ business.contact.phone }}</a>
              </span>
              <span v-else class="empty-value">Non disponible</span>
            </td>
            <td>
              <span v-if="business.contact.website">
                <a :href="business.contact.website" target="_blank">{{ formatWebsite(business.contact.website) }}</a>
              </span>
              <span v-else class="empty-value">Non disponible</span>
            </td>
            <td class="actions-cell">
              <button class="btn-icon view-btn" @click="viewBusinessDetails(business._id)" title="Voir les détails">
                <i class="fas fa-eye"></i>
              </button>
              <button class="btn-icon edit-btn" @click="editBusiness(business._id)" title="Modifier">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn-icon delete-btn" @click="confirmDeleteBusiness(business._id)" title="Supprimer">
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="pagination">
        <button 
          class="btn-pagination" 
          @click="goToPage(currentPage - 1)" 
          :disabled="currentPage === 1"
        >
          <i class="fas fa-chevron-left"></i>
        </button>
        
        <span class="page-info">
          Page {{ currentPage }} sur {{ totalPages }}
        </span>
        
        <button 
          class="btn-pagination" 
          @click="goToPage(currentPage + 1)" 
          :disabled="currentPage === totalPages"
        >
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>

    <!-- Modal de confirmation de suppression -->
    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="modal-container">
        <div class="modal-header">
          <h3>Confirmer la suppression</h3>
          <button class="close-btn" @click="showDeleteModal = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <p>Êtes-vous sûr de vouloir supprimer cette entreprise ? Cette action est irréversible.</p>
        </div>
        <div class="modal-footer">
          <button class="btn secondary" @click="showDeleteModal = false">Annuler</button>
          <button class="btn danger" @click="deleteBusiness">Supprimer</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useBusinessStore } from '@/stores/business';
import { useToast } from '@/composables/useToast';

const router = useRouter();
const businessStore = useBusinessStore();
const toast = useToast();

// État
const searchQuery = ref('');
const typeFilter = ref('');
const cityFilter = ref('');
const sortKey = ref('name');
const sortOrder = ref('asc');
const currentPage = ref(1);
const itemsPerPage = ref(10);
const showDeleteModal = ref(false);
const businessToDelete = ref<string | null>(null);

// Récupérer les données du store
const businesses = computed(() => businessStore.businesses);
const loading = computed(() => businessStore.loading);
const error = computed(() => businessStore.error);

// Calculer les types d'entreprises uniques
const businessTypes = computed(() => {
  const types = businesses.value.map(b => b.business.type).filter(Boolean);
  return [...new Set(types)];
});

// Calculer les villes uniques
const cities = computed(() => {
  const cityList = businesses.value.map(b => b.address.city).filter(Boolean);
  return [...new Set(cityList)];
});

// Filtrer les entreprises
const filteredBusinesses = computed(() => {
  let result = [...businesses.value];
  
  // Appliquer le filtre de recherche
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(business => 
      business.name.toLowerCase().includes(query) ||
      (business.address.city && business.address.city.toLowerCase().includes(query)) ||
      (business.contact.email && business.contact.email.toLowerCase().includes(query)) ||
      (business.contact.phone && business.contact.phone.includes(query))
    );
  }
  
  // Appliquer le filtre de type
  if (typeFilter.value) {
    result = result.filter(business => business.business.type === typeFilter.value);
  }
  
  // Appliquer le filtre de ville
  if (cityFilter.value) {
    result = result.filter(business => business.address.city === cityFilter.value);
  }
  
  // Trier les résultats
  result.sort((a, b) => {
    let aValue = getNestedProperty(a, sortKey.value);
    let bValue = getNestedProperty(b, sortKey.value);
    
    // Gérer les valeurs nulles ou undefined
    aValue = aValue || '';
    bValue = bValue || '';
    
    // Comparer les valeurs
    if (sortOrder.value === 'asc') {
      return aValue.localeCompare(bValue);
    } else {
      return bValue.localeCompare(aValue);
    }
  });
  
  return result;
});

// Pagination
const totalPages = computed(() => {
  return Math.ceil(filteredBusinesses.value.length / itemsPerPage.value);
});

const paginatedBusinesses = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage.value;
  const endIndex = startIndex + itemsPerPage.value;
  return filteredBusinesses.value.slice(startIndex, endIndex);
});

// Vérifier si des filtres sont appliqués
const hasFilters = computed(() => {
  return searchQuery.value !== '' || typeFilter.value !== '' || cityFilter.value !== '';
});

// Méthodes
const refreshBusinesses = async () => {
  try {
    await businessStore.fetchBusinesses();
    toast.success('Liste des entreprises mise à jour');
  } catch (err) {
    toast.error('Erreur lors du chargement des entreprises');
  }
};

const filterBusinesses = () => {
  // Réinitialiser la pagination lors du filtrage
  currentPage.value = 1;
};

const sortBy = (key: string) => {
  if (sortKey.value === key) {
    // Inverser l'ordre si on clique sur la même colonne
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    // Nouvelle colonne, trier par ordre ascendant
    sortKey.value = key;
    sortOrder.value = 'asc';
  }
};

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

const viewBusinessDetails = (id: string) => {
  router.push(`/businesses/${id}`);
};

const editBusiness = (id: string) => {
  router.push(`/businesses/${id}/edit`);
};

const confirmDeleteBusiness = (id: string) => {
  businessToDelete.value = id;
  showDeleteModal.value = true;
};

const deleteBusiness = async () => {
  if (!businessToDelete.value) return;
  
  try {
    await businessStore.deleteBusiness(businessToDelete.value);
    toast.success('Entreprise supprimée avec succès');
    showDeleteModal.value = false;
    businessToDelete.value = null;
  } catch (err) {
    toast.error('Erreur lors de la suppression de l\'entreprise');
  }
};

// Formater le type d'entreprise
const formatType = (type: string) => {
  if (!type) return 'Non spécifié';
  
  return type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Formater l'URL du site web
const formatWebsite = (website: string) => {
  return website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
};

// Récupérer une propriété imbriquée d'un objet
const getNestedProperty = (obj: any, path: string) => {
  return path.split('.').reduce((prev, curr) => {
    return prev ? prev[curr] : null;
  }, obj);
};

// Charger les entreprises au montage du composant
onMounted(async () => {
  if (businesses.value.length === 0) {
    await refreshBusinesses();
  }
});

// Réinitialiser la pagination lorsque les filtres changent
watch([searchQuery, typeFilter, cityFilter], () => {
  currentPage.value = 1;
});
</script>

<style scoped>
.businesses-view {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 24px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.filters-container {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 24px;
  background-color: white;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 200px;
}

.search-box input {
  width: 100%;
  padding: 10px 16px 10px 40px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}

.search-box i {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 180px;
}

.filter-group label {
  font-size: 12px;
  font-weight: 500;
  color: #4b5563;
}

.filter-group select {
  padding: 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background-color: white;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top: 4px solid #4f46e5;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
  background-color: #fee2e2;
  border-radius: 8px;
  color: #b91c1c;
  text-align: center;
}

.error-message i {
  font-size: 24px;
  margin-bottom: 12px;
}

.error-message button {
  margin-top: 16px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.empty-state i {
  font-size: 48px;
  color: #9ca3af;
  margin-bottom: 16px;
}

.empty-state p {
  color: #4b5563;
  margin-bottom: 24px;
}

.businesses-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.businesses-table {
  width: 100%;
  border-collapse: collapse;
}

.businesses-table th,
.businesses-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.businesses-table th {
  background-color: #f9fafb;
  font-weight: 500;
  color: #4b5563;
  cursor: pointer;
  user-select: none;
  position: relative;
}

.businesses-table th.active {
  color: #4f46e5;
}

.businesses-table th i {
  margin-left: 4px;
  font-size: 12px;
}

.businesses-table tbody tr:hover {
  background-color: #f9fafb;
}

.empty-value {
  color: #9ca3af;
  font-style: italic;
}

.actions-cell {
  display: flex;
  gap: 8px;
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.view-btn {
  background-color: #e0f2fe;
  color: #0ea5e9;
}

.view-btn:hover {
  background-color: #bae6fd;
}

.edit-btn {
  background-color: #e0f7fa;
  color: #06b6d4;
}

.edit-btn:hover {
  background-color: #b2ebf2;
}

.delete-btn {
  background-color: #fee2e2;
  color: #ef4444;
}

.delete-btn:hover {
  background-color: #fecaca;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  gap: 16px;
}

.btn-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  background-color: white;
  color: #4b5563;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-pagination:hover:not(:disabled) {
  background-color: #f9fafb;
  border-color: #9ca3af;
}

.btn-pagination:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 14px;
  color: #4b5563;
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

.btn.primary:hover {
  background-color: #4338ca;
}

.btn.secondary {
  background-color: #e5e7eb;
  color: #374151;
}

.btn.secondary:hover {
  background-color: #d1d5db;
}

.btn.danger {
  background-color: #ef4444;
  color: white;
}

.btn.danger:hover {
  background-color: #dc2626;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  background-color: white;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  color: #6b7280;
}

.modal-body {
  padding: 24px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
}
</style>
