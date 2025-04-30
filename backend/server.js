const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

// Initialiser l'application Express
const app = express();

// Configuration CORS
const corsOptions = {
  origin: 'http://localhost:5173', // L'origine de votre frontend
  credentials: true, // Permettre l'envoi de cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan('dev'));

// Routes
const googlePlacesProxy = require('./src/routes/googlePlacesProxy');

// Définir les routes
app.use('/api/google-places', googlePlacesProxy);

// Route par défaut
app.get('/', (req, res) => {
  res.json({
    message: 'API Google Places Proxy Server'
  });
});

// Gestion des erreurs 404
app.use((req, res, next) => {
  res.status(404).json({
    error: 'Route not found'
  });
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: err.message || 'Something went wrong!'
  });
});

// Définir le port
const PORT = process.env.PORT || 3000;

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
