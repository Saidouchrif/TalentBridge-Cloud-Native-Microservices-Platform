const jwt = require("jsonwebtoken");

function creerJeton(userId, role = "etudiant") {
  return jwt.sign(
    { user_id: userId, role },
    process.env.JWT_SECRET || process.env.SECRET_KEY,
    { algorithm: process.env.JWT_ALGORITHM || "HS256", expiresIn: "2h" }
  );
}

module.exports = { creerJeton };
