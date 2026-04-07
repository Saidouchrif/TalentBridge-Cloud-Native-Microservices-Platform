// Configuration email avec Nodemailer.
require("dotenv").config();

const nodemailer = require("nodemailer");

/**
 * Initialise le transporteur email.
 * Supporte SMTP classique ou mode développement (logs en console).
 */
function createEmailTransporter() {
  if (process.env.EMAIL_PROVIDER === "smtp") {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true", // TLS si true
      auth: {
        user: process.env.SMTP_USER || "",
        pass: process.env.SMTP_PASSWORD || ""
      }
    });
  }

  // Mode développement : affiche dans les logs au lieu d'envoyer
  return nodemailer.createTestAccount().then((testAccount) => {
    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
  });
}

module.exports = { createEmailTransporter };
