const applicationService = require("../services/applicationService");
const { asyncHandler } = require("../utils/asyncHandler");

// Candidature d'un étudiant à une offre.
exports.applyToOffer = asyncHandler(async (req, res) => {
  const { offerId } = req.params;

  // Pour les tests, on utilise l'ID du token JWT ou un ID par défaut
  const studentUserId = req.user?.id || "test-student-id";

  const application = await applicationService.applyToOffer({ offerId, studentUserId });

  res.status(201).json({ application });
});

// Liste des candidatures (toutes) pour les offres d'une entreprise.

exports.listApplicationsForEnterprise = asyncHandler(async (req, res) => {
  const { enterpriseId } = req.params;
  const ownerUserId = req.user?.id || "test-user-id";

  const applications = await applicationService.listApplicationsForEnterprise({
    enterpriseId,
    ownerUserId
  });

  res.json({ applications });
});

// Mise à jour du statut d'une candidature (acceptée / rejetée).
exports.updateApplicationStatus = asyncHandler(async (req, res) => {
  const { enterpriseId, applicationId } = req.params;
  const ownerUserId = req.user?.id || "test-user-id";

  const { status } = req.body;
  const application = await applicationService.updateApplicationStatus({
    enterpriseId,
    applicationId,
    ownerUserId,
    status
  });

  res.json({ application });
});

