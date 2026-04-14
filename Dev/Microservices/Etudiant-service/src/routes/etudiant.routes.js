const express = require("express");
const controleur = require("../controllers/etudiant.controller");
const {
  authentifierEtudiant,
  exigerProfilComplet,
} = require("../middlewares/auth.middleware");
const { uploadCv } = require("../middlewares/upload.middleware");

const routeur = express.Router();

routeur.post("/profile", authentifierEtudiant, controleur.creerProfil);

routeur.get(
  "/me",
  authentifierEtudiant,
  exigerProfilComplet,
  controleur.lireMonProfil
);

routeur.put(
  "/me",
  authentifierEtudiant,
  exigerProfilComplet,
  controleur.mettreAJourMonProfil
);

routeur.post(
  "/upload-cv",
  authentifierEtudiant,
  exigerProfilComplet,
  uploadCv.single("cv"),
  controleur.uploaderCv
);

module.exports = routeur;
