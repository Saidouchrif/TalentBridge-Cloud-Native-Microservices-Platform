const express = require("express");
const controleur = require("../controllers/etudiant.controller");
const {
  authentifierEtudiant,
  exigerProfilComplet,
} = require("../middlewares/auth.middleware");

const routeur = express.Router();

routeur.post("/profile", authentifierEtudiant, controleur.creerProfil);

routeur.get(
  "/me",
  authentifierEtudiant,
  exigerProfilComplet,
  controleur.lireMonProfil
);

routeur.put(
  "/me",
  authentifierEtudiant,
  exigerProfilComplet,
  controleur.mettreAJourMonProfil
);

module.exports = routeur;
