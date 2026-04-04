const offerService = require("../services/offerService");
const { asyncHandler } = require("../utils/asyncHandler");

// -------------------------
// Offres (vue publique)
// -------------------------

exports.listOffersPublic = asyncHandler(async (req, res) => {
  const status = req.query.status;
  const location = req.query.location;
  const skills = req.query.skills ? req.query.skills.split(',') : null;
  const limit = req.query.limit ? Number(req.query.limit) : 50;
  const offset = req.query.offset ? Number(req.query.offset) : 0;

  const offers = await offerService.listOffersPublic({ 
    status, 
    location, 
    skills, 
    limit, 
    offset 
  });
  
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

// -------------------------
// CRUD Offre
// -------------------------

// Créer une offre (mode test).
exports.createOffer = asyncHandler(async (req, res) => {
  // Mode test: utiliser un ID par défaut si req.user n'existe pas
  const ownerUserId = req.user?.id || "test-user-id";

  const offer = await offerService.createOffer({
    ownerUserId,
    data: req.body
  });

  res.status(201).json({ offer });
});

// Mettre à jour une offre (mode test).
exports.updateOffer = asyncHandler(async (req, res) => {
  const { offerId } = req.params;
  // Mode test: utiliser un ID par défaut si req.user n'existe pas
  const ownerUserId = req.user?.id || "test-user-id";

  const offer = await offerService.updateOffer({
    offerId,
    ownerUserId,
    data: req.body
  });

  res.json({ offer });
});

// Supprimer une offre (mode test).
exports.deleteOffer = asyncHandler(async (req, res) => {
  const { offerId } = req.params;
  // Mode test: utiliser un ID par défaut si req.user n'existe pas
  const ownerUserId = req.user?.id || "test-user-id";

  await offerService.deleteOffer({ offerId, ownerUserId });
  res.json({ message: "Offre supprimée." });
});

// -------------------------
// Offres par entreprise
// -------------------------

// Lister les offres d'une entreprise (lecture publique).
exports.listOffersForEnterprise = asyncHandler(async (req, res) => {
  const { enterpriseId } = req.params;

  const offers = await offerService.listOffersForEnterprise({ enterpriseId });
  res.json({ offers });
});
