const { Op } = require("sequelize");

/** Date du jour au format YYYY-MM-DD (UTC) pour comparer aux DATEONLY. */
function dateDuJourIso() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Met a jour en base les offres actives dont la date d'expiration est depassee -> statut ferme.
 */
async function fermerOffresExpirees(Offre) {
  const jour = dateDuJourIso();
  await Offre.update(
    { statut: "ferm\u00e9" },
    {
      where: {
        statut: "actif",
        dateExpiration: {
          [Op.and]: [{ [Op.ne]: null }, { [Op.lt]: jour }],
        },
      },
    }
  );
}

/**
 * Filtre catalogue : offres actives non expirees (dateExpiration null ou >= aujourd'hui).
 */
function clauseCatalogueActif() {
  const jour = dateDuJourIso();
  return {
    statut: "actif",
    [Op.or]: [
      { dateExpiration: null },
      { dateExpiration: { [Op.gte]: jour } },
    ],
  };
}

/**
 * Pagination : page >= 1, limit entre 1 et maxLimit.
 */
function parserPagination(query, maxLimit = 100) {
  const page = Math.max(1, parseInt(String(query.page || "1"), 10) || 1);
  const rawLimit = parseInt(String(query.limit || "10"), 10) || 10;
  const limit = Math.min(Math.max(1, rawLimit), maxLimit);
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

/**
 * Tri : sort=recent ? datePublication DESC ; sort=datePublication ? datePublication ASC.
 */
function parserTri(sortBrut) {
  const s = (sortBrut || "recent").toString().trim().toLowerCase();
  if (s === "datepublication" || s === "date_publication") {
    return [["datePublication", "ASC"]];
  }
  return [["datePublication", "DESC"]];
}

module.exports = {
  fermerOffresExpirees,
  clauseCatalogueActif,
  parserPagination,
  parserTri,
  dateDuJourIso,
};
