const logger = require('../utils/logger');
const Email = require('../models/Email');
const EmailTemplate = require('../models/EmailTemplate');
const Business = require('../models/Business');

/**
 * Email Service
 * Handles email sending and tracking
 */
class EmailService {
  constructor() {
    // In a real app, this would be configured with an actual email provider
    this.emailProvider = process.env.EMAIL_PROVIDER || 'mock';
    this.fromEmail = process.env.FROM_EMAIL || 'contact@scrapepro.com';
    this.fromName = process.env.FROM_NAME || 'ScrapePro';
  }

  /**
   * Send an email to a business
   * @param {string} businessId - ID of the business
   * @param {string} templateId - ID of the email template
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - Email record
   */
  async sendBusinessEmail(businessId, templateId, options = {}) {
    try {
      // Get business and template
      const business = await Business.findById(businessId);
      if (!business) {
        throw new Error(`Business with ID ${businessId} not found`);
      }
      
      const template = await EmailTemplate.findById(templateId);
      if (!template) {
        throw new Error(`Email template with ID ${templateId} not found`);
      }
      
      // Check if business has an email
      if (!business.contact.email && !options.recipientEmail) {
        throw new Error('Business has no email address and no recipient email provided');
      }
      
      // Prepare email data
      const recipientEmail = options.recipientEmail || business.contact.email;
      const recipientName = options.recipientName || business.name;
      
      // Process template variables
      const subject = this.processTemplateVariables(template.subject, business, options);
      const body = this.processTemplateVariables(template.body, business, options);
      
      // Create email record
      const email = await Email.create({
        subject,
        body,
        recipient: recipientEmail,
        sender: options.sender || this.fromEmail,
        user: options.userId,
        status: 'scheduled',
        trackingId: options.trackingId || `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`
      });
      
      // Send the email
      await this.sendEmail({
        to: recipientEmail,
        toName: recipientName,
        from: options.sender || this.fromEmail,
        fromName: options.senderName || this.fromName,
        subject,
        body,
        trackingId: email.trackingId
      });
      
      // Update email status
      email.status = 'sent';
      email.sentAt = Date.now();
      await email.save();
      
      // Update business email outreach status
      business.emailOutreach = {
        status: 'sent',
        template: template._id,
        sentAt: Date.now()
      };
      await business.save();
      
      // Update template usage statistics
      template.usage.sentCount += 1;
      await template.save();
      
      return email;
    } catch (error) {
      logger.error(`Error sending business email: ${error.message}`, {
        businessId,
        templateId,
        error: error.stack
      });
      throw error;
    }
  }

  /**
   * Send an email
   * @param {Object} emailData - Email data
   * @returns {Promise<boolean>} - Success status
   */
  async sendEmail(emailData) {
    try {
      // In a real app, this would send an actual email
      // For now, we'll just log it
      logger.info(`Sending email to ${emailData.to}`, {
        subject: emailData.subject,
        trackingId: emailData.trackingId
      });
      
      // Simulate sending delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return true;
    } catch (error) {
      logger.error(`Error sending email: ${error.message}`, {
        to: emailData.to,
        subject: emailData.subject,
        error: error.stack
      });
      throw error;
    }
  }

  /**
   * Process template variables
   * @param {string} content - Template content
   * @param {Object} business - Business data
   * @param {Object} options - Additional options
   * @returns {string} - Processed content
   */
  processTemplateVariables(content, business, options = {}) {
    let processedContent = content;
    
    // Replace business variables
    processedContent = processedContent.replace(/{{business.name}}/g, business.name);
    processedContent = processedContent.replace(/{{business.address.city}}/g, business.address.city || '');
    processedContent = processedContent.replace(/{{business.address.street}}/g, business.address.street || '');
    processedContent = processedContent.replace(/{{business.contact.phone}}/g, business.contact.phone || '');
    processedContent = processedContent.replace(/{{business.contact.email}}/g, business.contact.email || '');
    
    // Replace website preview variables
    if (business.websiteGeneration && business.websiteGeneration.previewLink) {
      processedContent = processedContent.replace(/{{preview.link}}/g, business.websiteGeneration.previewLink);
    } else {
      processedContent = processedContent.replace(/{{preview.link}}/g, 'Preview not available');
    }
    
    // Replace custom variables from options
    if (options.variables) {
      for (const [key, value] of Object.entries(options.variables)) {
        processedContent = processedContent.replace(new RegExp(`{{${key}}}`, 'g'), value);
      }
    }
    
    // Replace tracking pixel
    const trackingPixel = `<img src="${process.env.API_URL || 'http://localhost:3000'}/api/emails/track/${options.trackingId || 'tracking-id'}?type=open" width="1" height="1" />`;
    processedContent = processedContent.replace(/{{tracking.pixel}}/g, trackingPixel);
    
    return processedContent;
  }

  /**
   * Track email open
   * @param {string} trackingId - Email tracking ID
   * @returns {Promise<Object>} - Updated email
   */
  async trackEmailOpen(trackingId) {
    try {
      const email = await Email.findOne({ trackingId });
      if (!email) {
        throw new Error(`Email with tracking ID ${trackingId} not found`);
      }
      
      // Update email
      email.isOpened = true;
      email.openedAt = Date.now();
      await email.save();
      
      // Update business if associated
      const business = await Business.findOne({ 'emailOutreach.template': email.template });
      if (business) {
        business.emailOutreach.status = 'opened';
        business.emailOutreach.openedAt = Date.now();
        await business.save();
        
        // Update template statistics
        const template = await EmailTemplate.findById(business.emailOutreach.template);
        if (template) {
          template.usage.openRate = (template.usage.sentCount > 0) 
            ? (await Email.countDocuments({ template: template._id, isOpened: true })) / template.usage.sentCount * 100
            : 0;
          await template.save();
        }
      }
      
      return email;
    } catch (error) {
      logger.error(`Error tracking email open: ${error.message}`, {
        trackingId,
        error: error.stack
      });
      throw error;
    }
  }

  /**
   * Track email click
   * @param {string} trackingId - Email tracking ID
   * @param {string} linkId - Link identifier
   * @returns {Promise<Object>} - Updated email
   */
  async trackEmailClick(trackingId, linkId) {
    try {
      const email = await Email.findOne({ trackingId });
      if (!email) {
        throw new Error(`Email with tracking ID ${trackingId} not found`);
      }
      
      // Update email
      email.isClicked = true;
      email.clickedAt = Date.now();
      await email.save();
      
      // Log click details
      logger.info(`Email link clicked: ${linkId}`, {
        trackingId,
        linkId
      });
      
      return email;
    } catch (error) {
      logger.error(`Error tracking email click: ${error.message}`, {
        trackingId,
        linkId,
        error: error.stack
      });
      throw error;
    }
  }

  /**
   * Create an email template
   * @param {Object} templateData - Template data
   * @returns {Promise<Object>} - Created template
   */
  async createTemplate(templateData) {
    try {
      const template = await EmailTemplate.create(templateData);
      return template;
    } catch (error) {
      logger.error(`Error creating email template: ${error.message}`, {
        templateData,
        error: error.stack
      });
      throw error;
    }
  }
}

module.exports = new EmailService();
