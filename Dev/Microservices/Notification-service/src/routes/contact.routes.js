const express = require("express");
const { envoyerContact } = require("../controllers/contact.controller");

const routeur = express.Router();

routeur.post("/", envoyerContact);

module.exports = routeur;
