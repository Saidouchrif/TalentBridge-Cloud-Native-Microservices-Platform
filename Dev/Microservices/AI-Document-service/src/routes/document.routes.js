const express = require("express");
const controleur = require("../controllers/document.controller");
const { authenticateJWT } = require("../middlewares/auth.middleware");

const routeur = express.Router();

routeur.use(authenticateJWT);

routeur.get("/me", controleur.listerMes);
routeur.delete("/:id", controleur.supprimer);

module.exports = routeur;
