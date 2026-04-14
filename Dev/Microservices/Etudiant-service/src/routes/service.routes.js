const express = require("express");
const controleur = require("../controllers/service.controller");
const { verifierJetonMatching } = require("../middlewares/matchingService.middleware");

const routeur = express.Router();

routeur.get(
  "/service/users/:user_id/matching-profile",
  verifierJetonMatching,
  controleur.profilPourMatching
);

module.exports = routeur;
