import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface EmailTemplate {
  _id: string
  name: string
  subject: string
  body: string
  category: string
  variables: Array<{
    name: string
    defaultValue: string
  }>
  createdBy: string
  isActive: boolean
  usage: {
    sentCount: number
    openRate: number
    responseRate: number
  }
  createdAt: string
  updatedAt: string
}

interface Email {
  _id: string
  subject: string
  body: string
  recipient: string
  sender: string
  user: string
  business?: string
  template?: string
  sentAt?: string
  isOpened: boolean
  openedAt?: string
  isClicked: boolean
  clickedAt?: string
  isResponded: boolean
  respondedAt?: string
  status: 'draft' | 'scheduled' | 'sent' | 'failed' | 'bounced'
  scheduledFor?: string
  createdAt: string
  updatedAt: string
}

export const useEmailStore = defineStore('email', () => {
  const emails = ref<Email[]>([])
  const templates = ref<EmailTemplate[]>([])
  const currentEmail = ref<Email | null>(null)
  const currentTemplate = ref<EmailTemplate | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const totalCount = ref(0)
  const pagination = ref({
    page: 1,
    limit: 20,
    totalPages: 1
  })

  // Getters
  const getEmailById = computed(() => (id: string) => {
    return emails.value.find(email => email._id === id) || null
  })

  const getTemplateById = computed(() => (id: string) => {
    return templates.value.find(template => template._id === id) || null
  })

  const getTemplatesByCategory = computed(() => (category: string) => {
    return templates.value.filter(template => template.category === category)
  })

  // Actions for emails
  const fetchEmails = async (params: Record<string, any> = {}) => {
    loading.value = true
    error.value = null

    try {
      const response = await axios.get('/emails', { params })

      if (response.data.success) {
        emails.value = response.data.data
        totalCount.value = response.data.count || emails.value.length

        if (response.data.pagination) {
          pagination.value = response.data.pagination
        }
      } else {
        throw new Error(response.data.error || 'Failed to fetch emails')
      }

      return emails.value
    } catch (err: any) {
      console.error('Error fetching emails:', err)
      error.value = err.response?.data?.error || err.message || 'Failed to fetch emails'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  const fetchEmailById = async (id: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await axios.get(`/emails/${id}`)

      if (response.data.success) {
        currentEmail.value = response.data.data

        // Update email in the emails array if it exists
        const index = emails.value.findIndex(email => email._id === id)
        if (index !== -1) {
          emails.value[index] = response.data.data
        }
      } else {
        throw new Error(response.data.error || 'Failed to fetch email')
      }

      return currentEmail.value
    } catch (err: any) {
      console.error(`Error fetching email ${id}:`, err)
      error.value = err.response?.data?.error || err.message || 'Failed to fetch email'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  const sendEmail = async (emailData: Partial<Email>) => {
    loading.value = true
    error.value = null

    try {
      // In a real app, this would call the API
      // const response = await axios.post('/emails/send', emailData)

      // For now, we'll simulate a successful response
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Create a mock sent email
      const sentEmail: Email = {
        _id: Date.now().toString(),
        subject: emailData.subject || 'No Subject',
        body: emailData.body || '',
        recipient: emailData.recipient || '',
        sender: 'noreply@example.com',
        user: 'current-user',
        business: emailData.business,
        template: emailData.template,
        sentAt: new Date().toISOString(),
        isOpened: false,
        isClicked: false,
        isResponded: false,
        status: 'sent',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // Add to emails array
      emails.value.push(sentEmail)

      console.log('Email sent:', sentEmail)
      return sentEmail
    } catch (err: any) {
      console.error('Error sending email:', err)
      error.value = err.message || 'Failed to send email'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  const scheduleEmail = async (emailData: Partial<Email>) => {
    loading.value = true
    error.value = null

    try {
      const response = await axios.post('/emails/schedule', emailData)

      if (response.data.success) {
        const scheduledEmail = response.data.data
        emails.value.push(scheduledEmail)
        return scheduledEmail
      } else {
        throw new Error(response.data.error || 'Failed to schedule email')
      }
    } catch (err: any) {
      console.error('Error scheduling email:', err)
      error.value = err.response?.data?.error || err.message || 'Failed to schedule email'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  const deleteEmail = async (id: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await axios.delete(`/emails/${id}`)

      if (response.data.success) {
        // Remove email from the emails array
        emails.value = emails.value.filter(email => email._id !== id)

        if (currentEmail.value && currentEmail.value._id === id) {
          currentEmail.value = null
        }

        return true
      } else {
        throw new Error(response.data.error || 'Failed to delete email')
      }
    } catch (err: any) {
      console.error(`Error deleting email ${id}:`, err)
      error.value = err.response?.data?.error || err.message || 'Failed to delete email'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  // Actions for email templates
  const fetchTemplates = async () => {
    loading.value = true
    error.value = null

    try {
      // In a real app, this would call the API
      // const response = await axios.get('/emails/templates')

      // For now, we'll simulate a successful response
      await new Promise(resolve => setTimeout(resolve, 500))

      // Create mock templates if none exist
      if (templates.value.length === 0) {
        templates.value = [
          {
            _id: '1',
            name: 'Website Proposal',
            subject: 'New Website Proposal for {{business.name}}',
            body: `Dear {{business.name}},

We've created a custom website proposal for your business based on our research. We believe this design will help you attract more customers and grow your business.

You can view your custom website preview here: {{preview.link}}

Key features of your new website:
- Modern, professional design tailored to your industry
- Mobile-responsive layout for all devices
- Easy navigation and clear call-to-actions
- Optimized for search engines

Please let us know if you'd like to proceed with this design or if you have any questions.

Best regards,
Your Web Design Team`,
            category: 'proposal',
            variables: [],
            createdBy: 'system',
            isActive: true,
            usage: {
              sentCount: 0,
              openRate: 0,
              responseRate: 0
            },
            createdAt: '2023-01-01T00:00:00.000Z',
            updatedAt: '2023-01-01T00:00:00.000Z'
          },
          {
            _id: '2',
            name: 'Follow-up Email',
            subject: 'Following up on your website preview',
            body: `Hello {{business.name}},

I wanted to follow up regarding the website preview we sent you recently. Have you had a chance to review it?

You can access your custom website preview here: {{preview.link}}

We'd love to hear your thoughts and discuss any adjustments you'd like to make.

Feel free to reach out to us at any time.

Best regards,
Your Web Design Team`,
            category: 'follow-up',
            variables: [],
            createdBy: 'system',
            isActive: true,
            usage: {
              sentCount: 0,
              openRate: 0,
              responseRate: 0
            },
            createdAt: '2023-01-02T00:00:00.000Z',
            updatedAt: '2023-01-02T00:00:00.000Z'
          },
          {
            _id: '3',
            name: 'Special Offer',
            subject: 'Special Website Offer for {{business.name}}',
            body: `Dear {{business.name}},

We're excited to offer you a special discount on your website project if you decide to move forward within the next 7 days.

Your custom website preview: {{preview.link}}

Special Offer Details:
- 15% discount on the total project cost
- Free domain name registration for the first year
- 3 months of free website maintenance

This offer is valid for 7 days. Please let us know if you're interested in taking advantage of this limited-time offer.

Best regards,
Your Web Design Team`,
            category: 'promotion',
            variables: [],
            createdBy: 'system',
            isActive: true,
            usage: {
              sentCount: 0,
              openRate: 0,
              responseRate: 0
            },
            createdAt: '2023-01-03T00:00:00.000Z',
            updatedAt: '2023-01-03T00:00:00.000Z'
          }
        ]
      }

      return templates.value
    } catch (err: any) {
      console.error('Error fetching email templates:', err)
      error.value = err.message ?? 'Failed to fetch email templates'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  const fetchTemplateById = async (id: string) => {
    loading.value = true
    error.value = null

    try {
      // In a real app, this would call the API
      // const response = await axios.get(`/emails/templates/${id}`)

      // For now, we'll simulate a successful response
      await new Promise(resolve => setTimeout(resolve, 300))

      // Make sure we have templates
      if (templates.value.length === 0) {
        await fetchTemplates()
      }

      // Find the template
      const template = templates.value.find(t => t._id === id)

      if (!template) {
        throw new Error(`Template with ID ${id} not found`)
      }

      currentTemplate.value = template

      return template
    } catch (err: any) {
      console.error(`Error fetching email template ${id}:`, err)
      error.value = err.message ?? 'Failed to fetch email template'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  const createTemplate = async (templateData: Partial<EmailTemplate>) => {
    loading.value = true
    error.value = null

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))

      // Generate a new ID
      const maxId = Math.max(...templates.value.map(t => parseInt(t._id)), 0)
      const newId = (maxId + 1).toString()

      // Create the new template
      const newTemplate: EmailTemplate = {
        _id: newId,
        name: templateData.name ?? 'New Template',
        subject: templateData.subject ?? 'Subject',
        body: templateData.body ?? '',
        category: templateData.category ?? 'other',
        variables: templateData.variables ?? [],
        createdBy: 'current-user',
        isActive: true,
        usage: {
          sentCount: 0,
          openRate: 0,
          responseRate: 0
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // Add to templates
      templates.value.push(newTemplate)

      return newTemplate
    } catch (err: any) {
      console.error('Error creating email template:', err)
      error.value = err.message ?? 'Failed to create email template'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  const updateTemplate = async (id: string, templateData: Partial<EmailTemplate>) => {
    loading.value = true
    error.value = null

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))

      // Find the template
      const index = templates.value.findIndex(template => template._id === id)

      if (index === -1) {
        throw new Error('Template not found')
      }

      // Update the template
      const updatedTemplate = {
        ...templates.value[index],
        ...templateData,
        updatedAt: new Date().toISOString()
      }

      // Replace in the array
      templates.value[index] = updatedTemplate

      // Update current template if needed
      if (currentTemplate.value && currentTemplate.value._id === id) {
        currentTemplate.value = updatedTemplate
      }

      return updatedTemplate
    } catch (err: any) {
      console.error(`Error updating email template ${id}:`, err)
      error.value = err.message ?? 'Failed to update email template'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  const deleteTemplate = async (id: string) => {
    loading.value = true
    error.value = null

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))

      // Find the template
      const index = templates.value.findIndex(template => template._id === id)

      if (index === -1) {
        throw new Error('Template not found')
      }

      // Remove from the array
      templates.value = templates.value.filter(template => template._id !== id)

      // Clear current template if needed
      if (currentTemplate.value && currentTemplate.value._id === id) {
        currentTemplate.value = null
      }

      return true
    } catch (err: any) {
      console.error(`Error deleting email template ${id}:`, err)
      error.value = err.message ?? 'Failed to delete email template'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  return {
    emails,
    templates,
    currentEmail,
    currentTemplate,
    loading,
    error,
    totalCount,
    pagination,
    getEmailById,
    getTemplateById,
    getTemplatesByCategory,
    fetchEmails,
    fetchEmailById,
    sendEmail,
    scheduleEmail,
    deleteEmail,
    fetchTemplates,
    fetchTemplateById,
    createTemplate,
    updateTemplate,
    deleteTemplate
  }
})
