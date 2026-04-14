const express = require("express");
const controleur = require("../controllers/notification.controller");
const { authenticateJWT } = require("../middlewares/auth.middleware");
const { verifyServiceToken } = require("../middlewares/service.middleware");

const routeur = express.Router();

routeur.get("/me", authenticateJWT, controleur.listerMes);
routeur.patch("/read-all", authenticateJWT, controleur.marquerToutLu);
routeur.patch("/:id/read", authenticateJWT, controleur.marquerLu);

routeur.post("/new-offre", verifyServiceToken, controleur.nouvelleOffre);
routeur.post("/new-candidature", verifyServiceToken, controleur.nouvelleCandidature);
routeur.post("/status-update", verifyServiceToken, controleur.miseAJourStatutCandidature);

module.exports = routeur;
