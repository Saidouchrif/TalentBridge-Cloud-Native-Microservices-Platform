const Matching = require("../models/matching.model");
const { scoreTotal } = require("../utils/matchingScore");
const etudiantClient = require("./etudiantClient");
const offresClient = require("./offresClient");
const candidatureClient = require("./candidatureClient");

const TOP = 10;

async function remplacerMatchingsEtudiant(userId, lignes) {
  await Matching.destroy({ where: { user_id: userId } });
  if (!lignes.length) {
    return;
  }
  await Matching.bulkCreate(
    lignes.map((l) => ({
      user_id: userId,
      offre_id: l.offre_id,
      score: l.score,
    }))
  );
}

async function remplacerMatchingsOffre(offreId, lignes) {
  await Matching.destroy({ where: { offre_id: offreId } });
  if (!lignes.length) {
    return;
  }
  await Matching.bulkCreate(
    lignes.map((l) => ({
      user_id: l.user_id,
      offre_id: offreId,
      score: l.score,
    }))
  );
}

/**
 * Etudiant connecte : top offres.
 */
async function recommanderOffresPourEtudiant(bearerToken, userId) {
  const profil = await etudiantClient.chargerProfilEtudiantConnecte(bearerToken);
  const offres = await offresClient.listerOffresActives();

  const avecScores = offres.map((offre) => {
    const score = scoreTotal({
      competencesOffreTexte: offre.competencesRequises,
      localisationOffre: offre.localisation,
      localisationEtudiant: profil.localisation,
      competences: profil.competences,
      experiences: profil.experiences,
    });
    return { offre_id: offre.id, score };
  });

  avecScores.sort((a, b) => b.score - a.score);
  const top = avecScores.slice(0, TOP);

  await remplacerMatchingsEtudiant(userId, top);
  return top;
}

/**
 * Entreprise : top candidats ayant postule a l'offre.
 */
async function recommanderCandidatsPourOffre(bearerToken, entrepriseUserId, offreId) {
  const offre = await offresClient.obtenirOffreParId(offreId);
  if (!offre) {
    throw Object.assign(new Error("Offre introuvable"), { statusCode: 404 });
  }
  if (Number(offre.entreprise_id) !== Number(entrepriseUserId)) {
    throw Object.assign(new Error("Vous n'avez pas acces a cette offre"), {
      statusCode: 403,
    });
  }

  const candidatures = await candidatureClient.listerCandidaturesPourOffre(
    bearerToken,
    offreId
  );

  const resultats = [];

  for (const cand of candidatures) {
    const uid = Number(cand.user_id);
    if (!uid) {
      continue;
    }

    let bundle = await etudiantClient.chargerProfilPourMatching(uid);
    let texteBrut = "";

    if (!bundle) {
      texteBrut = [cand.message, cand.cv].filter(Boolean).join("\n");
      bundle = {
        localisation: "",
        competences: [],
        experiences: [],
      };
    }

    const score = scoreTotal({
      competencesOffreTexte: offre.competencesRequises,
      localisationOffre: offre.localisation,
      localisationEtudiant: bundle.localisation,
      competences: bundle.competences,
      experiences: bundle.experiences,
      texteBrut,
    });

    resultats.push({ user_id: uid, score });
  }

  resultats.sort((a, b) => b.score - a.score);
  const top = resultats.slice(0, TOP);

  await remplacerMatchingsOffre(offreId, top);
  return top;
}

module.exports = {
  recommanderOffresPourEtudiant,
  recommanderCandidatsPourOffre,
  TOP,
};
