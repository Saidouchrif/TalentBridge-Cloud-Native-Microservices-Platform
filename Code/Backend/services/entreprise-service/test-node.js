// Test simple pour vérifier que Node.js fonctionne
console.log("Test Node.js - Début");

try {
  console.log("Chargement des modules...");
  require("dotenv").config();
  console.log("dotenv chargé");
  
  const { sequelize } = require("./src/Models");
  console.log("Modèles chargés");
  
  console.log("Test réussi!");
} catch (error) {
  console.error("Erreur:", error.message);
}
