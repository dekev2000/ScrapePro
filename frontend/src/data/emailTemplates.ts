export interface EmailTemplate {
  id: string
  name: string
  category: string
  subject: string
  body: string
  description: string
}

const emailTemplates: EmailTemplate[] = [
  {
    id: 'welcome-template',
    name: 'Welcome Template',
    category: 'Introduction',
    subject: 'Welcome to Our Services - {business_name}',
    body: `<p>Dear {contact_name},</p>
<p>We're excited to welcome you to our services. We've created a custom website for your business that we believe will help you attract more customers and grow your online presence.</p>
<p>You can view your new website here: <a href="{website_url}" target="_blank">{website_url}</a></p>
<p>Please take a look at the preview and let us know what you think.</p>
<p>Best regards,<br>{sender_name}<br>{company_name}</p>`,
    description: 'A warm welcome message for new clients'
  },
  {
    id: 'website-ready',
    name: 'Website Ready',
    category: 'Notification',
    subject: 'Your Website for {business_name} is Ready!',
    body: `<p>Dear {contact_name},</p>
<p>Great news! Your website for {business_name} is now ready for your review.</p>
<p>You can access it here: <a href="{website_url}" target="_blank">{website_url}</a></p>
<p>We've designed it to showcase your business in the best possible light and make it easy for potential customers to find you online.</p>
<p>Please take a moment to review the site and let us know if you'd like any changes before we finalize it.</p>
<p>Best regards,<br>{sender_name}<br>{company_name}</p>`,
    description: 'Notification that a website is ready for review'
  },
  {
    id: 'follow-up',
    name: 'Follow-up',
    category: 'Follow-up',
    subject: 'Follow-up: Your {business_name} Website',
    body: `<p>Dear {contact_name},</p>
<p>I wanted to follow up regarding the website we created for {business_name}.</p>
<p>Website URL: <a href="{website_url}" target="_blank">{website_url}</a></p>
<p>Have you had a chance to review it? We're eager to hear your feedback and make any necessary adjustments to ensure it perfectly represents your business.</p>
<p>Please let me know if you have any questions or concerns.</p>
<p>Best regards,<br>{sender_name}<br>{company_name}</p>`,
    description: 'Follow-up message for clients who haven\'t responded'
  },
  {
    id: 'special-offer',
    name: 'Special Offer',
    category: 'Marketing',
    subject: 'Special Offer for {business_name}',
    body: `<p>Dear {contact_name},</p>
<p>We hope you're enjoying your new website. We wanted to let you know about a special offer we're currently running.</p>
<p>For a limited time, we're offering a 20% discount on our premium SEO package, which can help your website rank higher in search results and attract more customers.</p>
<p>If you're interested in learning more about this offer, please reply to this email or call us at [Your Phone Number].</p>
<p>Best regards,<br>{sender_name}<br>{company_name}</p>`,
    description: 'Special offer for existing clients'
  },
  {
    id: 'testimonial-request',
    name: 'Testimonial Request',
    category: 'Engagement',
    subject: 'We Value Your Feedback - {business_name}',
    body: `<p>Dear {contact_name},</p>
<p>We hope you're enjoying your new website and the benefits it brings to your business.</p>
<p>We're constantly working to improve our services, and your feedback is invaluable to us. Would you be willing to share your experience working with us in a short testimonial?</p>
<p>Your testimonial would help other businesses like yours make informed decisions about their online presence.</p>
<p>Simply reply to this email with a few sentences about your experience, and let us know if we can use your name and business name alongside the testimonial.</p>
<p>Thank you for your time and support.</p>
<p>Best regards,<br>{sender_name}<br>{company_name}</p>`,
    description: 'Request for a testimonial from satisfied clients'
  },
  {
    id: 'monthly-report',
    name: 'Monthly Performance Report',
    category: 'Reporting',
    subject: '{business_name} - Monthly Website Performance Report',
    body: `<p>Dear {contact_name},</p>
<p>I hope this email finds you well. I'm pleased to share your website's performance report for the past month.</p>
<h3>Performance Highlights:</h3>
<ul>
  <li>Website Visits: [Number]</li>
  <li>Unique Visitors: [Number]</li>
  <li>Average Time on Site: [Time]</li>
  <li>Top Performing Pages: [List]</li>
</ul>
<p>Your website at <a href="{website_url}" target="_blank">{website_url}</a> continues to attract visitors and generate interest in your business.</p>
<p>If you'd like to discuss these results or explore ways to further improve your online performance, please don't hesitate to contact us.</p>
<p>Best regards,<br>{sender_name}<br>{company_name}</p>`,
    description: 'Monthly website performance report for clients'
  },
  {
    id: 'update-announcement',
    name: 'Website Update Announcement',
    category: 'Notification',
    subject: 'Important Updates to Your {business_name} Website',
    body: `<p>Dear {contact_name},</p>
<p>We're writing to inform you that we've made some important updates to your website at <a href="{website_url}" target="_blank">{website_url}</a>.</p>
<h3>Updates Include:</h3>
<ul>
  <li>Security enhancements to protect your website and visitors</li>
  <li>Performance optimizations for faster loading times</li>
  <li>Mobile responsiveness improvements</li>
  <li>SEO adjustments to help improve your search engine rankings</li>
</ul>
<p>These updates are part of our commitment to ensuring your website remains secure, fast, and effective.</p>
<p>Please take a moment to review your website and let us know if you notice any issues or have any questions.</p>
<p>Best regards,<br>{sender_name}<br>{company_name}</p>`,
    description: 'Announcement of website updates or improvements'
  }
]

export default emailTemplates
