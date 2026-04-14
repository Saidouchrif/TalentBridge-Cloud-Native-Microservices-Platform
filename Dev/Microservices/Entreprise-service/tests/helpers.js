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

const corpsProfilEntreprise = {
  nomEntreprise: "TestCorp",
  secteur: "IT",
  description: "Description entreprise de test suffisamment longue.",
  adresse: "1 rue Test",
  ville: "Paris",
  pays: "France",
  siteWeb: "https://testcorp.example.com",
};

module.exports = {
  creerJetonEntreprise,
  creerJetonEtudiant,
  corpsProfilEntreprise,
};
