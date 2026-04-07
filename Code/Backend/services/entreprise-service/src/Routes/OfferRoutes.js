const express = require("express");

const { requireAuth } = require("../middlewares/requireAuth");

const offerController = require("../Controllers/offerController");
const applicationController = require("../Controllers/applicationController");

const router = express.Router();

// -------------------------
// Offres liées à une entreprise
// -------------------------

router.get(
  "/entreprises/:enterpriseId/offers",
  offerController.listOffersForEnterprisePublic
);

router.post(
  "/entreprises/:enterpriseId/offers",
  requireAuth,
  offerController.createOfferForEnterprise
);

router.put(
  "/entreprises/:enterpriseId/offers/:offerId",
  requireAuth,
  offerController.updateOfferForEnterprise
);

router.delete(
  "/entreprises/:enterpriseId/offers/:offerId",
  requireAuth,
  offerController.deleteOfferForEnterprise
);

router.get(
  "/entreprises/:enterpriseId/applications",
  requireAuth,
  applicationController.listApplicationsForEnterprise
);

router.patch(
  "/entreprises/:enterpriseId/applications/:applicationId",
  requireAuth,
  applicationController.updateApplicationStatus
);

// -------------------------
// Offres publiques
// -------------------------

router.get("/offers", offerController.listOffersPublic);
router.get("/offers/:offerId", offerController.getOfferPublic);
router.post(
  "/offers/:offerId/applications",
  requireAuth,
  applicationController.applyToOffer
);

module.exports = router;

