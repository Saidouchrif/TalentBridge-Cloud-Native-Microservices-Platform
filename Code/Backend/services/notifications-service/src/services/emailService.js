// Service pour l'envoi d'emails
const nodemailer = require("nodemailer");

let transporter = null;

/**
 * Initialiser le transporter email
 */
async function initializeTransporter() {
  if (transporter) return transporter;

  if (process.env.EMAIL_PROVIDER === "smtp") {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER || "",
        pass: process.env.SMTP_PASSWORD || ""
      }
    });
  } else {
    // Mode test avec ethereal
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
  }

  return transporter;
}

/**
 * Envoyer un email
 */
exports.sendEmail = async ({ to, subject, html, text }) => {
  try {
    const transporter = await initializeTransporter();

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || "no-reply@talentbridge.com",
      to,
      subject,
      text,
      html
    });

    console.log("Email envoyé:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error("Erreur envoi email:", err);
    throw {
      statusCode: 500,
      message: "Erreur lors de l'envoi de l'email",
      details: err.message
    };
  }
};

/**
 * Templates d'emails
 */

exports.sendRegistrationEmail = async ({ to, userName }) => {
  const html = `
    <h1>Bienvenue sur TalentBridge!</h1>
    <p>Bonjour ${userName},</p>
    <p>Votre compte a été créé avec succès.</p>
    <p>Vous pouvez maintenant vous connecter et commencer à explorer les offres d'emploi.</p>
    <br>
    <p>Cordialement,<br>L'équipe TalentBridge</p>
  `;

  return exports.sendEmail({
    to,
    subject: "Bienvenue sur TalentBridge",
    html,
    text: `Bienvenue ${userName}! Votre compte a été créé.`
  });
};

exports.sendApplicationStatusEmail = async ({ to, applicantName, offerTitle, status, statusLabel }) => {
  const statusMessages = {
    submitted: "Votre candidature a été reçue",
    accepted: "Félicitations! Votre candidature a été acceptée",
    rejected: "Nous regrettons d'informer que votre candidature a été refusée",
    interview: "Vous êtes invité à un entretien"
  };

  const html = `
    <h1>${statusMessages[status] || "Mise à jour de votre candidature"}</h1>
    <p>Bonjour ${applicantName},</p>
    <p>Statut de votre candidature pour le poste: <strong>${offerTitle}</strong></p>
    <p>Nouveau statut: <strong>${statusLabel}</strong></p>
    <p>Consultez votre profil pour plus de détails.</p>
    <br>
    <p>Cordialement,<br>L'équipe TalentBridge</p>
  `;

  return exports.sendEmail({
    to,
    subject: `Mise à jour de candidature: ${offerTitle}`,
    html,
    text: `${statusMessages[status]} pour ${offerTitle}`
  });
};

exports.sendNewOfferEmail = async ({ to, userName, offerTitle, companyName }) => {
  const html = `
    <h1>Nouvelle offre d'emploi correspondant à votre profil!</h1>
    <p>Bonjour ${userName},</p>
    <p><strong>${companyName}</strong> vient de publier une nouvelle offre qui pourrait vous intéresser:</p>
    <p><strong>${offerTitle}</strong></p>
    <p>Consultez votre profil pour consulter l'offre complète et candidater.</p>
    <br>
    <p>Cordialement,<br>L'équipe TalentBridge</p>
  `;

  return exports.sendEmail({
    to,
    subject: `Nouvelle offre: ${offerTitle}`,
    html,
    text: `Nouvelle offre de ${companyName}: ${offerTitle}`
  });
};
