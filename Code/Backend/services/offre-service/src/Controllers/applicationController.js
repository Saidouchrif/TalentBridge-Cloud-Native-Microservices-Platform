const applicationService = require("../services/applicationService");
const { asyncHandler } = require("../utils/asyncHandler");

// -------------------------
// Candidatures
// -------------------------

// Un étudiant candidate à une offre.
exports.applyToOffer = asyncHandler(async (req, res) => {
  const { offerId } = req.params;
  // Mode test: utiliser un ID par défaut si req.user n'existe pas
  const studentUserId = req.user?.id || "test-student-id";

  const application = await applicationService.createApplication({
    offerId,
    studentUserId,
    data: req.body
  });

  res.status(201).json({ application });
});

// Lister les candidatures d'une offre.
exports.listApplicationsForOffer = asyncHandler(async (req, res) => {
  const { offerId } = req.params;

  const applications = await applicationService.listApplicationsForOffer({ offerId });
  res.json({ applications });
});

// Mettre à jour le statut d'une candidature.
exports.updateApplicationStatus = asyncHandler(async (req, res) => {
  const { applicationId } = req.params;
  const { status } = req.body;

  const application = await applicationService.updateApplicationStatus({
    applicationId,
    status
  });

  res.json({ application });
});

// Lister les candidatures d'un étudiant.
exports.listApplicationsForStudent = asyncHandler(async (req, res) => {
  // Mode test: utiliser un ID par défaut si req.user n'existe pas
  const studentUserId = req.user?.id || "test-student-id";

  const applications = await applicationService.listApplicationsForStudent({ studentUserId });
  res.json({ applications });
});
