const { Enterprise, Offer, Application } = require("../Models");

// Vérifie que l'entreprise correspond et qu'elle appartient au propriétaire connecté.
async function getOwnedEnterpriseOrFail({ enterpriseId, ownerUserId }) {
  const enterprise = await Enterprise.findByPk(enterpriseId);
  if (!enterprise) {
    const err = new Error("Entreprise introuvable.");
    err.statusCode = 404;
    throw err;
  }

  if (enterprise.ownerUserId !== ownerUserId) {
    const err = new Error("Accès refusé: vous n'êtes pas propriétaire de cette entreprise.");
    err.statusCode = 403;
    throw err;
  }

  return enterprise;
}

async function applyToOffer({ offerId, studentUserId }) {
  if (!offerId) {
    const err = new Error("offerId manquant.");
    err.statusCode = 400;
    throw err;
  }
  if (!studentUserId) {
    const err = new Error("studentUserId manquant.");
    err.statusCode = 400;
    throw err;
  }

  const offer = await Offer.findByPk(offerId);
  if (!offer) {
    const err = new Error("Offre introuvable.");
    err.statusCode = 404;
    throw err;
  }

  // Un étudiant ne peut postuler qu'une seule fois à la même offre.
  // (La contrainte unique au niveau DB aide à garantir cette règle.)
  const existing = await Application.findOne({
    where: { offerId, studentUserId }
  });

  if (existing) {
    const err = new Error("Vous avez déjà candidaté à cette offre.");
    err.statusCode = 400;
    throw err;
  }

  const application = await Application.create({
    offerId: offer.id,
    studentUserId,
    status: "pending"
  });

  return application;
}

async function listApplicationsForEnterprise({ enterpriseId, ownerUserId }) {
  // On vérifie d'abord que l'utilisateur connecté est le propriétaire de l'entreprise.
  await getOwnedEnterpriseOrFail({ enterpriseId, ownerUserId });

  // Jointure vers l'offre afin de filtrer par enterpriseId.
  return Application.findAll({
    include: [
      {
        model: Offer,
        as: "offer",
        where: { enterpriseId }
      }
    ],
    order: [["created_at", "DESC"]]
  });
}

async function updateApplicationStatus({ enterpriseId, applicationId, ownerUserId, status }) {
  const enterprise = await getOwnedEnterpriseOrFail({ enterpriseId, ownerUserId });
  // La variable `enterprise` n'est utilisée que pour valider l'accès.
  // On récupère l'application avec sa relation offre.

  const application = await Application.findByPk(applicationId, {
    include: [
      {
        model: Offer,
        as: "offer",
        where: { enterpriseId }
      }
    ]
  });

  if (!application) {
    const err = new Error("Candidature introuvable pour cette entreprise.");
    err.statusCode = 404;
    throw err;
  }

  const validStatuses = ["pending", "accepted", "rejected"];
  if (!validStatuses.includes(status)) {
    const err = new Error(`Statut invalide. Valeurs autorisées: ${validStatuses.join(", ")}`);
    err.statusCode = 400;
    throw err;
  }

  application.status = status;
  await application.save();
  return application;
}

module.exports = {
  applyToOffer,
  listApplicationsForEnterprise,
  updateApplicationStatus
};

