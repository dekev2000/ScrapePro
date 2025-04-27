import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

interface ScrapingJob {
  _id: string
  name: string
  description?: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'paused'
  source: 'google_maps' | 'insee' | 'linkedin' | 'website' | 'other'
  sourceUrl?: string
  searchTerms: string[]
  locations: string[]
  filters: Record<string, any>
  configuration: Record<string, any>
  progress: number
  startedAt?: string
  completedAt?: string
  resultsCount: number
  logs: Array<{
    timestamp: string
    level: 'info' | 'warning' | 'error'
    message: string
  }>
  createdAt: string
}

export const useScrapeStore = defineStore('scrape', () => {
  const scrapingJobs = ref<ScrapingJob[]>([
    {
      _id: '1',
      name: 'Paris Restaurants',
      description: 'Scraping data for restaurants in Paris',
      status: 'completed',
      source: 'google_maps',
      sourceUrl: 'https://www.google.com/maps',
      searchTerms: ['restaurant', 'bistro', 'café'],
      locations: ['Paris, France'],
      filters: {
        rating: '4+',
        priceRange: '$$-$$$'
      },
      configuration: {
        maxResults: 100,
        includeReviews: true,
        includePhotos: false
      },
      progress: 100,
      startedAt: '2023-06-15T10:00:00Z',
      completedAt: '2023-06-15T11:30:00Z',
      resultsCount: 87,
      logs: [
        {
          timestamp: '2023-06-15T10:00:00Z',
          level: 'info',
          message: 'Scraping job started'
        },
        {
          timestamp: '2023-06-15T11:30:00Z',
          level: 'info',
          message: 'Scraping job completed successfully'
        }
      ],
      createdAt: '2023-06-14T15:30:00Z'
    },
    {
      _id: '2',
      name: 'London Marketing Agencies',
      description: 'Collecting data on marketing agencies in London',
      status: 'completed',
      source: 'linkedin',
      sourceUrl: 'https://www.linkedin.com',
      searchTerms: ['marketing agency', 'digital marketing', 'advertising'],
      locations: ['London, UK'],
      filters: {
        employeeCount: '11-50'
      },
      configuration: {
        maxResults: 50,
        includeEmployees: true
      },
      progress: 100,
      startedAt: '2023-06-20T13:00:00Z',
      completedAt: '2023-06-20T14:30:00Z',
      resultsCount: 42,
      logs: [
        {
          timestamp: '2023-06-20T13:00:00Z',
          level: 'info',
          message: 'Scraping job started'
        },
        {
          timestamp: '2023-06-20T14:30:00Z',
          level: 'info',
          message: 'Scraping job completed successfully'
        }
      ],
      createdAt: '2023-06-19T09:45:00Z'
    },
    {
      _id: '3',
      name: 'Lyon Tech Companies',
      description: 'Gathering information on tech companies in Lyon',
      status: 'in_progress',
      source: 'insee',
      sourceUrl: 'https://www.insee.fr',
      searchTerms: ['technology', 'software', 'IT'],
      locations: ['Lyon, France'],
      filters: {
        legalStatus: 'SAS'
      },
      configuration: {
        maxResults: 75,
        includeFinancialData: true
      },
      progress: 65,
      startedAt: '2023-06-22T09:00:00Z',
      resultsCount: 49,
      logs: [
        {
          timestamp: '2023-06-22T09:00:00Z',
          level: 'info',
          message: 'Scraping job started'
        },
        {
          timestamp: '2023-06-22T09:30:00Z',
          level: 'info',
          message: 'Processing page 3 of 5'
        }
      ],
      createdAt: '2023-06-21T16:20:00Z'
    },
    {
      _id: '4',
      name: 'Nice Hotels',
      description: 'Collecting data on hotels in Nice',
      status: 'pending',
      source: 'google_maps',
      searchTerms: ['hotel', 'resort', 'accommodation'],
      locations: ['Nice, France'],
      filters: {
        rating: '4+',
        priceRange: '$$$-$$$$'
      },
      configuration: {
        maxResults: 50,
        includeReviews: true,
        includePhotos: true
      },
      progress: 0,
      resultsCount: 0,
      logs: [],
      createdAt: '2023-06-18T14:10:00Z'
    },
    {
      _id: '5',
      name: 'Paris Cafés',
      description: 'Gathering information on cafés in Paris',
      status: 'failed',
      source: 'google_maps',
      sourceUrl: 'https://www.google.com/maps',
      searchTerms: ['café', 'coffee shop'],
      locations: ['Paris, France'],
      filters: {
        rating: '3+',
        priceRange: '$-$$'
      },
      configuration: {
        maxResults: 100,
        includeReviews: true,
        includePhotos: false
      },
      progress: 35,
      startedAt: '2023-06-15T11:00:00Z',
      resultsCount: 35,
      logs: [
        {
          timestamp: '2023-06-15T11:00:00Z',
          level: 'info',
          message: 'Scraping job started'
        },
        {
          timestamp: '2023-06-15T11:20:00Z',
          level: 'error',
          message: 'Rate limit exceeded. Job failed.'
        }
      ],
      createdAt: '2023-06-14T16:45:00Z'
    }
  ])
  const currentJob = ref<ScrapingJob | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const pollingIntervals = ref<Record<string, number>>({})

  // Getters
  const getJobById = computed(() => (id: string) => {
    return scrapingJobs.value.find(job => job._id === id) || null
  })

  const getJobsByStatus = computed(() => (status: string) => {
    return scrapingJobs.value.filter(job => job.status === status)
  })

  // Actions
  const fetchScrapingJobs = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await axios.get('/scraping')

      if (response.data.success) {
        scrapingJobs.value = response.data.data
      } else {
        throw new Error(response.data.error || 'Failed to fetch scraping jobs')
      }

      return scrapingJobs.value
    } catch (err: any) {
      console.error('Error fetching scraping jobs:', err)
      error.value = err.response?.data?.error || err.message || 'Failed to fetch scraping jobs'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  const fetchScrapingJob = async (id: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await axios.get(`/scraping/${id}`)

      if (response.data.success) {
        currentJob.value = response.data.data

        // Update job in the jobs array if it exists
        const index = scrapingJobs.value.findIndex(job => job._id === id)
        if (index !== -1) {
          scrapingJobs.value[index] = response.data.data
        }
      } else {
        throw new Error(response.data.error || 'Failed to fetch scraping job')
      }

      return currentJob.value
    } catch (err: any) {
      console.error(`Error fetching scraping job ${id}:`, err)
      error.value = err.response?.data?.error || err.message || 'Failed to fetch scraping job'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  const createScrapeJob = async (jobData: Partial<ScrapingJob>) => {
    loading.value = true
    error.value = null

    try {
      const response = await axios.post('/scraping', jobData)

      if (response.data.success) {
        const newJob = response.data.data
        scrapingJobs.value.push(newJob)
        return newJob
      } else {
        throw new Error(response.data.error || 'Failed to create scraping job')
      }
    } catch (err: any) {
      console.error('Error creating scraping job:', err)
      error.value = err.response?.data?.error || err.message || 'Failed to create scraping job'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  const updateScrapeJob = async (id: string, jobData: Partial<ScrapingJob>) => {
    loading.value = true
    error.value = null

    try {
      const response = await axios.put(`/scraping/${id}`, jobData)

      if (response.data.success) {
        const updatedJob = response.data.data

        // Update job in the jobs array
        const index = scrapingJobs.value.findIndex(job => job._id === id)
        if (index !== -1) {
          scrapingJobs.value[index] = updatedJob
        }

        if (currentJob.value && currentJob.value._id === id) {
          currentJob.value = updatedJob
        }

        return updatedJob
      } else {
        throw new Error(response.data.error || 'Failed to update scraping job')
      }
    } catch (err: any) {
      console.error(`Error updating scraping job ${id}:`, err)
      error.value = err.response?.data?.error || err.message || 'Failed to update scraping job'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  const deleteScrapeJob = async (id: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await axios.delete(`/scraping/${id}`)

      if (response.data.success) {
        // Remove job from the jobs array
        scrapingJobs.value = scrapingJobs.value.filter(job => job._id !== id)

        if (currentJob.value && currentJob.value._id === id) {
          currentJob.value = null
        }

        return true
      } else {
        throw new Error(response.data.error || 'Failed to delete scraping job')
      }
    } catch (err: any) {
      console.error(`Error deleting scraping job ${id}:`, err)
      error.value = err.response?.data?.error || err.message || 'Failed to delete scraping job'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  const runScrapeJob = async (id: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await axios.post(`/scraping/${id}/run`)

      if (response.data.success) {
        const updatedJob = response.data.data

        // Update job in the jobs array
        const index = scrapingJobs.value.findIndex(job => job._id === id)
        if (index !== -1) {
          scrapingJobs.value[index] = updatedJob
        }

        if (currentJob.value && currentJob.value._id === id) {
          currentJob.value = updatedJob
        }

        return updatedJob
      } else {
        throw new Error(response.data.error || 'Failed to run scraping job')
      }
    } catch (err: any) {
      console.error(`Error running scraping job ${id}:`, err)
      error.value = err.response?.data?.error || err.message || 'Failed to run scraping job'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  const pauseScrapeJob = async (id: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await axios.post(`/scraping/${id}/pause`)

      if (response.data.success) {
        const updatedJob = response.data.data

        // Update job in the jobs array
        const index = scrapingJobs.value.findIndex(job => job._id === id)
        if (index !== -1) {
          scrapingJobs.value[index] = updatedJob
        }

        if (currentJob.value && currentJob.value._id === id) {
          currentJob.value = updatedJob
        }

        return updatedJob
      } else {
        throw new Error(response.data.error || 'Failed to pause scraping job')
      }
    } catch (err: any) {
      console.error(`Error pausing scraping job ${id}:`, err)
      error.value = err.response?.data?.error || err.message || 'Failed to pause scraping job'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  const resumeScrapeJob = async (id: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await axios.post(`/scraping/${id}/resume`)

      if (response.data.success) {
        const updatedJob = response.data.data

        // Update job in the jobs array
        const index = scrapingJobs.value.findIndex(job => job._id === id)
        if (index !== -1) {
          scrapingJobs.value[index] = updatedJob
        }

        if (currentJob.value && currentJob.value._id === id) {
          currentJob.value = updatedJob
        }

        return updatedJob
      } else {
        throw new Error(response.data.error || 'Failed to resume scraping job')
      }
    } catch (err: any) {
      console.error(`Error resuming scraping job ${id}:`, err)
      error.value = err.response?.data?.error || err.message || 'Failed to resume scraping job'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  const fetchJobLogs = async (id: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await axios.get(`/scraping/${id}/logs`)

      if (response.data.success) {
        return response.data.data
      } else {
        throw new Error(response.data.error || 'Failed to fetch job logs')
      }
    } catch (err: any) {
      console.error(`Error fetching logs for job ${id}:`, err)
      error.value = err.response?.data?.error || err.message || 'Failed to fetch job logs'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  const fetchJobResults = async (id: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await axios.get(`/scraping/${id}/results`)

      if (response.data.success) {
        return response.data.data
      } else {
        throw new Error(response.data.error || 'Failed to fetch job results')
      }
    } catch (err: any) {
      console.error(`Error fetching results for job ${id}:`, err)
      error.value = err.response?.data?.error || err.message || 'Failed to fetch job results'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  // Polling functions for real-time updates
  const startPollingJob = (id: string, interval = 5000) => {
    // Clear any existing interval for this job
    stopPollingJob(id)

    // Set up new polling interval
    pollingIntervals.value[id] = window.setInterval(async () => {
      try {
        await fetchScrapingJob(id)

        // If job is completed or failed, stop polling
        if (currentJob.value && (currentJob.value.status === 'completed' || currentJob.value.status === 'failed')) {
          stopPollingJob(id)
        }
      } catch (err) {
        console.error(`Error polling job ${id}:`, err)
        stopPollingJob(id)
      }
    }, interval)
  }

  const stopPollingJob = (id: string) => {
    if (pollingIntervals.value[id]) {
      clearInterval(pollingIntervals.value[id])
      delete pollingIntervals.value[id]
    }
  }

  // Clean up intervals when store is destroyed
  const cleanup = () => {
    Object.keys(pollingIntervals.value).forEach(id => {
      clearInterval(pollingIntervals.value[id])
    })
    pollingIntervals.value = {}
  }

  return {
    scrapingJobs,
    currentJob,
    loading,
    error,
    getJobById,
    getJobsByStatus,
    fetchScrapingJobs,
    fetchScrapingJob,
    createScrapeJob,
    updateScrapeJob,
    deleteScrapeJob,
    runScrapeJob,
    pauseScrapeJob,
    resumeScrapeJob,
    fetchJobLogs,
    fetchJobResults,
    startPollingJob,
    stopPollingJob,
    cleanup
  }
})
