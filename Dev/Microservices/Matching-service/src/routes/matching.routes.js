const express = require("express");
const controleur = require("../controllers/matching.controller");
const {
  authenticateJWT,
  requireEtudiant,
  requireEntreprise,
} = require("../middlewares/auth.middleware");

const routeur = express.Router();

routeur.get(
  "/offres",
  authenticateJWT,
  requireEtudiant,
  controleur.offresPourEtudiant
);

routeur.get(
  "/candidats/:offre_id",
  authenticateJWT,
  requireEntreprise,
  controleur.candidatsPourOffre
);

module.exports = routeur;
