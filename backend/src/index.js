const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { connectDB } = require('./config/database');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// CORS configuration
app.use(cors({
  origin: '*', // Allow all origins during development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const scrapingRoutes = require('./routes/scraping');
const businessRoutes = require('./routes/businesses');
const emailRoutes = require('./routes/emails');
const analyticsRoutes = require('./routes/analytics');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/scraping', scrapingRoutes);
app.use('/api/businesses', businessRoutes);
app.use('/api/emails', emailRoutes);
app.use('/api/analytics', analyticsRoutes);

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../frontend/dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../frontend/dist/index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ error: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await connectDB();

  // Check for users in development mode
  if (process.env.NODE_ENV === 'development') {
    try {
      const User = require('./models/User');
      const userCount = await User.countDocuments();

      if (userCount === 0) {
        console.log('\x1b[33m%s\x1b[0m', '⚠️  No users found in the database!');
        console.log('\x1b[33m%s\x1b[0m', '   Run the following command to create development users:');
        console.log('\x1b[36m%s\x1b[0m', '   npm run seed:dev');
        console.log('\x1b[0m');
      } else {
        console.log(`Found ${userCount} users in the database`);
      }
    } catch (error) {
      console.error('Error checking users:', error.message);
    }
  }
});

module.exports = app;