const express = require('express');
const router = express.Router();
const AiController = require('../Controllers/AiController');

// Endpoint pour améliorer un texte existant
router.post('/improve', AiController.improveText);

// Endpoint pour générer un document depuis zéro
router.post('/generate', AiController.generateDocument);

module.exports = router;