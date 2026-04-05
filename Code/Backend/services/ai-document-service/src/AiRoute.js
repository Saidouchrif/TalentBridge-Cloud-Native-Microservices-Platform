const express = require('express');
const router = express.Router();
const AiController = require('../Controllers/AiController');

// Endpoint pour améliorer un texte existant
router.post('/improve', AiController.improveText);

module.exports = router;