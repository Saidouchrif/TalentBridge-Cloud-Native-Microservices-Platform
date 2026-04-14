const jwt = require("jsonwebtoken");

function creerJetonEtudiant(userId) {
  return jwt.sign(
    { user_id: userId, role: "etudiant" },
    process.env.JWT_SECRET,
    { algorithm: process.env.JWT_ALGORITHM || "HS256", expiresIn: "2h" }
  );
}

function creerJetonEntreprise(userId) {
  return jwt.sign(
    { user_id: userId, role: "entreprise" },
    process.env.JWT_SECRET,
    { algorithm: process.env.JWT_ALGORITHM || "HS256", expiresIn: "2h" }
  );
}

module.exports = { creerJetonEtudiant, creerJetonEntreprise };
