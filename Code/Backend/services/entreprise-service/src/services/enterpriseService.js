const { Enterprise } = require("../Models");
const { assertRequired } = require("../utils/validation");

// Création d'une entreprise.
async function createEnterprise({ ownerUserId, data }) {
  assertRequired("name", data.name);

  const enterprise = await Enterprise.create({
    ownerUserId,
    name: data.name,
    sector: data.sector,
    description: data.description,
    addressLine1: data.addressLine1,
    city: data.city,
    postalCode: data.postalCode,
    country: data.country,
    phone: data.phone,
    website: data.website
  });

  return enterprise;
}

// Récupération publique.
async function getEnterprisePublic({ enterpriseId }) {
  return Enterprise.findByPk(enterpriseId);
}

// Récupération d'une entreprise avec vérification owner.
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

async function updateEnterprise({ enterpriseId, ownerUserId, data }) {
  // On récupère et on vérifie la propriété avant d'appliquer les modifications.
  const enterprise = await getOwnedEnterpriseOrFail({ enterpriseId, ownerUserId });

  // Mise à jour partielle: on ne touche qu'aux champs fournis.
  if (data.name !== undefined) enterprise.name = data.name;
  if (data.sector !== undefined) enterprise.sector = data.sector;
  if (data.description !== undefined) enterprise.description = data.description;
  if (data.addressLine1 !== undefined) enterprise.addressLine1 = data.addressLine1;
  if (data.city !== undefined) enterprise.city = data.city;
  if (data.postalCode !== undefined) enterprise.postalCode = data.postalCode;
  if (data.country !== undefined) enterprise.country = data.country;
  if (data.phone !== undefined) enterprise.phone = data.phone;
  if (data.website !== undefined) enterprise.website = data.website;

  // Validation minimale sur `name` si envoyé.
  if (data.name !== undefined) assertRequired("name", data.name);

  await enterprise.save();
  return enterprise;
}

async function deleteEnterprise({ enterpriseId, ownerUserId }) {
  const enterprise = await getOwnedEnterpriseOrFail({ enterpriseId, ownerUserId });
  await enterprise.destroy();
  return { deleted: true };
}

async function listEnterprisesPublic({ limit = 50, offset = 0 } = {}) {
  return Enterprise.findAll({
    limit,
    offset,
    order: [["created_at", "DESC"]]
  });
}

module.exports = {
  createEnterprise,
  getEnterprisePublic,
  updateEnterprise,
  deleteEnterprise,
  listEnterprisesPublic
};

