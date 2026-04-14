const Joi = require("joi");
const { envoyerEmail } = require("../services/mailer");

const schemaContact = Joi.object({
  nom: Joi.string().trim().min(1).max(200).required(),
  email: Joi.string().trim().email().max(255).required(),
  message: Joi.string().trim().min(1).max(10000).required(),
});

async function envoyerContact(req, res) {
  const { error, value } = schemaContact.validate(req.body, {
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json({
      message: error.details[0]?.message || "Donnees invalides",
    });
  }

  const { nom, email, message } = value;
  const destinataire =
    process.env.SMTP_FROM || "systemtalentbridge@gmail.com";

  try {
    const resultat = await envoyerEmail({
      destinataire,
      sujet: `[TalentBridge] Message de ${nom}`,
      texte: [
        `Nom : ${nom}`,
        `Email : ${email}`,
        "",
        "Message :",
        message,
      ].join("\n"),
      html: [
        `<p><strong>Nom :</strong> ${nom}</p>`,
        `<p><strong>Email :</strong> ${email}</p>`,
        `<hr/>`,
        `<p>${message.replace(/\n/g, "<br/>")}</p>`,
      ].join("\n"),
    });

    if (!resultat?.ok) {
      if (resultat?.raison === "smtp_non_configure") {
        return res.status(503).json({
          message: "Configuration email indisponible. Contactez l'administrateur.",
        });
      }

      if (resultat?.raison === "smtp_auth_invalide") {
        return res.status(502).json({
          message: "Identifiants SMTP invalides. Verifiez SMTP_USER et SMTP_PASSWORD.",
        });
      }

      if (resultat?.raison === "smtp_indisponible") {
        return res.status(502).json({
          message: "Serveur SMTP indisponible. Reessayez dans quelques minutes.",
        });
      }

      return res.status(502).json({
        message: "Le serveur email a refuse l'envoi. Verifiez la configuration SMTP.",
      });
    }

    return res.json({ message: "Message envoye avec succes" });
  } catch (err) {
    console.error("[contact] Echec envoi email:", err.message);
    return res
      .status(500)
      .json({ message: "Erreur lors de l'envoi du message" });
  }
}

module.exports = { envoyerContact };
