const enterpriseService = require("../services/enterpriseService");
const { asyncHandler } = require("../utils/asyncHandler");

// Lister les entreprises (lecture publique).
exports.listEnterprisesPublic = asyncHandler(async (req, res) => {
  const limit = req.query.limit ? Number(req.query.limit) : 50;
  const offset = req.query.offset ? Number(req.query.offset) : 0;

  const enterprises = await enterpriseService.listEnterprisesPublic({ limit, offset });

  res.json({ enterprises });
});

// Récupérer une entreprise (lecture publique).
exports.getEnterprisePublic = asyncHandler(async (req, res) => {
  const { enterpriseId } = req.params;
  const enterprise = await enterpriseService.getEnterprisePublic({ enterpriseId });

  if (!enterprise) {
    return res.status(404).json({ message: "Entreprise introuvable." });
  }

  res.json({ enterprise });
});

// Créer une entreprise (mode test - pas de JWT requis).
exports.createEnterprise = asyncHandler(async (req, res) => {
  // Mode test: utiliser un ID par défaut si req.user n'existe pas
  const ownerUserId = req.user?.id || "test-user-id";

  const enterprise = await enterpriseService.createEnterprise({
    ownerUserId,
    data: req.body
  });

  res.status(201).json({ enterprise });
});

// Mettre à jour une entreprise (mode test).
exports.updateEnterprise = asyncHandler(async (req, res) => {
  const { enterpriseId } = req.params;
  // Mode test: utiliser un ID par défaut si req.user n'existe pas
  const ownerUserId = req.user?.id || "test-user-id";

  const enterprise = await enterpriseService.updateEnterprise({
    enterpriseId,
    ownerUserId,
    data: req.body
  });

  res.json({ enterprise });
});

// Supprimer une entreprise (mode test).
exports.deleteEnterprise = asyncHandler(async (req, res) => {
  const { enterpriseId } = req.params;
  // Mode test: utiliser un ID par défaut si req.user n'existe pas
  const ownerUserId = req.user?.id || "test-user-id";

  await enterpriseService.deleteEnterprise({ enterpriseId, ownerUserId });
  res.json({ message: "Entreprise supprimée." });
});

