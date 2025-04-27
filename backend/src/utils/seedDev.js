/**
 * Development Seeder Script
 * This script creates initial users and data for development purposes
 * Run with: node src/utils/seedDev.js
 * Use --clear flag to remove existing data first: node src/utils/seedDev.js --clear
 */

require('dotenv').config();
const User = require('../models/User');
const EmailTemplate = require('../models/EmailTemplate');
const Business = require('../models/Business');
const ScrapingJob = require('../models/ScrapingJob');
const Email = require('../models/Email');
const { connectDB, closeDatabase } = require('../config/database');
const logger = require('../utils/logger');

// User data for development
const devUsers = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin'
  },
  {
    name: 'Collaborator User',
    email: 'user@example.com',
    password: 'password123',
    role: 'collaborator'
  },
  {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    role: 'collaborator'
  }
];

// Seed development users
const seedDevUsers = async (clearExisting = false) => {
  try {
    // Clear existing users if requested
    if (clearExisting) {
      console.log('Clearing existing users...');
      await User.deleteMany({});
      console.log('All users removed');
    }

    // Check if admin already exists
    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) {
      console.log('Admin user already exists. Skipping user creation.');
      return adminExists;
    }

    // Create users
    const users = await User.create(devUsers);

    console.log('Development users created:');
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - Role: ${user.role}`);
    });

    console.log('\nLogin credentials:');
    devUsers.forEach(user => {
      console.log(`- ${user.email} / ${user.password}`);
    });

    // Return the admin user for reference in other seed functions
    return users.find(user => user.role === 'admin');
  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  }
};

// Seed email templates
const seedEmailTemplates = async (adminUser, clearExisting = false) => {
  try {
    // Clear existing templates if requested
    if (clearExisting) {
      console.log('Clearing existing email templates...');
      await EmailTemplate.deleteMany({});
      console.log('All email templates removed');
    }

    // Check if templates already exist
    const templateCount = await EmailTemplate.countDocuments();
    if (templateCount > 0) {
      console.log(`${templateCount} email templates already exist. Skipping template creation.`);
      return;
    }

    // Template data
    const templates = [
      {
        name: 'Introduction Email',
        subject: 'Introducing our services to {{business.name}}',
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Hello {{business.name}},</h2>

            <p>We noticed your business in {{business.address.city}} and wanted to reach out with an exciting opportunity.</p>

            <p>We've created a preview website for your business that showcases your services in a modern, professional way. You can view it here:</p>

            <p><a href="{{preview.link}}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Your Preview Website</a></p>

            <p>This is just a sample of what we can do for your business. If you're interested in learning more, please reply to this email or call us at (555) 123-4567.</p>

            <p>Best regards,<br>The ScrapePro Team</p>

            {{tracking.pixel}}
          </div>
        `,
        category: 'introduction',
        variables: [
          { name: 'business.name', defaultValue: 'Your Business' },
          { name: 'business.address.city', defaultValue: 'Your City' },
          { name: 'preview.link', defaultValue: 'https://example.com/preview' }
        ],
        createdBy: adminUser._id,
        isActive: true,
        usage: {
          sentCount: 0,
          openRate: 0,
          responseRate: 0
        }
      },
      {
        name: 'Follow-up Email',
        subject: 'Following up with {{business.name}}',
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Hello again from ScrapePro,</h2>

            <p>We recently reached out about the preview website we created for {{business.name}}.</p>

            <p>We wanted to follow up and see if you had a chance to review it. We'd love to hear your thoughts!</p>

            <p>You can view your preview website here:</p>

            <p><a href="{{preview.link}}" style="display: inline-block; background-color: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Your Preview Website</a></p>

            <p>If you have any questions or would like to discuss how we can help your business grow online, please don't hesitate to reach out.</p>

            <p>Best regards,<br>The ScrapePro Team</p>

            {{tracking.pixel}}
          </div>
        `,
        category: 'follow_up',
        variables: [
          { name: 'business.name', defaultValue: 'Your Business' },
          { name: 'preview.link', defaultValue: 'https://example.com/preview' }
        ],
        createdBy: adminUser._id,
        isActive: true,
        usage: {
          sentCount: 0,
          openRate: 0,
          responseRate: 0
        }
      }
    ];

    // Create templates
    await EmailTemplate.create(templates);
    console.log(`${templates.length} email templates created`);
  } catch (error) {
    console.error('Error seeding email templates:', error);
    throw error;
  }
};

// Seed businesses
const seedBusinesses = async (adminUser, clearExisting = false) => {
  try {
    // Clear existing businesses if requested
    if (clearExisting) {
      console.log('Clearing existing businesses...');
      await Business.deleteMany({});
      console.log('All businesses removed');
    }

    // Check if businesses already exist
    const businessCount = await Business.countDocuments();
    if (businessCount > 0) {
      console.log(`${businessCount} businesses already exist. Skipping business creation.`);
      return await Business.find();
    }

    // Business data
    const businesses = [
      {
        name: 'Tech Innovations',
        address: {
          street: '123 Tech Boulevard',
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
          email: 'contact@techinnovations.fr',
          website: 'https://techinnovations.fr'
        },
        business: {
          type: 'Technology',
          nafCode: '6201Z',
          siret: '12345678901234',
          siren: '123456789'
        },
        socialMedia: {
          facebook: 'https://facebook.com/techinnovations',
          linkedin: 'https://linkedin.com/company/techinnovations',
          twitter: 'https://twitter.com/techinnovations'
        },
        websiteGeneration: {
          status: 'generated',
          previewUrl: 'https://preview.techinnovations.scrapepro.com',
          generatedAt: new Date()
        },
        emailOutreach: {
          status: 'sent',
          lastContactedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
        },
        scrapingData: {
          source: 'google_maps',
          scrapedBy: adminUser._id,
          scrapedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        },
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
      },
      {
        name: 'Café Parisien',
        address: {
          street: '45 Rue de Rivoli',
          city: 'Paris',
          postalCode: '75004',
          country: 'France',
          coordinates: {
            lat: 48.8561,
            lng: 2.3522
          }
        },
        contact: {
          phone: '+33 1 98 76 54 32',
          email: 'bonjour@cafeparisien.fr',
          website: 'https://cafeparisien.fr'
        },
        business: {
          type: 'Restaurant',
          nafCode: '5610A',
          siret: '98765432109876',
          siren: '987654321'
        },
        socialMedia: {
          facebook: 'https://facebook.com/cafeparisien',
          instagram: 'https://instagram.com/cafeparisien'
        },
        websiteGeneration: {
          status: 'pending'
        },
        emailOutreach: {
          status: 'not_sent'
        },
        scrapingData: {
          source: 'google_maps',
          scrapedBy: adminUser._id,
          scrapedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        },
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      },
      {
        name: 'Lyon Digital Solutions',
        address: {
          street: '78 Avenue Jean Jaurès',
          city: 'Lyon',
          postalCode: '69007',
          country: 'France',
          coordinates: {
            lat: 45.7578,
            lng: 4.8320
          }
        },
        contact: {
          phone: '+33 4 56 78 90 12',
          email: 'info@lyondigital.fr',
          website: 'https://lyondigital.fr'
        },
        business: {
          type: 'Digital Agency',
          nafCode: '7021Z',
          siret: '45678901234567',
          siren: '456789012'
        },
        socialMedia: {
          linkedin: 'https://linkedin.com/company/lyondigital',
          twitter: 'https://twitter.com/lyondigital'
        },
        websiteGeneration: {
          status: 'generated',
          previewUrl: 'https://preview.lyondigital.scrapepro.com',
          generatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
        },
        emailOutreach: {
          status: 'opened',
          lastContactedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
        },
        scrapingData: {
          source: 'other',
          scrapedBy: adminUser._id,
          scrapedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        },
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
      },
      {
        name: 'Marseille Shipping Co.',
        address: {
          street: '23 Quai des Belges',
          city: 'Marseille',
          postalCode: '13001',
          country: 'France',
          coordinates: {
            lat: 43.2965,
            lng: 5.3698
          }
        },
        contact: {
          phone: '+33 4 91 23 45 67',
          email: 'contact@marseilleshipping.fr',
          website: 'https://marseilleshipping.fr'
        },
        business: {
          type: 'Logistics',
          nafCode: '5020Z',
          siret: '56789012345678',
          siren: '567890123'
        },
        socialMedia: {
          linkedin: 'https://linkedin.com/company/marseilleshipping'
        },
        websiteGeneration: {
          status: 'generated',
          previewUrl: 'https://preview.marseilleshipping.scrapepro.com',
          generatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) // 4 days ago
        },
        emailOutreach: {
          status: 'opened',
          lastContactedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
          openedAt: new Date(Date.now() - 3.5 * 24 * 60 * 60 * 1000)
        },
        scrapingData: {
          source: 'other',
          scrapedBy: adminUser._id,
          scrapedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
        },
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) // 10 days ago
      },
      {
        name: 'Bordeaux Wines',
        address: {
          street: '15 Cours du Médoc',
          city: 'Bordeaux',
          postalCode: '33300',
          country: 'France',
          coordinates: {
            lat: 44.8378,
            lng: -0.5792
          }
        },
        contact: {
          phone: '+33 5 56 78 90 12',
          email: 'contact@bordeauxwines.fr',
          website: 'https://bordeauxwines.fr'
        },
        business: {
          type: 'Wine Producer',
          nafCode: '1102B',
          siret: '67890123456789',
          siren: '678901234'
        },
        socialMedia: {
          facebook: 'https://facebook.com/bordeauxwines',
          instagram: 'https://instagram.com/bordeauxwines'
        },
        websiteGeneration: {
          status: 'generated',
          previewUrl: 'https://preview.bordeauxwines.scrapepro.com',
          generatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) // 6 days ago
        },
        emailOutreach: {
          status: 'responded',
          lastContactedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) // 6 days ago
        },
        scrapingData: {
          source: 'google_maps',
          scrapedBy: adminUser._id,
          scrapedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
        },
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) // 15 days ago
      }
    ];

    // Create businesses
    const createdBusinesses = await Business.create(businesses);
    console.log(`${createdBusinesses.length} businesses created`);
    return createdBusinesses;
  } catch (error) {
    console.error('Error seeding businesses:', error);
    throw error;
  }
};

// Seed scraping jobs
const seedScrapingJobs = async (adminUser, clearExisting = false) => {
  try {
    // Clear existing scraping jobs if requested
    if (clearExisting) {
      console.log('Clearing existing scraping jobs...');
      await ScrapingJob.deleteMany({});
      console.log('All scraping jobs removed');
    }

    // Check if scraping jobs already exist
    const jobCount = await ScrapingJob.countDocuments();
    if (jobCount > 0) {
      console.log(`${jobCount} scraping jobs already exist. Skipping job creation.`);
      return;
    }

    // Scraping job data
    const scrapingJobs = [
      {
        name: 'Paris Tech Companies',
        description: 'Scraping tech companies in Paris area',
        user: adminUser._id,
        status: 'completed',
        source: 'google_maps',
        sourceUrl: 'https://www.google.com/maps',
        searchTerms: ['tech company', 'software', 'digital agency'],
        locations: ['Paris', 'Île-de-France'],
        filters: {
          radius: 50,
          minRating: 4.0
        },
        configuration: {
          maxResults: 100,
          includeContact: true,
          includeWebsite: true
        },
        progress: 100,
        startedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
        completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        resultsCount: 42,
        logs: [
          {
            timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
            level: 'info',
            message: 'Scraping job started'
          },
          {
            timestamp: new Date(Date.now() - 7.5 * 24 * 60 * 60 * 1000),
            level: 'info',
            message: 'Found 42 results'
          },
          {
            timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            level: 'info',
            message: 'Scraping job completed successfully'
          }
        ]
      },
      {
        name: 'Lyon Restaurants',
        description: 'Scraping restaurants in Lyon',
        user: adminUser._id,
        status: 'in_progress',
        source: 'google_maps',
        sourceUrl: 'https://www.google.com/maps',
        searchTerms: ['restaurant', 'café', 'bistro'],
        locations: ['Lyon', 'Rhône-Alpes'],
        filters: {
          radius: 30,
          minRating: 4.2
        },
        configuration: {
          maxResults: 150,
          includeContact: true,
          includeWebsite: true
        },
        progress: 65,
        startedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        resultsCount: 98,
        logs: [
          {
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            level: 'info',
            message: 'Scraping job started'
          },
          {
            timestamp: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000),
            level: 'info',
            message: 'Found 98 results so far'
          }
        ]
      },
      {
        name: 'Bordeaux Wineries',
        description: 'Scraping wineries in Bordeaux region',
        user: adminUser._id,
        status: 'pending',
        source: 'website',
        sourceUrl: 'https://www.bordeaux-tourism.co.uk/Discover-Bordeaux/Bordeaux-wine-country',
        searchTerms: ['winery', 'vineyard', 'wine producer'],
        locations: ['Bordeaux', 'Aquitaine'],
        filters: {
          includeSubregions: true
        },
        configuration: {
          maxResults: 200,
          includeContact: true,
          includeWebsite: true,
          includeSocialMedia: true
        },
        schedule: {
          frequency: 'once',
          startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days in the future
        }
      },
      {
        name: 'Marseille Maritime Companies',
        description: 'Scraping maritime and shipping companies in Marseille',
        user: adminUser._id,
        status: 'failed',
        source: 'linkedin',
        sourceUrl: 'https://www.linkedin.com/search/results/companies/',
        searchTerms: ['maritime', 'shipping', 'logistics'],
        locations: ['Marseille', 'Provence-Alpes-Côte d\'Azur'],
        filters: {
          companySize: ['11-50', '51-200', '201-500']
        },
        configuration: {
          maxResults: 50,
          includeContact: true,
          includeWebsite: true
        },
        progress: 30,
        startedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        resultsCount: 15,
        logs: [
          {
            timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            level: 'info',
            message: 'Scraping job started'
          },
          {
            timestamp: new Date(Date.now() - 4.8 * 24 * 60 * 60 * 1000),
            level: 'info',
            message: 'Found 15 results'
          },
          {
            timestamp: new Date(Date.now() - 4.5 * 24 * 60 * 60 * 1000),
            level: 'error',
            message: 'LinkedIn rate limit exceeded'
          },
          {
            timestamp: new Date(Date.now() - 4.5 * 24 * 60 * 60 * 1000),
            level: 'error',
            message: 'Scraping job failed'
          }
        ]
      }
    ];

    // Create scraping jobs
    await ScrapingJob.create(scrapingJobs);
    console.log(`${scrapingJobs.length} scraping jobs created`);
  } catch (error) {
    console.error('Error seeding scraping jobs:', error);
    throw error;
  }
};

// Seed emails
const seedEmails = async (adminUser, businesses, clearExisting = false) => {
  try {
    // Clear existing emails if requested
    if (clearExisting) {
      console.log('Clearing existing emails...');
      await Email.deleteMany({});
      console.log('All emails removed');
    }

    // Check if emails already exist
    const emailCount = await Email.countDocuments();
    if (emailCount > 0) {
      console.log(`${emailCount} emails already exist. Skipping email creation.`);
      return;
    }

    // Get email templates
    const templates = await EmailTemplate.find();
    if (templates.length === 0) {
      console.log('No email templates found. Skipping email creation.');
      return;
    }

    // Email data
    const emails = [];

    // Create emails for each business
    for (const business of businesses) {
      // Introduction email
      emails.push({
        subject: `Introducing our services to ${business.name}`,
        body: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Hello ${business.name},</h2>
          <p>We noticed your business in ${business.address.city} and wanted to reach out with an exciting opportunity.</p>
          <p>We've created a preview website for your business that showcases your services in a modern, professional way. You can view it here:</p>
          <p><a href="${business.websiteGeneration?.previewUrl || 'https://example.com/preview'}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Your Preview Website</a></p>
          <p>This is just a sample of what we can do for your business. If you're interested in learning more, please reply to this email or call us at (555) 123-4567.</p>
          <p>Best regards,<br>The ScrapePro Team</p>
          <img src="https://example.com/tracking/pixel.png" width="1" height="1" style="display: none;">
        </div>`,
        recipient: business.contact.email,
        sender: 'marketing@scrapepro.com',
        user: adminUser._id,
        sentAt: new Date(Date.now() - (Math.floor(Math.random() * 20) + 1) * 24 * 60 * 60 * 1000),
        isOpened: Math.random() > 0.5,
        openedAt: Math.random() > 0.5 ? new Date(Date.now() - (Math.floor(Math.random() * 10) + 1) * 24 * 60 * 60 * 1000) : null,
        isClicked: Math.random() > 0.7,
        clickedAt: Math.random() > 0.7 ? new Date(Date.now() - (Math.floor(Math.random() * 5) + 1) * 24 * 60 * 60 * 1000) : null,
        status: 'sent'
      });

      // Follow-up email for some businesses
      if (Math.random() > 0.5) {
        emails.push({
          subject: `Following up on our website preview for ${business.name}`,
          body: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Hello again from ScrapePro,</h2>
            <p>We recently sent you a preview of a website we created for ${business.name}. We wanted to follow up and see if you had a chance to take a look.</p>
            <p>You can view your preview website here:</p>
            <p><a href="${business.websiteGeneration?.previewUrl || 'https://example.com/preview'}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Your Preview Website</a></p>
            <p>If you have any questions or would like to discuss how we can help your business grow online, please don't hesitate to reach out.</p>
            <p>Best regards,<br>The ScrapePro Team</p>
            <img src="https://example.com/tracking/pixel.png" width="1" height="1" style="display: none;">
          </div>`,
          recipient: business.contact.email,
          sender: 'marketing@scrapepro.com',
          user: adminUser._id,
          sentAt: new Date(Date.now() - (Math.floor(Math.random() * 10) + 1) * 24 * 60 * 60 * 1000),
          isOpened: Math.random() > 0.6,
          openedAt: Math.random() > 0.6 ? new Date(Date.now() - (Math.floor(Math.random() * 5) + 1) * 24 * 60 * 60 * 1000) : null,
          isClicked: Math.random() > 0.8,
          clickedAt: Math.random() > 0.8 ? new Date(Date.now() - (Math.floor(Math.random() * 3) + 1) * 24 * 60 * 60 * 1000) : null,
          status: 'sent'
        });
      }
    }

    // Create emails
    await Email.create(emails);
    console.log(`${emails.length} emails created`);
  } catch (error) {
    console.error('Error seeding emails:', error);
    throw error;
  }
};

// Main seeder function
const seedDev = async () => {
  try {
    const clearExisting = process.argv.includes('--clear');

    // Connect to database
    await connectDB();

    // Seed users
    const adminUser = await seedDevUsers(clearExisting);

    // Seed email templates
    await seedEmailTemplates(adminUser, clearExisting);

    // Seed businesses
    const businesses = await seedBusinesses(adminUser, clearExisting);

    // Seed scraping jobs
    await seedScrapingJobs(adminUser, clearExisting);

    // Seed emails
    await seedEmails(adminUser, businesses, clearExisting);

    console.log('\nDevelopment seed completed successfully!');
    await closeDatabase();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding development data:', error);
    process.exit(1);
  }
};

// Run seeder
seedDev();