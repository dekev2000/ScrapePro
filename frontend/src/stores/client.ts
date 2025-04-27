import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
  website?: string;
  notes?: string;
  status: 'active' | 'inactive' | 'lead';
  createdAt: string;
  updatedAt: string;
}

export const useClientStore = defineStore('client', () => {
  const clients = ref<Client[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@lepetitbistro.fr',
      phone: '+33 1 23 45 67 89',
      company: 'Le Petit Bistro',
      address: '123 Rue de Paris, 75001 Paris, France',
      website: 'https://www.lepetitbistro.fr',
      notes: 'Owner of a popular restaurant in Paris',
      status: 'active',
      createdAt: '2023-04-15T10:30:00Z',
      updatedAt: '2023-05-20T14:45:00Z'
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane.smith@digitalmarketingpro.co.uk',
      phone: '+44 20 1234 5678',
      company: 'Digital Marketing Pro',
      address: '45 Oxford Street, London W1D 1BW, UK',
      website: 'https://www.digitalmarketingpro.co.uk',
      notes: 'Marketing agency specializing in digital campaigns',
      status: 'active',
      createdAt: '2023-05-01T09:15:00Z',
      updatedAt: '2023-06-05T11:20:00Z'
    },
    {
      id: '3',
      name: 'Robert Johnson',
      email: 'robert.johnson@techsolutions-lyon.fr',
      phone: '+33 4 56 78 90 12',
      company: 'TechSolutions Lyon',
      address: '78 Rue de la République, 69002 Lyon, France',
      website: 'https://www.techsolutions-lyon.fr',
      notes: 'Software development company based in Lyon',
      status: 'active',
      createdAt: '2023-05-10T15:45:00Z',
      updatedAt: '2023-06-10T15:45:00Z'
    },
    {
      id: '4',
      name: 'Marie Dubois',
      email: 'marie.dubois@hotel-azur.fr',
      phone: '+33 4 93 12 34 56',
      company: 'Hôtel Azur',
      address: '15 Promenade des Anglais, 06000 Nice, France',
      website: 'https://www.hotel-azur.fr',
      notes: 'Luxury hotel on the French Riviera',
      status: 'active',
      createdAt: '2023-04-25T13:10:00Z',
      updatedAt: '2023-06-02T09:30:00Z'
    },
    {
      id: '5',
      name: 'Pierre Martin',
      email: 'pierre.martin@cafelumiere.fr',
      phone: '+33 1 87 65 43 21',
      company: 'Café Lumière',
      address: '42 Rue Saint-Honoré, 75001 Paris, France',
      website: 'https://www.cafelumiere.fr',
      notes: 'Cozy café in the heart of Paris',
      status: 'inactive',
      createdAt: '2023-03-10T11:20:00Z',
      updatedAt: '2023-05-01T16:45:00Z'
    },
    {
      id: '6',
      name: 'David Wilson',
      email: 'david.wilson@londonwebdesign.co.uk',
      phone: '+44 20 9876 5432',
      company: 'London Web Design',
      address: '27 Camden High Street, London NW1 7JE, UK',
      website: 'https://www.londonwebdesign.co.uk',
      status: 'lead',
      createdAt: '2023-06-01T10:15:00Z',
      updatedAt: '2023-06-01T10:15:00Z'
    }
  ]);
  
  const currentClient = ref<Client | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const getClientById = computed(() => (id: string) => {
    return clients.value.find(client => client.id === id) || null;
  });

  const getClientsByStatus = computed(() => (status: string) => {
    return clients.value.filter(client => client.status === status);
  });

  // Actions
  const fetchClients = async () => {
    loading.value = true;
    error.value = null;

    try {
      // In a real app, this would be an API call
      // const response = await axios.get('/clients');
      // clients.value = response.data.data;
      
      // For now, we're using the mock data
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return clients.value;
    } catch (err: any) {
      console.error('Error fetching clients:', err);
      error.value = err.message || 'Failed to fetch clients';
      throw error.value;
    } finally {
      loading.value = false;
    }
  };

  const fetchClient = async (id: string) => {
    loading.value = true;
    error.value = null;

    try {
      // In a real app, this would be an API call
      // const response = await axios.get(`/clients/${id}`);
      // currentClient.value = response.data.data;
      
      // For now, we're using the mock data
      await new Promise(resolve => setTimeout(resolve, 300));
      const client = clients.value.find(c => c.id === id);
      
      if (client) {
        currentClient.value = client;
        return client;
      } else {
        throw new Error('Client not found');
      }
    } catch (err: any) {
      console.error(`Error fetching client ${id}:`, err);
      error.value = err.message || 'Failed to fetch client';
      throw error.value;
    } finally {
      loading.value = false;
    }
  };

  const createClient = async (clientData: Partial<Client>) => {
    loading.value = true;
    error.value = null;

    try {
      // In a real app, this would be an API call
      // const response = await axios.post('/clients', clientData);
      // const newClient = response.data.data;
      
      // For now, we're creating mock data
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newClient: Client = {
        id: `${clients.value.length + 1}`,
        name: clientData.name || 'New Client',
        email: clientData.email || 'client@example.com',
        phone: clientData.phone,
        company: clientData.company,
        address: clientData.address,
        website: clientData.website,
        notes: clientData.notes,
        status: clientData.status || 'lead',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      clients.value.push(newClient);
      return newClient;
    } catch (err: any) {
      console.error('Error creating client:', err);
      error.value = err.message || 'Failed to create client';
      throw error.value;
    } finally {
      loading.value = false;
    }
  };

  const updateClient = async (id: string, clientData: Partial<Client>) => {
    loading.value = true;
    error.value = null;

    try {
      // In a real app, this would be an API call
      // const response = await axios.put(`/clients/${id}`, clientData);
      // const updatedClient = response.data.data;
      
      // For now, we're updating mock data
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const index = clients.value.findIndex(c => c.id === id);
      if (index === -1) {
        throw new Error('Client not found');
      }
      
      const updatedClient = {
        ...clients.value[index],
        ...clientData,
        updatedAt: new Date().toISOString()
      };
      
      clients.value[index] = updatedClient;
      
      if (currentClient.value && currentClient.value.id === id) {
        currentClient.value = updatedClient;
      }
      
      return updatedClient;
    } catch (err: any) {
      console.error(`Error updating client ${id}:`, err);
      error.value = err.message || 'Failed to update client';
      throw error.value;
    } finally {
      loading.value = false;
    }
  };

  const deleteClient = async (id: string) => {
    loading.value = true;
    error.value = null;

    try {
      // In a real app, this would be an API call
      // const response = await axios.delete(`/clients/${id}`);
      
      // For now, we're deleting from mock data
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const index = clients.value.findIndex(c => c.id === id);
      if (index === -1) {
        throw new Error('Client not found');
      }
      
      clients.value.splice(index, 1);
      
      if (currentClient.value && currentClient.value.id === id) {
        currentClient.value = null;
      }
      
      return true;
    } catch (err: any) {
      console.error(`Error deleting client ${id}:`, err);
      error.value = err.message || 'Failed to delete client';
      throw error.value;
    } finally {
      loading.value = false;
    }
  };

  const activateClient = async (id: string) => {
    return updateClient(id, { status: 'active' });
  };

  const deactivateClient = async (id: string) => {
    return updateClient(id, { status: 'inactive' });
  };

  return {
    clients,
    currentClient,
    loading,
    error,
    getClientById,
    getClientsByStatus,
    fetchClients,
    fetchClient,
    createClient,
    updateClient,
    deleteClient,
    activateClient,
    deactivateClient
  };
});
