const express = require("express");

const routeurMatching = require("./matching.routes");

const routeur = express.Router();

routeur.use("/matching", routeurMatching);

module.exports = routeur;
