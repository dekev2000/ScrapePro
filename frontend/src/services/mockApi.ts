// This file provides mock API responses for development
import axios from 'axios';

// Mock data for scraping jobs
const mockScrapingJobs = [
  {
    _id: '1',
    name: 'Google Maps - Restaurants in Paris',
    description: 'Scraping restaurants in Paris from Google Maps',
    status: 'completed',
    source: 'google_maps',
    searchTerms: ['restaurant', 'bistro', 'café'],
    locations: ['Paris, France'],
    filters: {
      rating: '4+',
      priceRange: '$$-$$$'
    },
    configuration: {
      maxResults: 100,
      includeReviews: true
    },
    progress: 100,
    startedAt: '2023-06-15T10:30:00Z',
    completedAt: '2023-06-15T11:45:00Z',
    resultsCount: 87,
    logs: [
      {
        timestamp: '2023-06-15T10:30:00Z',
        level: 'info',
        message: 'Scraping job started'
      },
      {
        timestamp: '2023-06-15T11:45:00Z',
        level: 'info',
        message: 'Scraping job completed successfully'
      }
    ],
    createdAt: '2023-06-15T09:00:00Z'
  },
  {
    _id: '2',
    name: 'LinkedIn - Marketing Agencies',
    description: 'Scraping marketing agencies from LinkedIn',
    status: 'in_progress',
    source: 'linkedin',
    searchTerms: ['marketing agency', 'digital marketing'],
    locations: ['London, UK'],
    filters: {
      employeeCount: '10-50',
      founded: '2010+'
    },
    configuration: {
      maxResults: 50,
      includeEmployees: true
    },
    progress: 65,
    startedAt: '2023-06-20T14:00:00Z',
    resultsCount: 32,
    logs: [
      {
        timestamp: '2023-06-20T14:00:00Z',
        level: 'info',
        message: 'Scraping job started'
      },
      {
        timestamp: '2023-06-20T14:30:00Z',
        level: 'warning',
        message: 'Rate limiting detected, slowing down requests'
      }
    ],
    createdAt: '2023-06-20T13:00:00Z'
  },
  {
    _id: '3',
    name: 'INSEE - Companies in Lyon',
    description: 'Scraping company data from INSEE database',
    status: 'pending',
    source: 'insee',
    searchTerms: ['tech', 'software', 'IT'],
    locations: ['Lyon, France'],
    filters: {
      creationDate: '2015+',
      legalStatus: 'SAS,SARL'
    },
    configuration: {
      maxResults: 200,
      includeFinancialData: true
    },
    progress: 0,
    resultsCount: 0,
    logs: [],
    createdAt: '2023-06-22T09:30:00Z'
  },
  {
    _id: '4',
    name: 'Google Maps - Hotels in Nice',
    description: 'Scraping hotels in Nice from Google Maps',
    status: 'failed',
    source: 'google_maps',
    searchTerms: ['hotel', 'resort', 'accommodation'],
    locations: ['Nice, France'],
    filters: {
      rating: '3+',
      priceRange: '$$-$$$$'
    },
    configuration: {
      maxResults: 75,
      includeReviews: true,
      includeAmenities: true
    },
    progress: 45,
    startedAt: '2023-06-18T16:00:00Z',
    resultsCount: 34,
    logs: [
      {
        timestamp: '2023-06-18T16:00:00Z',
        level: 'info',
        message: 'Scraping job started'
      },
      {
        timestamp: '2023-06-18T16:45:00Z',
        level: 'error',
        message: 'API access blocked by Google. Job failed.'
      }
    ],
    createdAt: '2023-06-18T15:30:00Z'
  }
];

