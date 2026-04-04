const { Enterprise, Offer, Application } = require("../Models");

const VALID_OFFER_STATUS = ["published", "closed", "draft"];

function normalizeStatus(status) {
  if (!status) return "published";
  return status;
}

// Vérifie que l'offre appartient bien à l'entreprise du propriétaire.
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

async function assertOwnedOfferOrFail({ enterpriseId, offerId, ownerUserId }) {
  const enterprise = await getOwnedEnterpriseOrFail({ enterpriseId, ownerUserId });
  // L'entité `enterprise` est juste utilisée pour valider l'accès.
  const offer = await Offer.findOne({ where: { id: offerId, enterpriseId: enterprise.id } });
  if (!offer) {
    const err = new Error("Offre introuvable pour cette entreprise.");
    err.statusCode = 404;
    throw err;
  }
  return offer;
}

async function createOfferForEnterprise({ enterpriseId, ownerUserId, data }) {
  const enterprise = await getOwnedEnterpriseOrFail({ enterpriseId, ownerUserId });

  if (!data.title || typeof data.title !== "string" || data.title.trim().length === 0) {
    const err = new Error('Le champ "title" est requis.');
    err.statusCode = 400;
    throw err;
  }

  const status = normalizeStatus(data.status);
  if (!VALID_OFFER_STATUS.includes(status)) {
    const err = new Error(`Statut d'offre invalide. Valeurs autorisées: ${VALID_OFFER_STATUS.join(", ")}`);
    err.statusCode = 400;
    throw err;
  }

  const publishedAt = status === "published" ? new Date() : null;

  const offer = await Offer.create({
    enterpriseId: enterprise.id,
    title: data.title,
    description: data.description,
    requiredSkills: data.requiredSkills,
    location: data.location,
    status,
    publishedAt
  });

  return offer;
}

async function updateOfferForEnterprise({ enterpriseId, offerId, ownerUserId, data }) {
  const offer = await assertOwnedOfferOrFail({ enterpriseId, offerId, ownerUserId });

  if (data.title !== undefined) {
    if (typeof data.title !== "string" || data.title.trim().length === 0) {
      const err = new Error('Le champ "title" ne peut pas être vide.');
      err.statusCode = 400;
      throw err;
    }
    offer.title = data.title;
  }

  if (data.description !== undefined) offer.description = data.description;
  if (data.requiredSkills !== undefined) offer.requiredSkills = data.requiredSkills;
  if (data.location !== undefined) offer.location = data.location;

  if (data.status !== undefined) {
    const status = normalizeStatus(data.status);
    if (!VALID_OFFER_STATUS.includes(status)) {
      const err = new Error(`Statut d'offre invalide. Valeurs autorisées: ${VALID_OFFER_STATUS.join(", ")}`);
      err.statusCode = 400;
      throw err;
    }

    offer.status = status;
    if (status === "published") {
      // On renseigne la date uniquement si l'offre passe en published.
      offer.publishedAt = offer.publishedAt || new Date();
    } else {
      offer.publishedAt = null;
    }
  }

  await offer.save();
  return offer;
}

async function deleteOfferForEnterprise({ enterpriseId, offerId, ownerUserId }) {
  const offer = await assertOwnedOfferOrFail({ enterpriseId, offerId, ownerUserId });
  await offer.destroy();
  return { deleted: true };
}

async function listOffersForEnterprisePublic({ enterpriseId }) {
  // Les offres sont accessibles en lecture publique.
  return Offer.findAll({
    where: { enterpriseId },
    order: [["created_at", "DESC"]]
  });
}

async function listOffersPublic({ status = "published", limit = 50, offset = 0 } = {}) {
  // Dans l'application, on expose uniquement les offres publiées par défaut.
  const normalizedStatus = status || "published";
  return Offer.findAll({
    where: { status: normalizedStatus },
    limit,
    offset,
    order: [["publishedAt", "DESC"], ["created_at", "DESC"]]
  });
}

async function getOfferPublic({ offerId }) {
  // On autorise la lecture même si ce n'est pas "published" pour simplifier.
  // Vous pouvez renforcer ce point en production.
  return Offer.findByPk(offerId);
}

async function enterpriseHasOffer({ enterpriseId, ownerUserId }) {
  await getOwnedEnterpriseOrFail({ enterpriseId, ownerUserId });
  const offerCount = await Offer.count({ where: { enterpriseId } });
  return offerCount > 0;
}

module.exports = {
  createOfferForEnterprise,
  updateOfferForEnterprise,
  deleteOfferForEnterprise,
  listOffersForEnterprisePublic,
  listOffersPublic,
  getOfferPublic,
  // utilitaire
  enterpriseHasOffer
};

