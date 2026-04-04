const express = require("express");

const { requireAuth } = require("../middlewares/requireAuth");

const offerController = require("../Controllers/offerController");
const applicationController = require("../Controllers/applicationController");

const router = express.Router();

// -------------------------
// Offres (vue publique)
// -------------------------

// Lister les offres publiées (avec filtres).
router.get("/", offerController.listOffersPublic);

// Récupérer une offre par id (lecture publique).
router.get("/:offerId", offerController.getOfferPublic);

// -------------------------
// CRUD Offre
// -------------------------

// Créer une offre (mode test avec middleware).
router.post("/", requireAuth, offerController.createOffer);

// Mettre à jour une offre (mode test avec middleware).
router.put("/:offerId", requireAuth, offerController.updateOffer);

// Supprimer une offre (mode test avec middleware).
router.delete("/:offerId", requireAuth, offerController.deleteOffer);

// -------------------------
// Offres par entreprise
// -------------------------

// Lister les offres d'une entreprise (lecture publique).
router.get("/enterprise/:enterpriseId", offerController.listOffersForEnterprise);

// -------------------------
// Candidatures
// -------------------------

// Un étudiant candidate à une offre (mode test avec middleware).
router.post("/:offerId/applications", requireAuth, applicationController.applyToOffer);

// Lister les candidatures d'une offre (mode test avec middleware).
router.get("/:offerId/applications", requireAuth, applicationController.listApplicationsForOffer);

// Mettre à jour le statut d'une candidature (mode test avec middleware).
router.patch("/applications/:applicationId", requireAuth, applicationController.updateApplicationStatus);

// Lister les candidatures d'un étudiant (mode test avec middleware).
router.get("/student/:studentUserId/applications", requireAuth, applicationController.listApplicationsForStudent);

module.exports = router;
