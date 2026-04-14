/**
 * Score total sur 100 :
 * - competences vs offre : 50 %
 * - localisation : 20 %
 * - experience : 30 %
 */

function normaliserMots(texte) {
  return String(texte || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/gi, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1);
}

function scoreCompetences(competencesEtudiant, texteCompetencesOffre) {
  const motsOffre = [...new Set(normaliserMots(texteCompetencesOffre))];
  if (motsOffre.length === 0) {
    return 25;
  }

  const motsEtudiant = new Set();
  for (const c of competencesEtudiant || []) {
    const ligne = `${c.nom || ""} ${c.niveau || ""}`;
    normaliserMots(ligne).forEach((m) => motsEtudiant.add(m));
  }

  let correspondances = 0;
  for (const mo of motsOffre) {
    for (const me of motsEtudiant) {
      if (me === mo || me.includes(mo) || mo.includes(me)) {
        correspondances += 1;
        break;
      }
    }
  }

  const ratio = correspondances / motsOffre.length;
  return Math.min(50, Math.round(ratio * 50));
}

function scoreLocalisation(localisationEtudiant, localisationOffre) {
  const a = String(localisationEtudiant || "")
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  const b = String(localisationOffre || "")
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (!a || !b) {
    return 0;
  }
  if (a === b) {
    return 20;
  }
  if (a.includes(b) || b.includes(a)) {
    return 15;
  }

  const va = a.split(/[\s,;/]+/).filter(Boolean);
  const vb = b.split(/[\s,;/]+/).filter(Boolean);
  for (const x of va) {
    if (vb.some((y) => y === x || x.includes(y) || y.includes(x))) {
      return 20;
    }
  }
  return 0;
}

function moisUneExperience(exp) {
  if (!exp || !exp.dateDebut) {
    return 0;
  }
  const debut = new Date(exp.dateDebut);
  const fin = exp.dateFin ? new Date(exp.dateFin) : new Date();
  if (Number.isNaN(debut.getTime()) || Number.isNaN(fin.getTime())) {
    return 0;
  }
  const ms = Math.max(0, fin.getTime() - debut.getTime());
  return ms / (1000 * 60 * 60 * 24 * 30.44);
}

function scoreExperience(experiences) {
  const liste = Array.isArray(experiences) ? experiences : [];
  const totalMois = liste.reduce((s, e) => s + moisUneExperience(e), 0);
  const moisReference = 24;
  return Math.min(30, Math.round((totalMois / moisReference) * 30));
}

function scoreCompetencesTexteBrut(texteBrut, texteCompetencesOffre) {
  return scoreCompetences(
    [{ nom: texteBrut || "", niveau: "" }],
    texteCompetencesOffre
  );
}

function scoreExperienceTexteBrut(texteBrut) {
  const t = String(texteBrut || "");
  if (!t.trim()) {
    return 0;
  }
  const moisRegex = t.match(/(\d+)\s*(mois|month)/gi);
  const ansRegex = t.match(/(\d+)\s*(an|ans|year)/gi);
  let mois = 0;
  if (ansRegex) {
    for (const m of ansRegex) {
      const n = parseInt(m, 10);
      if (!Number.isNaN(n)) {
        mois += n * 12;
      }
    }
  }
  if (moisRegex) {
    for (const m of moisRegex) {
      const n = parseInt(m, 10);
      if (!Number.isNaN(n)) {
        mois += n;
      }
    }
  }
  if (mois === 0) {
    mois = Math.min(24, t.length / 400);
  }
  return Math.min(30, Math.round((mois / 24) * 30));
}

/**
 * @param {object} p
 * @param {string} p.competencesOffreTexte
 * @param {string} p.localisationOffre
 * @param {string} [p.localisationEtudiant]
 * @param {Array<{nom?:string,niveau?:string}>} [p.competences]
 * @param {Array<{dateDebut?:string,dateFin?:string|null}>} [p.experiences]
 * @param {string} [p.texteBrut] cv + message si pas de profil detaille
 */
function scoreTotal(p) {
  const offreComp = p.competencesOffreTexte || "";
  const partComp =
    p.competences && p.competences.length > 0
      ? scoreCompetences(p.competences, offreComp)
      : scoreCompetencesTexteBrut(p.texteBrut || "", offreComp);

  const partLoc = scoreLocalisation(p.localisationEtudiant, p.localisationOffre);

  const partExp =
    p.experiences && p.experiences.length > 0
      ? scoreExperience(p.experiences)
      : scoreExperienceTexteBrut(p.texteBrut || "");

  const brut = Math.round(partComp + partLoc + partExp);
  return Math.max(0, Math.min(100, brut));
}

module.exports = {
  scoreTotal,
  scoreCompetences,
  scoreLocalisation,
  scoreExperience,
  normaliserMots,
};
