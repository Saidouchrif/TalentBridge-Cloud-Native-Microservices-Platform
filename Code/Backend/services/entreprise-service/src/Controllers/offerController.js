const offerService = require("../services/offerService");
const { asyncHandler } = require("../utils/asyncHandler");

// -------------------------
// Offres d'une entreprise
// -------------------------

// Lister les offres d'une entreprise (lecture publique).
exports.listOffersForEnterprisePublic = asyncHandler(async (req, res) => {
  const { enterpriseId } = req.params;

  const offers = await offerService.listOffersForEnterprisePublic({ enterpriseId });
  res.json({ offers });
});

// Créer une offre pour une entreprise (mode test).
exports.createOfferForEnterprise = asyncHandler(async (req, res) => {
  const { enterpriseId } = req.params;
  // Mode test: utiliser un ID par défaut si req.user n'existe pas
  const ownerUserId = req.user?.id || "test-user-id";

  const offer = await offerService.createOfferForEnterprise({
    enterpriseId,
    ownerUserId,
    data: req.body
  });

  res.status(201).json({ offer });
});

// Mettre à jour une offre (mode test).
exports.updateOfferForEnterprise = asyncHandler(async (req, res) => {
  const { enterpriseId, offerId } = req.params;
  // Mode test: utiliser un ID par défaut si req.user n'existe pas
  const ownerUserId = req.user?.id || "test-user-id";

  const offer = await offerService.updateOfferForEnterprise({
    enterpriseId,
    offerId,
    ownerUserId,
    data: req.body
  });

  res.json({ offer });
});

// Supprimer une offre (mode test).
exports.deleteOfferForEnterprise = asyncHandler(async (req, res) => {
  const { enterpriseId, offerId } = req.params;
  // Mode test: utiliser un ID par défaut si req.user n'existe pas
  const ownerUserId = req.user?.id || "test-user-id";

  await offerService.deleteOfferForEnterprise({ enterpriseId, offerId, ownerUserId });
  res.json({ message: "Offre supprimée." });
});

// -------------------------
// Offres (vue publique)
// -------------------------

exports.listOffersPublic = asyncHandler(async (req, res) => {
  const status = req.query.status;
  const limit = req.query.limit ? Number(req.query.limit) : 50;
  const offset = req.query.offset ? Number(req.query.offset) : 0;

  const offers = await offerService.listOffersPublic({ status, limit, offset });
  res.json({ offers });
});

exports.getOfferPublic = asyncHandler(async (req, res) => {
  const { offerId } = req.params;
  const offer = await offerService.getOfferPublic({ offerId });

  if (!offer) {
    return res.status(404).json({ message: "Offre introuvable." });
  }

  res.json({ offer });
});

