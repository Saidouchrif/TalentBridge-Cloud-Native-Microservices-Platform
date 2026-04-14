const express = require("express");

const controleur = require("../controllers/offre.controller");
const { authenticateJWT, requireEntreprise } = require("../middlewares/auth.middleware");
const { verifyServiceToken } = require("../middlewares/service.middleware");

const routeur = express.Router();

routeur.get("/search", controleur.rechercher);
routeur.get("/", controleur.lister);
routeur.post(
  "/:id/increment-candidatures",
  verifyServiceToken,
  controleur.incrementerNombreCandidatures
);
routeur.get("/:id", controleur.obtenirParId);

routeur.post("/", authenticateJWT, requireEntreprise, controleur.creer);
routeur.put("/:id", authenticateJWT, requireEntreprise, controleur.modifier);
routeur.delete("/:id", authenticateJWT, requireEntreprise, controleur.supprimer);

module.exports = routeur;
