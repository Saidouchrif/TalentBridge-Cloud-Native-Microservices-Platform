const nodemailer = require("nodemailer");
const Joi = require("joi");

const schemaContact = Joi.object({
  nom: Joi.string().trim().min(1).max(200).required(),
  email: Joi.string().trim().email().max(255).required(),
  message: Joi.string().trim().min(1).max(10000).required(),
});

function creerTransport() {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT) || 587;
  const secure = String(process.env.SMTP_USE_SSL).toLowerCase() === "true";

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
}

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
    const transport = creerTransport();

    await transport.sendMail({
      from: `"TalentBridge Contact" <${destinataire}>`,
      replyTo: email,
      to: destinataire,
      subject: `[TalentBridge] Message de ${nom}`,
      text: [
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

    return res.json({ message: "Message envoye avec succes" });
  } catch (err) {
    console.error("[contact] Echec envoi email:", err.message);
    return res
      .status(500)
      .json({ message: "Erreur lors de l'envoi du message" });
  }
}

module.exports = { envoyerContact };
