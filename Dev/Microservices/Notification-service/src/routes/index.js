const express = require("express");

const routeurNotifications = require("./notification.routes");
const routeurContact = require("./contact.routes");

const routeur = express.Router();

routeur.use("/notifications", routeurNotifications);
routeur.use("/contact", routeurContact);

module.exports = routeur;
