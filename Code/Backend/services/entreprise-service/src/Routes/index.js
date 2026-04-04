const express = require("express");
const router = express.Router();

const enterpriseRoutes = require("./EnterpriseRoutes");
const offerRoutes = require("./OfferRoutes");

// Routes liées aux entreprises (CRUD + offres + gestion des candidatures).
router.use("/entreprises", enterpriseRoutes);

// Routes liées aux offres (lecture publique + candidature d'un étudiant).
router.use("/offers", offerRoutes);

module.exports = router;

