const jwt = require("jsonwebtoken");

function creerJetonEntreprise(userId) {
  return jwt.sign(
    { user_id: userId, role: "entreprise" },
    process.env.JWT_SECRET,
    { algorithm: process.env.JWT_ALGORITHM || "HS256", expiresIn: "2h" }
  );
}

function creerJetonEtudiant(userId) {
  return jwt.sign(
    { user_id: userId, role: "etudiant" },
    process.env.JWT_SECRET,
    { algorithm: process.env.JWT_ALGORITHM || "HS256", expiresIn: "2h" }
  );
}

const corpsOffreValide = {
  titre: "Developpeur Node",
  description: "Description longue de loffre pour satisfaire la validation.",
  competencesRequises: "Node.js JavaScript PostgreSQL",
  localisation: "Paris",
  type: "emploi",
};

module.exports = {
  creerJetonEntreprise,
  creerJetonEtudiant,
  corpsOffreValide,
};
