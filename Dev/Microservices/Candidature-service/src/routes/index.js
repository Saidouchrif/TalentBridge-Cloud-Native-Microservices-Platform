const express = require("express");

const routeurCandidatures = require("./candidature.routes");

const routeur = express.Router();

routeur.use("/candidatures", routeurCandidatures);

module.exports = routeur;
