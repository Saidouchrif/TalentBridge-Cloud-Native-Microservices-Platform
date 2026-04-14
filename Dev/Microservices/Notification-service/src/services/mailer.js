const nodemailer = require("nodemailer");

function creerTransport() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;

  if (!host || !user || !pass) {
    return null;
  }

  const port = parseInt(String(process.env.SMTP_PORT || "587"), 10);
  const secure = String(process.env.SMTP_USE_SSL || "false").toLowerCase() === "true";
  const requireTLS = String(process.env.SMTP_USE_TLS || "true").toLowerCase() === "true";

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    requireTLS: requireTLS && !secure,
  });
}

function formatDateFR() {
  return new Date().toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function enveloppeHtml(contenu) {
  return [
    '<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"/></head>',
    '<body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;background:#f4f6f8;">',
    '<table width="100%" cellpadding="0" cellspacing="0" style="padding:30px 10px;">',
    '<tr><td align="center">',
    '<table width="580" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.06);">',
    '<tr><td style="background:#2563eb;padding:24px 30px;">',
    '<h1 style="margin:0;color:#fff;font-size:20px;">TalentBridge</h1>',
    "</td></tr>",
    '<tr><td style="padding:30px;">',
    contenu,
    "</td></tr>",
    '<tr><td style="padding:16px 30px;background:#f9fafb;color:#6b7280;font-size:12px;text-align:center;">',
    `&copy; ${new Date().getFullYear()} TalentBridge &mdash; Plateforme SaaS de recrutement intelligent`,
    "</td></tr>",
    "</table></td></tr></table></body></html>",
  ].join("");
}

function htmlCandidatureEnvoyee({ poste, entreprise }) {
  const date = formatDateFR();
  return enveloppeHtml([
    '<h2 style="margin:0 0 16px;color:#111827;">Candidature envoy\u00e9e</h2>',
    `<p style="color:#374151;line-height:1.6;">Votre candidature pour le poste <strong>${poste}</strong>`,
    entreprise ? ` chez <strong>${entreprise}</strong>` : "",
    ` a \u00e9t\u00e9 envoy\u00e9e avec succ\u00e8s.</p>`,
    `<p style="color:#6b7280;font-size:14px;">Date : ${date}</p>`,
    '<p style="color:#374151;">Vous serez notifi\u00e9(e) d\u00e8s que l\'entreprise aura trait\u00e9 votre dossier.</p>',
  ].join(""));
}

function htmlNouvelleCandidatureEntreprise({ etudiantNom, poste }) {
  const date = formatDateFR();
  return enveloppeHtml([
    '<h2 style="margin:0 0 16px;color:#111827;">Nouvelle candidature re\u00e7ue</h2>',
    `<p style="color:#374151;line-height:1.6;"><strong>${etudiantNom}</strong> a postul\u00e9 pour votre offre <strong>${poste}</strong>.</p>`,
    `<p style="color:#6b7280;font-size:14px;">Date : ${date}</p>`,
    '<p style="color:#374151;">Connectez-vous \u00e0 TalentBridge pour consulter le dossier.</p>',
  ].join(""));
}

function htmlStatutCandidature({ poste, entreprise, statut }) {
  const accepte = statut === "accepte";
  const libelle = accepte ? "accept\u00e9e" : "refus\u00e9e";
  const couleur = accepte ? "#059669" : "#dc2626";
  const date = formatDateFR();
  return enveloppeHtml([
    '<h2 style="margin:0 0 16px;color:#111827;">Mise \u00e0 jour de votre candidature</h2>',
    `<p style="color:#374151;line-height:1.6;">Votre candidature pour le poste <strong>${poste}</strong>`,
    entreprise ? ` chez <strong>${entreprise}</strong>` : "",
    ` a \u00e9t\u00e9 <span style="color:${couleur};font-weight:700;">${libelle}</span>.</p>`,
    `<p style="color:#6b7280;font-size:14px;">Date : ${date}</p>`,
    accepte
      ? '<p style="color:#374151;">F\u00e9licitations ! Consultez TalentBridge pour la suite.</p>'
      : '<p style="color:#374151;">Ne vous d\u00e9couragez pas, d\'autres offres vous attendent sur TalentBridge.</p>',
  ].join(""));
}

function htmlNouvelleOffre({ titre }) {
  const date = formatDateFR();
  return enveloppeHtml([
    '<h2 style="margin:0 0 16px;color:#111827;">Nouvelle offre disponible</h2>',
    `<p style="color:#374151;line-height:1.6;">Une nouvelle offre a \u00e9t\u00e9 publi\u00e9e : <strong>${titre}</strong>.</p>`,
    `<p style="color:#6b7280;font-size:14px;">Date : ${date}</p>`,
    '<p style="color:#374151;">Connectez-vous \u00e0 TalentBridge pour en savoir plus et postuler.</p>',
  ].join(""));
}

function htmlOffreCreee({ titre }) {
  const date = formatDateFR();
  return enveloppeHtml([
    '<h2 style="margin:0 0 16px;color:#111827;">Offre publi\u00e9e</h2>',
    `<p style="color:#374151;line-height:1.6;">Votre offre <strong>${titre}</strong> a \u00e9t\u00e9 cr\u00e9\u00e9e et publi\u00e9e sur TalentBridge.</p>`,
    `<p style="color:#6b7280;font-size:14px;">Date : ${date}</p>`,
    '<p style="color:#374151;">Les \u00e9tudiants seront notifi\u00e9s et pourront postuler d\u00e8s maintenant.</p>',
  ].join(""));
}

async function envoyerEmail({ destinataire, sujet, texte, html }) {
  const transport = creerTransport();
  if (!transport) {
    return { ok: false, raison: "smtp_non_configure" };
  }

  const expediteur = process.env.SMTP_FROM || process.env.SMTP_USER;

  try {
    await transport.sendMail({
      from: `"TalentBridge" <${expediteur}>`,
      to: destinataire,
      subject: sujet,
      text: texte,
      ...(html ? { html } : {}),
    });
    return { ok: true };
  } catch (err) {
    console.error("[mailer] Echec envoi:", err.message);
    return { ok: false, raison: "envoi_echoue" };
  }
}

module.exports = {
  envoyerEmail,
  creerTransport,
  htmlCandidatureEnvoyee,
  htmlNouvelleCandidatureEntreprise,
  htmlStatutCandidature,
  htmlNouvelleOffre,
  htmlOffreCreee,
};
