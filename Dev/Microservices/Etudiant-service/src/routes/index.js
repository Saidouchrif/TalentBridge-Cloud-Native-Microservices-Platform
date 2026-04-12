const express = require("express");

const routeurEtudiant = require("./etudiant.routes");
const routeurExperience = require("./experience.routes");
const routeurFormation = require("./formation.routes");
const routeurCompetence = require("./competence.routes");
const routeurLangue = require("./langue.routes");

const routeur = express.Router();

routeur.use(routeurEtudiant);
routeur.use(routeurExperience);
routeur.use(routeurFormation);
routeur.use(routeurCompetence);
routeur.use(routeurLangue);

module.exports = routeur;
