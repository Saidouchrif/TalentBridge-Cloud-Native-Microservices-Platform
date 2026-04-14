const express = require("express");

const controleur = require("../controllers/candidature.controller");
const {
  authenticateJWT,
  requireEtudiant,
  requireEntreprise,
} = require("../middlewares/auth.middleware");
const { uploadCandidature } = require("../middlewares/upload.middleware");

const routeur = express.Router();

routeur.post(
  "/",
  authenticateJWT,
  requireEtudiant,
  uploadCandidature.fields([
    { name: "cv", maxCount: 1 },
    { name: "lettre", maxCount: 1 },
  ]),
  controleur.creer,
);

routeur.get("/me", authenticateJWT, requireEtudiant, controleur.listerMes);
routeur.get("/check/:offre_id", authenticateJWT, requireEtudiant, controleur.verifierCandidature);
routeur.get("/offre/:offre_id", authenticateJWT, requireEntreprise, controleur.listerParOffre);
routeur.put("/:id/statut", authenticateJWT, requireEntreprise, controleur.mettreAJourStatut);

module.exports = routeur;
