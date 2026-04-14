const express = require("express");
const controleur = require("../controllers/ai.controller");
const { authenticateJWT } = require("../middlewares/auth.middleware");

const routeur = express.Router();

routeur.use(authenticateJWT);

routeur.post("/generate-cv", controleur.generateCv);
routeur.post("/generate-lettre", controleur.generateLettre);
routeur.post("/generate-email", controleur.generateEmail);
routeur.post("/adapt-offre", controleur.adaptOffre);

module.exports = routeur;
