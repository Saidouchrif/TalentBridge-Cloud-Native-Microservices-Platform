const express = require("express");

const controleur = require("../controllers/entreprise.controller");
const { authenticateJWT, requireEntreprise } = require("../middlewares/auth.middleware");

const routeur = express.Router();

routeur.get("/public/:userId", controleur.lireProfilPublic);

routeur.post("/profile", authenticateJWT, requireEntreprise, controleur.creerProfil);
routeur.get("/me", authenticateJWT, requireEntreprise, controleur.lireProfil);
routeur.put("/me", authenticateJWT, requireEntreprise, controleur.mettreAJour);

module.exports = routeur;