// Mock data for businesses
const mockBusinesses = [
  {
    _id: '1',
    name: 'Le Petit Bistro',
    address: {
      street: '123 Rue de Rivoli',
      city: 'Paris',
      postalCode: '75001',
      country: 'France',
      coordinates: {
        lat: 48.8566,
        lng: 2.3522
      }
    },
    contact: {
      phone: '+33 1 23 45 67 89',
      email: 'contact@lepetitbistro.fr',
      website: 'https://www.lepetitbistro.fr'
    },
    business: {
      type: 'Restaurant',
      siret: '12345678901234'
    },
    scrapingData: {
      source: 'google_maps',
      scrapedBy: '1',
      scrapedAt: '2023-06-15T11:30:00Z',
      lastUpdated: '2023-06-15T11:30:00Z'
    },
    websiteGeneration: {
      status: 'generated',
      previewLink: 'https://preview.example.com/lepetitbistro',
      previewScreenshot: 'https://via.placeholder.com/800x600?text=Le+Petit+Bistro',
      generatedAt: '2023-06-16T10:00:00Z',
      apiSource: 'deepsite'
    },
    active: true,
    createdAt: '2023-06-15T11:30:00Z',
    updatedAt: '2023-06-16T10:00:00Z'
  },
  {
    _id: '2',
    name: 'Digital Marketing Pro',
    address: {
      street: '45 Oxford Street',
      city: 'London',
      postalCode: 'W1D 2DZ',
      country: 'UK',
      coordinates: {
        lat: 51.5074,
        lng: -0.1278
      }
    },
    contact: {
      phone: '+44 20 1234 5678',
      email: 'info@digitalmarketingpro.co.uk',
      website: 'https://www.digitalmarketingpro.co.uk'
    },
    business: {
      type: 'Marketing Agency',
      employeeCount: 25
    },
    scrapingData: {
      source: 'linkedin',
      scrapedBy: '2',
      scrapedAt: '2023-06-20T14:30:00Z',
      lastUpdated: '2023-06-20T14:30:00Z'
    },
    websiteGeneration: {
      status: 'pending',
      apiSource: null
    },
    active: true,
    createdAt: '2023-06-20T14:30:00Z',
    updatedAt: '2023-06-20T14:30:00Z'
  },
  {
    _id: '3',
    name: 'TechSolutions Lyon',
    address: {
      street: '78 Rue de la République',
      city: 'Lyon',
      postalCode: '69002',
      country: 'France',
      coordinates: {
        lat: 45.7640,
        lng: 4.8357
      }
    },
    contact: {
      phone: '+33 4 56 78 90 12',
      email: 'contact@techsolutions-lyon.fr',
      website: 'https://www.techsolutions-lyon.fr'
    },
    business: {
      type: 'Software Development',
      siret: '98765432109876',
      employeeCount: 15
    },
    scrapingData: {
      source: 'insee',
      scrapedBy: '3',
      scrapedAt: null,
      lastUpdated: null
    },
    websiteGeneration: {
      status: 'not_generated',
      apiSource: null
    },
    active: true,
    createdAt: '2023-06-22T09:30:00Z',
    updatedAt: '2023-06-22T09:30:00Z'
  },
  {
    _id: '4',
    name: 'Hôtel Azur',
    address: {
      street: '15 Promenade des Anglais',
      city: 'Nice',
      postalCode: '06000',
      country: 'France',
      coordinates: {
        lat: 43.7102,
        lng: 7.2620
      }
    },
    contact: {
      phone: '+33 4 93 12 34 56',
      email: 'reservations@hotel-azur.fr',
      website: 'https://www.hotel-azur.fr'
    },
    business: {
      type: 'Hotel',
      siret: '45678901234567'
    },
    scrapingData: {
      source: 'google_maps',
      scrapedBy: '4',
      scrapedAt: '2023-06-18T16:30:00Z',
      lastUpdated: '2023-06-18T16:30:00Z'
    },
    websiteGeneration: {
      status: 'approved',
      previewLink: 'https://preview.example.com/hotel-azur',
      previewScreenshot: 'https://via.placeholder.com/800x600?text=Hotel+Azur',
      generatedAt: '2023-06-19T11:00:00Z',
      apiSource: 'deepsite'
    },
    active: true,
    createdAt: '2023-06-18T16:30:00Z',
    updatedAt: '2023-06-19T11:00:00Z'
  },
  {
    _id: '5',
    name: 'Café Lumière',
    address: {
      street: '42 Avenue des Champs-Élysées',
      city: 'Paris',
      postalCode: '75008',
      country: 'France',
      coordinates: {
        lat: 48.8738,
        lng: 2.2950
      }
    },
    contact: {
      phone: '+33 1 87 65 43 21',
      email: 'bonjour@cafelumiere.fr',
      website: 'https://www.cafelumiere.fr'
    },
    business: {
      type: 'Café',
      siret: '56789012345678'
    },
    scrapingData: {
      source: 'google_maps',
      scrapedBy: '1',
      scrapedAt: '2023-06-15T11:40:00Z',
      lastUpdated: '2023-06-15T11:40:00Z'
    },
    websiteGeneration: {
      status: 'rejected',
      previewLink: 'https://preview.example.com/cafelumiere',
      previewScreenshot: 'https://via.placeholder.com/800x600?text=Cafe+Lumiere',
      generatedAt: '2023-06-16T14:00:00Z',
      apiSource: 'deepsite'
    },
    active: false,
    createdAt: '2023-06-15T11:40:00Z',
    updatedAt: '2023-06-16T14:00:00Z'
  }
];

