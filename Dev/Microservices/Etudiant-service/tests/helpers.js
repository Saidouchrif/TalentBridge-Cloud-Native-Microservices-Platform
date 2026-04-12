const jwt = require("jsonwebtoken");

const corpsProfilValide = {
  universite: "Université de test",
  niveau: "Master 1",
  cv: "https://example.com/cv.pdf",
  localisation: "Paris",
};

function creerJetonEtudiant(identifiantUtilisateur) {
  return jwt.sign(
    { user_id: identifiantUtilisateur, role: "etudiant" },
    process.env.JWT_SECRET,
    {
      algorithm: process.env.JWT_ALGORITHM || "HS256",
      expiresIn: "2h",
    }
  );
}

function creerJetonEntreprise(identifiantUtilisateur) {
  return jwt.sign(
    { user_id: identifiantUtilisateur, role: "entreprise" },
    process.env.JWT_SECRET,
    {
      algorithm: process.env.JWT_ALGORITHM || "HS256",
      expiresIn: "2h",
    }
  );
}

module.exports = {
  corpsProfilValide,
  creerJetonEtudiant,
  creerJetonEntreprise,
};
