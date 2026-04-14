const express = require("express");

const routeurOffres = require("./offre.routes");

const routeur = express.Router();

routeur.use("/offres", routeurOffres);

module.exports = routeur;
