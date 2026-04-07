const express = require("express");
const router = express.Router();

const enterpriseRoutes = require("./EnterpriseRoutes");
const offerRoutes = require("./OfferRoutes");

// Routes liées aux entreprises (CRUD + offres + gestion des candidatures).
router.use("/entreprises", enterpriseRoutes);

// Routes liées aux offres publiques et aux routes d'entreprise.
router.use("/", offerRoutes);

module.exports = router;

