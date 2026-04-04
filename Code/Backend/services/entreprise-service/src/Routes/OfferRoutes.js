const express = require("express");

const { requireAuth } = require("../middlewares/requireAuth");

const offerController = require("../Controllers/offerController");
const applicationController = require("../Controllers/applicationController");

const router = express.Router();

// -------------------------
// Lecture publique des offres
// -------------------------

// Lister les offres publiées (optionnellement filtrables via query params).
router.get("/", offerController.listOffersPublic);

// Récupérer une offre par id (lecture publique).
router.get("/:offerId", offerController.getOfferPublic);

// -------------------------
// Candidature d'un étudiant
// -------------------------

// Un étudiant candidate à une offre.
// Endpoint avec middleware pour tests.
router.post(
  "/:offerId/applications",
  requireAuth,
  applicationController.applyToOffer
);

module.exports = router;

