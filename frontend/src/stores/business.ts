import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

interface Business {
  _id: string
  name: string
  status?: 'prospect' | 'client' // New field to distinguish prospects from clients
  address: {
    street?: string
    city: string
    postalCode?: string
    region?: string
    country: string
    coordinates?: {
      lat: number
      lng: number
    }
  }
  contact: {
    phone?: string
    email?: string
    website?: string
  }
  business: {
    type?: string
    nafCode?: string
    siret?: string
    siren?: string
  }
  scrapingData: {
    source: 'google_maps' | 'insee' | 'manual' | 'other'
    scrapedBy: string
    scrapedAt: string
    lastUpdated: string
  }
  websiteGeneration: {
    status: 'pending' | 'generated' | 'approved' | 'rejected' | 'not_generated'
    previewLink?: string
    previewScreenshot?: string
    generatedAt?: string
    apiSource?: 'deepsite' | 'bolt' | 'other' | null
  }
  emailOutreach: {
    status: 'not_sent' | 'sent' | 'opened' | 'responded' | 'bounced'
    template?: string
    sentAt?: string
    openedAt?: string
    respondedAt?: string
  }
  tags?: string[]
  notes?: string
  active: boolean
  createdAt: string
  updatedAt: string
}

export const useBusinessStore = defineStore('business', () => {
  const businesses = ref<Business[]>([])
  const currentBusiness = ref<Business | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const totalCount = ref(0)
  const pagination = ref({
    page: 1,
    limit: 20,
    totalPages: 1
  })

  // Getters
  const getBusinessById = computed(() => (id: string) => {
    return businesses.value.find(business => business._id === id) || null
  })

  const getBusinessesByCity = computed(() => (city: string) => {
    return businesses.value.filter(business => business.address.city === city)
  })

  const getBusinessesByStatus = computed(() => (status: string) => {
    return businesses.value.filter(business => business.websiteGeneration.status === status)
  })

  // Actions
  const fetchBusinesses = async (params: Record<string, any> = {}) => {
    loading.value = true
    error.value = null

    try {
      // In a real app, this would call the API
      // const response = await axios.get('/businesses', { params })

      // For now, we'll simulate a successful response
      await new Promise(resolve => setTimeout(resolve, 500))

      // We're not doing any filtering here since we're using mock data
      // In a real app, we would filter based on params

      // Log the current businesses
      console.log(`Fetched ${businesses.value.length} businesses`)

      // Set pagination
      totalCount.value = businesses.value.length
      pagination.value = {
        page: 1,
        limit: 20,
        totalPages: Math.ceil(businesses.value.length / 20)
      }

      return businesses.value
    } catch (err: any) {
      console.error('Error fetching businesses:', err)
      error.value = err.message ?? 'Failed to fetch businesses'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  const fetchBusinessById = async (id: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await axios.get(`/businesses/${id}`)

      if (response.data.success) {
        currentBusiness.value = response.data.data

        // Update business in the businesses array if it exists
        const index = businesses.value.findIndex(business => business._id === id)
        if (index !== -1) {
          businesses.value[index] = response.data.data
        }
      } else {
        throw new Error(response.data.error || 'Failed to fetch business')
      }

      return currentBusiness.value
    } catch (err: any) {
      console.error(`Error fetching business ${id}:`, err)
      error.value = err.response?.data?.error || err.message || 'Failed to fetch business'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  const createBusiness = async (businessData: Partial<Business>) => {
    loading.value = true
    error.value = null

    try {
      // In a real app, this would call the API
      // const response = await axios.post('/businesses', businessData)

      // For now, we'll simulate a successful response
      await new Promise(resolve => setTimeout(resolve, 500))

      // Create a new business with default values for required fields
      const newBusiness = {
        _id: businessData._id || `mock-${Date.now()}`,
        name: businessData.name || 'New Business',
        status: businessData.status || 'prospect', // Default to prospect
        address: {
          street: businessData.address?.street || '',
          city: businessData.address?.city || 'Unknown',
          postalCode: businessData.address?.postalCode || '',
          region: businessData.address?.region || '',
          country: businessData.address?.country || 'France',
          coordinates: businessData.address?.coordinates || undefined
        },
        contact: {
          phone: businessData.contact?.phone || '',
          email: businessData.contact?.email || '',
          website: businessData.contact?.website || ''
        },
        business: {
          type: businessData.business?.type || 'Other',
          nafCode: businessData.business?.nafCode || '',
          siret: businessData.business?.siret || '',
          siren: businessData.business?.siren || ''
        },
        scrapingData: businessData.scrapingData || {
          source: 'manual',
          scrapedBy: 'user',
          scrapedAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        },
        websiteGeneration: businessData.websiteGeneration || {
          status: 'not_generated'
        },
        emailOutreach: businessData.emailOutreach || {
          status: 'not_sent'
        },
        tags: businessData.tags || [],
        notes: businessData.notes || '',
        active: businessData.active !== undefined ? businessData.active : true,
        createdAt: businessData.createdAt || new Date().toISOString(),
        updatedAt: businessData.updatedAt || new Date().toISOString()
      } as Business

      // Add to the businesses array
      businesses.value.push(newBusiness)

      console.log('Created new business:', newBusiness)
      return newBusiness
    } catch (err: any) {
      console.error('Error creating business:', err)
      error.value = err.message || 'Failed to create business'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  const updateBusiness = async (id: string, businessData: Partial<Business>) => {
    loading.value = true
    error.value = null

    try {
      // In a real app, this would call the API
      // const response = await axios.put(`/businesses/${id}`, businessData)

      // For now, we'll simulate a successful response
      await new Promise(resolve => setTimeout(resolve, 500))

      // Find the business to update
      const index = businesses.value.findIndex(business => business._id === id)

      if (index !== -1) {
        // Create updated business by merging existing data with new data
        const existingBusiness = businesses.value[index]
        const updatedBusiness = {
          ...existingBusiness,
          ...businessData,
          // Handle nested objects
          address: {
            ...existingBusiness.address,
            ...businessData.address
          },
          contact: {
            ...existingBusiness.contact,
            ...businessData.contact
          },
          business: {
            ...existingBusiness.business,
            ...businessData.business
          },
          websiteGeneration: {
            ...existingBusiness.websiteGeneration,
            ...businessData.websiteGeneration
          },
          emailOutreach: {
            ...existingBusiness.emailOutreach,
            ...businessData.emailOutreach
          },
          updatedAt: new Date().toISOString()
        } as Business

        // Update business in the businesses array
        businesses.value[index] = updatedBusiness

        // Update current business if it's the same one
        if (currentBusiness.value && currentBusiness.value._id === id) {
          currentBusiness.value = updatedBusiness
        }

        console.log('Updated business:', updatedBusiness)
        return updatedBusiness
      } else {
        throw new Error(`Business with ID ${id} not found`)
      }
    } catch (err: any) {
      console.error(`Error updating business ${id}:`, err)
      error.value = err.message || 'Failed to update business'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  const deleteBusiness = async (id: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await axios.delete(`/businesses/${id}`)

      if (response.data.success) {
        // Remove business from the businesses array
        businesses.value = businesses.value.filter(business => business._id !== id)

        if (currentBusiness.value && currentBusiness.value._id === id) {
          currentBusiness.value = null
        }

        return true
      } else {
        throw new Error(response.data.error || 'Failed to delete business')
      }
    } catch (err: any) {
      console.error(`Error deleting business ${id}:`, err)
      error.value = err.response?.data?.error || err.message || 'Failed to delete business'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  const fetchBusinessesByLocation = async (city: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await axios.get(`/businesses/location/${city}`)

      if (response.data.success) {
        return response.data.data
      } else {
        throw new Error(response.data.error || 'Failed to fetch businesses by location')
      }
    } catch (err: any) {
      console.error(`Error fetching businesses in ${city}:`, err)
      error.value = err.response?.data?.error || err.message || 'Failed to fetch businesses by location'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  const generateWebsitePreview = async (id: string, options: Record<string, any> = {}) => {
    loading.value = true
    error.value = null

    try {
      const response = await axios.post(`/businesses/${id}/generate-preview`, options)

      if (response.data.success) {
        const updatedBusiness = response.data.data

        // Update business in the businesses array
        const index = businesses.value.findIndex(business => business._id === id)
        if (index !== -1) {
          businesses.value[index] = updatedBusiness
        }

        if (currentBusiness.value && currentBusiness.value._id === id) {
          currentBusiness.value = updatedBusiness
        }

        return updatedBusiness
      } else {
        throw new Error(response.data.error || 'Failed to generate website preview')
      }
    } catch (err: any) {
      console.error(`Error generating website preview for business ${id}:`, err)
      error.value = err.response?.data?.error || err.message || 'Failed to generate website preview'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  const approveWebsitePreview = async (id: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await axios.post(`/businesses/${id}/approve-preview`)

      if (response.data.success) {
        const updatedBusiness = response.data.data

        // Update business in the businesses array
        const index = businesses.value.findIndex(business => business._id === id)
        if (index !== -1) {
          businesses.value[index] = updatedBusiness
        }

        if (currentBusiness.value && currentBusiness.value._id === id) {
          currentBusiness.value = updatedBusiness
        }

        return updatedBusiness
      } else {
        throw new Error(response.data.error || 'Failed to approve website preview')
      }
    } catch (err: any) {
      console.error(`Error approving website preview for business ${id}:`, err)
      error.value = err.response?.data?.error || err.message || 'Failed to approve website preview'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  const rejectWebsitePreview = async (id: string, reason: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await axios.post(`/businesses/${id}/reject-preview`, { reason })

      if (response.data.success) {
        const updatedBusiness = response.data.data

        // Update business in the businesses array
        const index = businesses.value.findIndex(business => business._id === id)
        if (index !== -1) {
          businesses.value[index] = updatedBusiness
        }

        if (currentBusiness.value && currentBusiness.value._id === id) {
          currentBusiness.value = updatedBusiness
        }

        return updatedBusiness
      } else {
        throw new Error(response.data.error || 'Failed to reject website preview')
      }
    } catch (err: any) {
      console.error(`Error rejecting website preview for business ${id}:`, err)
      error.value = err.response?.data?.error || err.message || 'Failed to reject website preview'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  const sendBusinessEmail = async (id: string, emailData: any) => {
    loading.value = true
    error.value = null

    try {
      // In a real app, this would call the API
      // const response = await axios.post(`/emails/business/${id}`, emailData)

      // For now, we'll simulate a successful response
      await new Promise(resolve => setTimeout(resolve, 500))

      // Find the business to update
      const index = businesses.value.findIndex(business => business._id === id)

      if (index !== -1) {
        // Create updated business with email status
        const existingBusiness = businesses.value[index]
        const updatedBusiness = {
          ...existingBusiness,
          emailOutreach: {
            ...existingBusiness.emailOutreach,
            status: 'sent',
            sentAt: new Date().toISOString()
          }
        } as Business

        // Update business in the businesses array
        businesses.value[index] = updatedBusiness

        // Update current business if it's the same one
        if (currentBusiness.value && currentBusiness.value._id === id) {
          currentBusiness.value = updatedBusiness
        }

        console.log('Email sent to business:', updatedBusiness)
        return updatedBusiness
      } else {
        throw new Error(`Business with ID ${id} not found`)
      }
    } catch (err: any) {
      console.error(`Error sending email to business ${id}:`, err)
      error.value = err.message ?? 'Failed to send email'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  return {
    businesses,
    currentBusiness,
    loading,
    error,
    totalCount,
    pagination,
    getBusinessById,
    getBusinessesByCity,
    getBusinessesByStatus,
    fetchBusinesses,
    fetchBusinessById,
    createBusiness,
    updateBusiness,
    deleteBusiness,
    fetchBusinessesByLocation,
    generateWebsitePreview,
    approveWebsitePreview,
    rejectWebsitePreview,
    sendBusinessEmail
  }
})