// Mock API interceptor
const setupMockApi = () => {
  // Add a request interceptor
  axios.interceptors.request.use(
    config => {
      console.log(`Mock API Request: ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    },
    error => {
      return Promise.reject(error);
    }
  );

  // Add a response interceptor
  axios.interceptors.response.use(
    response => {
      // If the response is already mocked, just return it
      if (response.data && response.config.url?.includes('/api/')) {
        return response;
      }

      const url = response.config.url;
      
      // Mock responses based on the URL
      if (url === '/scraping' || url?.startsWith('/scraping')) {
        return {
          ...response,
          data: {
            success: true,
            data: mockScrapingJobs,
            count: mockScrapingJobs.length
          }
        };
      } else if (url === '/businesses' || url?.startsWith('/businesses')) {
        // Filter businesses based on query parameters
        let filteredBusinesses = [...mockBusinesses];
        const params = new URLSearchParams(url?.split('?')[1] || '');
        
        // Apply filters if they exist
        if (params.has('search')) {
          const searchQuery = params.get('search')?.toLowerCase();
          if (searchQuery) {
            filteredBusinesses = filteredBusinesses.filter(business => 
              business.name.toLowerCase().includes(searchQuery) || 
              (business.address.city && business.address.city.toLowerCase().includes(searchQuery))
            );
          }
        }
        
        if (params.has('city')) {
          const cityFilter = params.get('city');
          if (cityFilter) {
            filteredBusinesses = filteredBusinesses.filter(business => 
              business.address.city === cityFilter
            );
          }
        }
        
        if (params.has('status')) {
          const statusFilter = params.get('status');
          if (statusFilter) {
            filteredBusinesses = filteredBusinesses.filter(business => 
              business.websiteGeneration.status === statusFilter
            );
          }
        }
        
        if (params.has('active')) {
          const activeFilter = params.get('active');
          if (activeFilter) {
            filteredBusinesses = filteredBusinesses.filter(business => 
              business.active === (activeFilter === 'true')
            );
          }
        }
        
        return {
          ...response,
          data: {
            success: true,
            data: filteredBusinesses,
            count: filteredBusinesses.length
          }
        };
      }
      
      return response;
    },
    error => {
      // If it's a network error, return mock data
      if (error.message === 'Network Error') {
        const config = error.config;
        const url = config.url;
        
        if (url === '/scraping' || url?.startsWith('/scraping')) {
          return {
            data: {
              success: true,
              data: mockScrapingJobs,
              count: mockScrapingJobs.length
            }
          };
        } else if (url === '/businesses' || url?.startsWith('/businesses')) {
          return {
            data: {
              success: true,
              data: mockBusinesses,
              count: mockBusinesses.length
            }
          };
        }
      }
      
      return Promise.reject(error);
    }
  );
};

export { setupMockApi, mockScrapingJobs, mockBusinesses };
