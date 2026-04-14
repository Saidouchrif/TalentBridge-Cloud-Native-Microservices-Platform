const express = require("express");

const routeurEntreprise = require("./entreprise.routes");

const routeur = express.Router();

routeur.use("/entreprise", routeurEntreprise);

module.exports = routeur;
