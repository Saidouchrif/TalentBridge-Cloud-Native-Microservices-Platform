const express = require("express");

const routeurAi = require("./ai.routes");
const routeurDocuments = require("./document.routes");

const routeur = express.Router();

routeur.use("/ai", routeurAi);
routeur.use("/documents", routeurDocuments);

module.exports = routeur;
