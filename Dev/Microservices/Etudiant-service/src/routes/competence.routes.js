const express = require("express");
const controleur = require("../controllers/competence.controller");
const {
  authentifierEtudiant,
  exigerProfilComplet,
} = require("../middlewares/auth.middleware");

const routeur = express.Router();

routeur.post(
  "/competence",
  authentifierEtudiant,
  exigerProfilComplet,
  controleur.ajouterCompetence
);

routeur.get(
  "/competence",
  authentifierEtudiant,
  exigerProfilComplet,
  controleur.listerCompetences
);

module.exports = routeur;
