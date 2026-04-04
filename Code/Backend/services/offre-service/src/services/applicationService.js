const { Application, Offer } = require("../Models");

// Créer une candidature.
async function createApplication({ offerId, studentUserId, data }) {
  // Vérifier que l'offre existe
  const offer = await Offer.findByPk(offerId);
  if (!offer) {
    const err = new Error("Offre introuvable.");
    err.statusCode = 404;
    throw err;
  }

  // Vérifier que l'étudiant n'a pas déjà postulé
  const existingApplication = await Application.findOne({
    where: {
      offerId,
      studentUserId,
    },
  });

  if (existingApplication) {
    const err = new Error("Vous avez déjà postulé à cette offre.");
    err.statusCode = 400;
    throw err;
  }

  const application = await Application.create({
    offerId,
    studentUserId,
    coverLetter: data.coverLetter || "",
    status: "pending",
  });

  return application;
}

// Récupérer une candidature.
async function getApplication({ applicationId }) {
  return Application.findByPk(applicationId, {
    include: [
      {
        model: Offer,
        as: "offer",
        attributes: ["id", "title", "enterpriseId"],
      },
    ],
  });
}

// Mettre à jour le statut d'une candidature.
async function updateApplicationStatus({ applicationId, status }) {
  const application = await Application.findByPk(applicationId);
  if (!application) {
    const err = new Error("Candidature introuvable.");
    err.statusCode = 404;
    throw err;
  }

  application.status = status;
  await application.save();
  return application;
}

// Lister les candidatures pour une offre.
async function listApplicationsForOffer({ offerId }) {
  return Application.findAll({
    where: { offerId },
    include: [
      {
        model: Offer,
        as: "offer",
        attributes: ["id", "title", "enterpriseId"],
      },
    ],
    order: [["created_at", "DESC"]],
  });
}

// Lister toutes les candidatures d'un étudiant.
async function listApplicationsForStudent({ studentUserId }) {
  return Application.findAll({
    where: { studentUserId },
    include: [
      {
        model: Offer,
        as: "offer",
        attributes: ["id", "title", "enterpriseId", "status"],
      },
    ],
    order: [["created_at", "DESC"]],
  });
}

module.exports = {
  createApplication,
  getApplication,
  updateApplicationStatus,
  listApplicationsForOffer,
  listApplicationsForStudent,
};
