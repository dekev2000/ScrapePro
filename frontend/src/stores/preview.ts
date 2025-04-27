import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

interface Preview {
  id: string;
  name: string;
  description?: string;
  status: 'draft' | 'published' | 'archived';
  url?: string;
  template: string;
  clientId?: string;
  clientName?: string;
  customizations: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export const usePreviewStore = defineStore('preview', () => {
  const previews = ref<Preview[]>([
    {
      id: '1',
      name: 'Restaurant Website',
      description: 'A modern website for a local restaurant',
      status: 'published',
      url: 'https://example.com/preview/restaurant',
      template: 'restaurant-1',
      clientId: '1',
      clientName: 'Le Petit Bistro',
      customizations: {
        colors: {
          primary: '#4f46e5',
          secondary: '#10b981',
          text: '#111827',
          background: '#ffffff'
        },
        logo: 'https://via.placeholder.com/150',
        showHours: true,
        showMenu: true
      },
      createdAt: '2023-05-15T10:30:00Z',
      updatedAt: '2023-05-20T14:45:00Z'
    },
    {
      id: '2',
      name: 'Marketing Agency',
      description: 'Professional website for a digital marketing agency',
      status: 'published',
      url: 'https://example.com/preview/marketing',
      template: 'business-1',
      clientId: '2',
      clientName: 'Digital Marketing Pro',
      customizations: {
        colors: {
          primary: '#3b82f6',
          secondary: '#f59e0b',
          text: '#1f2937',
          background: '#f9fafb'
        },
        logo: 'https://via.placeholder.com/150',
        showTestimonials: true,
        showPortfolio: true
      },
      createdAt: '2023-06-01T09:15:00Z',
      updatedAt: '2023-06-05T11:20:00Z'
    },
    {
      id: '3',
      name: 'Tech Startup',
      description: 'Modern website for a tech startup',
      status: 'draft',
      template: 'startup-1',
      clientId: '3',
      clientName: 'TechSolutions Lyon',
      customizations: {
        colors: {
          primary: '#8b5cf6',
          secondary: '#ec4899',
          text: '#111827',
          background: '#ffffff'
        },
        logo: 'https://via.placeholder.com/150',
        showTeam: true,
        showProducts: true
      },
      createdAt: '2023-06-10T15:45:00Z',
      updatedAt: '2023-06-10T15:45:00Z'
    },
    {
      id: '4',
      name: 'Hotel Website',
      description: 'Elegant website for a luxury hotel',
      status: 'published',
      url: 'https://example.com/preview/hotel',
      template: 'hotel-1',
      clientId: '4',
      clientName: 'Hôtel Azur',
      customizations: {
        colors: {
          primary: '#0891b2',
          secondary: '#f59e0b',
          text: '#0f172a',
          background: '#f8fafc'
        },
        logo: 'https://via.placeholder.com/150',
        showRooms: true,
        showAmenities: true,
        showBookingForm: true
      },
      createdAt: '2023-05-25T13:10:00Z',
      updatedAt: '2023-06-02T09:30:00Z'
    },
    {
      id: '5',
      name: 'Café Website',
      description: 'Cozy website for a local café',
      status: 'archived',
      url: 'https://example.com/preview/cafe',
      template: 'restaurant-1',
      clientId: '5',
      clientName: 'Café Lumière',
      customizations: {
        colors: {
          primary: '#a16207',
          secondary: '#15803d',
          text: '#1e293b',
          background: '#fffbeb'
        },
        logo: 'https://via.placeholder.com/150',
        showHours: true,
        showMenu: true
      },
      createdAt: '2023-04-10T11:20:00Z',
      updatedAt: '2023-05-01T16:45:00Z'
    }
  ]);
  
  const currentPreview = ref<Preview | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const getPreviewById = computed(() => (id: string) => {
    return previews.value.find(preview => preview.id === id) || null;
  });

  const getPreviewsByStatus = computed(() => (status: string) => {
    return previews.value.filter(preview => preview.status === status);
  });

  const getPreviewsByClient = computed(() => (clientId: string) => {
    return previews.value.filter(preview => preview.clientId === clientId);
  });

  // Actions
  const fetchPreviews = async () => {
    loading.value = true;
    error.value = null;

    try {
      // In a real app, this would be an API call
      // const response = await axios.get('/previews');
      // previews.value = response.data.data;
      
      // For now, we're using the mock data
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return previews.value;
    } catch (err: any) {
      console.error('Error fetching previews:', err);
      error.value = err.message || 'Failed to fetch previews';
      throw error.value;
    } finally {
      loading.value = false;
    }
  };

  const fetchPreview = async (id: string) => {
    loading.value = true;
    error.value = null;

    try {
      // In a real app, this would be an API call
      // const response = await axios.get(`/previews/${id}`);
      // currentPreview.value = response.data.data;
      
      // For now, we're using the mock data
      await new Promise(resolve => setTimeout(resolve, 300));
      const preview = previews.value.find(p => p.id === id);
      
      if (preview) {
        currentPreview.value = preview;
        return preview;
      } else {
        throw new Error('Preview not found');
      }
    } catch (err: any) {
      console.error(`Error fetching preview ${id}:`, err);
      error.value = err.message || 'Failed to fetch preview';
      throw error.value;
    } finally {
      loading.value = false;
    }
  };

  const createPreview = async (previewData: Partial<Preview>) => {
    loading.value = true;
    error.value = null;

    try {
      // In a real app, this would be an API call
      // const response = await axios.post('/previews', previewData);
      // const newPreview = response.data.data;
      
      // For now, we're creating mock data
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newPreview: Preview = {
        id: `${previews.value.length + 1}`,
        name: previewData.name || 'New Preview',
        description: previewData.description,
        status: previewData.status || 'draft',
        url: previewData.url,
        template: previewData.template || 'business-1',
        clientId: previewData.clientId,
        clientName: previewData.clientName,
        customizations: previewData.customizations || {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      previews.value.push(newPreview);
      return newPreview;
    } catch (err: any) {
      console.error('Error creating preview:', err);
      error.value = err.message || 'Failed to create preview';
      throw error.value;
    } finally {
      loading.value = false;
    }
  };

  const updatePreview = async (id: string, previewData: Partial<Preview>) => {
    loading.value = true;
    error.value = null;

    try {
      // In a real app, this would be an API call
      // const response = await axios.put(`/previews/${id}`, previewData);
      // const updatedPreview = response.data.data;
      
      // For now, we're updating mock data
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const index = previews.value.findIndex(p => p.id === id);
      if (index === -1) {
        throw new Error('Preview not found');
      }
      
      const updatedPreview = {
        ...previews.value[index],
        ...previewData,
        updatedAt: new Date().toISOString()
      };
      
      previews.value[index] = updatedPreview;
      
      if (currentPreview.value && currentPreview.value.id === id) {
        currentPreview.value = updatedPreview;
      }
      
      return updatedPreview;
    } catch (err: any) {
      console.error(`Error updating preview ${id}:`, err);
      error.value = err.message || 'Failed to update preview';
      throw error.value;
    } finally {
      loading.value = false;
    }
  };

  const deletePreview = async (id: string) => {
    loading.value = true;
    error.value = null;

    try {
      // In a real app, this would be an API call
      // const response = await axios.delete(`/previews/${id}`);
      
      // For now, we're deleting from mock data
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const index = previews.value.findIndex(p => p.id === id);
      if (index === -1) {
        throw new Error('Preview not found');
      }
      
      previews.value.splice(index, 1);
      
      if (currentPreview.value && currentPreview.value.id === id) {
        currentPreview.value = null;
      }
      
      return true;
    } catch (err: any) {
      console.error(`Error deleting preview ${id}:`, err);
      error.value = err.message || 'Failed to delete preview';
      throw error.value;
    } finally {
      loading.value = false;
    }
  };

  const publishPreview = async (id: string) => {
    return updatePreview(id, { 
      status: 'published',
      url: `https://example.com/preview/${id}`
    });
  };

  const archivePreview = async (id: string) => {
    return updatePreview(id, { status: 'archived' });
  };

  return {
    previews,
    currentPreview,
    loading,
    error,
    getPreviewById,
    getPreviewsByStatus,
    getPreviewsByClient,
    fetchPreviews,
    fetchPreview,
    createPreview,
    updatePreview,
    deletePreview,
    publishPreview,
    archivePreview
  };
});
