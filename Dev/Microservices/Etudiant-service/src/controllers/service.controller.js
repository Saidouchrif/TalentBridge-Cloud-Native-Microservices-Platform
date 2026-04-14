const Etudiant = require("../models/etudiant.model");
const Competence = require("../models/competence.model");
const Experience = require("../models/experience.model");

/**
 * GET /api/etudiant/service/users/:user_id/matching-profile
 * Donnees pour le Matching-service (sans JWT utilisateur).
 */
async function profilPourMatching(req, res, next) {
  try {
    const userId = parseInt(String(req.params.user_id), 10);
    if (!Number.isInteger(userId) || userId < 1) {
      return res.status(400).json({ message: "Identifiant utilisateur invalide" });
    }

    const profil = await Etudiant.findOne({ where: { user_id: userId } });
    if (!profil) {
      return res.status(404).json({ message: "Profil etudiant introuvable" });
    }

    const [competences, experiences] = await Promise.all([
      Competence.findAll({
        where: { user_id: userId },
        attributes: ["nom", "niveau"],
        order: [["nom", "ASC"]],
      }),
      Experience.findAll({
        where: { user_id: userId },
        attributes: ["dateDebut", "dateFin", "poste"],
        order: [["dateDebut", "DESC"]],
      }),
    ]);

    return res.json({
      user_id: userId,
      localisation: profil.localisation,
      competences: competences.map((c) => ({
        nom: c.nom,
        niveau: c.niveau,
      })),
      experiences: experiences.map((e) => ({
        dateDebut: e.dateDebut,
        dateFin: e.dateFin,
        poste: e.poste,
      })),
    });
  } catch (erreur) {
    return next(erreur);
  }
}

module.exports = {
  profilPourMatching,
};
