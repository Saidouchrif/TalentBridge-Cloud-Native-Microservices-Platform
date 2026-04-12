const express = require("express");
const controleur = require("../controllers/langue.controller");
const {
  authentifierEtudiant,
  exigerProfilComplet,
} = require("../middlewares/auth.middleware");

const routeur = express.Router();

routeur.post(
  "/langue",
  authentifierEtudiant,
  exigerProfilComplet,
  controleur.ajouterLangue
);

routeur.get(
  "/langue",
  authentifierEtudiant,
  exigerProfilComplet,
  controleur.listerLangues
);

module.exports = routeur;
