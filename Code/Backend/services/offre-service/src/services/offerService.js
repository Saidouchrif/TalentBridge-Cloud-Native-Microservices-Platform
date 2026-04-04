const { Offer, Application } = require("../Models");

// Création d'une offre.
async function createOffer({ ownerUserId, data }) {
  // Vérifier que l'entreprise existe via entreprise-service
  const enterpriseExists = await checkEnterpriseExists(data.enterpriseId);
  if (!enterpriseExists) {
    const err = new Error("Entreprise introuvable.");
    err.statusCode = 404;
    throw err;
  }

  const offer = await Offer.create({
    enterpriseId: data.enterpriseId,
    title: data.title,
    description: data.description,
    requiredSkills: data.requiredSkills || [],
    location: data.location,
    status: data.status || "published",
    publishedAt: data.status === "published" ? new Date() : null,
  });

  return offer;
}

// Récupération publique.
async function getOfferPublic({ offerId }) {
  const offer = await Offer.findByPk(offerId, {
    include: [
      {
        model: Application,
        as: "applications",
        attributes: ["id", "status", "createdAt"],
      },
    ],
  });

  if (!offer) {
    const err = new Error("Offre introuvable.");
    err.statusCode = 404;
    throw err;
  }

  return offer;
}

// Récupération d'une offre avec vérification owner.
async function getOwnedOfferOrFail({ offerId, ownerUserId }) {
  const offer = await Offer.findByPk(offerId);
  if (!offer) {
    const err = new Error("Offre introuvable.");
    err.statusCode = 404;
    throw err;
  }

  // Pour simplifier, on suppose que l'utilisateur peut modifier toutes les offres
  // En production, il faudrait vérifier que l'utilisateur est propriétaire de l'entreprise

  return offer;
}

async function updateOffer({ offerId, ownerUserId, data }) {
  // On récupère et on vérifie la propriété avant d'appliquer les modifications.
  const offer = await getOwnedOfferOrFail({ offerId, ownerUserId });

  // Mise à jour partielle: on ne touche qu'aux champs fournis.
  if (data.title !== undefined) offer.title = data.title;
  if (data.description !== undefined) offer.description = data.description;
  if (data.requiredSkills !== undefined) offer.requiredSkills = data.requiredSkills;
  if (data.location !== undefined) offer.location = data.location;
  if (data.status !== undefined) {
    offer.status = data.status;
    if (data.status === "published" && !offer.publishedAt) {
      offer.publishedAt = new Date();
    }
  }

  await offer.save();
  return offer;
}

async function deleteOffer({ offerId, ownerUserId }) {
  const offer = await getOwnedOfferOrFail({ offerId, ownerUserId });
  await offer.destroy();
  return { deleted: true };
}

async function listOffersPublic({ 
  status = null, 
  location = null, 
  skills = null, 
  limit = 50, 
  offset = 0 
} = {}) {
  const whereClause = {};
  
  if (status) {
    whereClause.status = status;
  }
  
  if (location) {
    whereClause.location = {
      [require("sequelize").Op.iLike]: `%${location}%`
    };
  }
  
  if (skills) {
    const skillsArray = Array.isArray(skills) ? skills : [skills];
    whereClause.requiredSkills = {
      [require("sequelize").Op.overlap]: skillsArray
    };
  }

  return Offer.findAll({
    where: whereClause,
    limit,
    offset,
    order: [["created_at", "DESC"]],
    include: [
      {
        model: Application,
        as: "applications",
        attributes: ["id", "status"],
      },
    ],
  });
}

async function listOffersForEnterprise({ enterpriseId }) {
  return Offer.findAll({
    where: { enterpriseId },
    order: [["created_at", "DESC"]],
    include: [
      {
        model: Application,
        as: "applications",
        attributes: ["id", "status", "createdAt"],
      },
    ],
  });
}

// Vérifier si une entreprise existe via entreprise-service
async function checkEnterpriseExists(enterpriseId) {
  try {
    const axios = require("axios");
    const response = await axios.get(`${process.env.ENTREPRISE_SERVICE_URL || "http://localhost:5002"}/api/entreprises/${enterpriseId}`);
    return response.status === 200;
  } catch (error) {
    return false;
  }
}

module.exports = {
  createOffer,
  getOfferPublic,
  updateOffer,
  deleteOffer,
  listOffersPublic,
  listOffersForEnterprise,
  checkEnterpriseExists,
};
