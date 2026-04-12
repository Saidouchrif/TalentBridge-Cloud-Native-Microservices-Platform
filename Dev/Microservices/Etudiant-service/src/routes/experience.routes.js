const express = require("express");
const controleur = require("../controllers/experience.controller");
const {
  authentifierEtudiant,
  exigerProfilComplet,
} = require("../middlewares/auth.middleware");

const routeur = express.Router();

routeur.post(
  "/experience",
  authentifierEtudiant,
  exigerProfilComplet,
  controleur.ajouterExperience
);

routeur.get(
  "/experience",
  authentifierEtudiant,
  exigerProfilComplet,
  controleur.listerExperiences
);

routeur.delete(
  "/experience/:id",
  authentifierEtudiant,
  exigerProfilComplet,
  controleur.supprimerExperience
);

module.exports = routeur;
