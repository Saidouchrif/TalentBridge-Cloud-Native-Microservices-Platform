const express = require("express");
const controleur = require("../controllers/formation.controller");
const {
  authentifierEtudiant,
  exigerProfilComplet,
} = require("../middlewares/auth.middleware");

const routeur = express.Router();

routeur.post(
  "/formation",
  authentifierEtudiant,
  exigerProfilComplet,
  controleur.ajouterFormation
);

routeur.get(
  "/formation",
  authentifierEtudiant,
  exigerProfilComplet,
  controleur.listerFormations
);

module.exports = routeur;
