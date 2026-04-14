const Notification = require("../models/notification.model");
const mailer = require("./mailer");
const authClient = require("./authClient");

function erreurHttp(code, message) {
  const e = new Error(message);
  e.statusCode = code;
  return e;
}

async function creerNotification(userId, message, type) {
  return Notification.create({
    user_id: Number(userId),
    message,
    type: type || "system",
    lu: false,
  });
}

/**
 * Nouvelle offre : in-app + email for each student, + confirmation to enterprise.
 */
async function traiterNouvelleOffre({ offre_id, titre, entreprise_user_id, recipients }) {
  let liste = Array.isArray(recipients) ? recipients : [];

  if (!liste.length) {
    const utilisateurs = await authClient.listerUtilisateurs();
    if (!utilisateurs) {
      throw erreurHttp(
        422,
        "Impossible de resoudre les etudiants : fournissez recipients ou configurez AUTH_SERVICE_URL et AUTH_SERVICE_ADMIN_TOKEN"
      );
    }
    liste = authClient.filtrerEtudiantsAvecEmail(utilisateurs);
  }

  let notifications = 0;
  let emailsOk = 0;

  const sujet = `[TalentBridge] Nouvelle offre : ${titre}`;
  const texte = `Une nouvelle offre a ete publiee sur TalentBridge.\n\nTitre : ${titre}\nReference offre : ${offre_id}\n\nConnectez-vous pour en savoir plus.`;
  const html = mailer.htmlNouvelleOffre({ titre });

  for (const r of liste) {
    const uid = Number(r.user_id);
    const email = String(r.email || "").trim();
    if (!uid || !email) continue;

    await creerNotification(uid, `Nouvelle offre disponible : ${titre}`, "offre");
    notifications += 1;

    const envoi = await mailer.envoyerEmail({ destinataire: email, sujet, texte, html });
    if (envoi.ok) emailsOk += 1;
  }

  if (entreprise_user_id) {
    const entUser = await authClient.obtenirUtilisateur(entreprise_user_id);
    await creerNotification(
      entreprise_user_id,
      `Votre offre "${titre}" a \u00e9t\u00e9 publi\u00e9e avec succ\u00e8s`,
      "offre"
    );
    notifications += 1;

    if (entUser?.email) {
      const envoi = await mailer.envoyerEmail({
        destinataire: entUser.email,
        sujet: `[TalentBridge] Offre publi\u00e9e : ${titre}`,
        texte: `Votre offre "${titre}" est maintenant visible sur TalentBridge.`,
        html: mailer.htmlOffreCreee({ titre }),
      });
      if (envoi.ok) emailsOk += 1;
    }
  }

  return { notifications, emailsOk, destinataires: liste.length };
}

/**
 * Nouvelle candidature : in-app + email for BOTH enterprise AND student.
 */
async function traiterNouvelleCandidature(payload) {
  const {
    offre_id,
    offre_titre,
    entreprise_user_id,
    entreprise_nom,
    candidature_id,
    etudiant_user_id,
    etudiant_nom,
  } = payload;

  const entreprise = await authClient.obtenirUtilisateur(entreprise_user_id);
  const emailEntreprise = entreprise?.email ? String(entreprise.email).trim() : null;

  let nomEtudiant =
    etudiant_nom && String(etudiant_nom).trim()
      ? String(etudiant_nom).trim()
      : null;
  if (!nomEtudiant) {
    const etu = await authClient.obtenirUtilisateur(etudiant_user_id);
    nomEtudiant = authClient.libelleUtilisateur(etu);
  }

  const nomEntreprise = entreprise_nom && String(entreprise_nom).trim()
    ? String(entreprise_nom).trim()
    : null;

  let notifications = 0;
  let emailsOk = 0;

  // --- Notification to ENTERPRISE ---
  const msgEntreprise = `${nomEtudiant} a postul\u00e9 \u00e0 votre offre : ${offre_titre}`;
  await creerNotification(entreprise_user_id, msgEntreprise, "candidature");
  notifications += 1;

  if (emailEntreprise) {
    const envoi = await mailer.envoyerEmail({
      destinataire: emailEntreprise,
      sujet: `[TalentBridge] Nouvelle candidature \u00e0 ${offre_titre}`,
      texte: `${nomEtudiant} a postul\u00e9 pour l'offre "${offre_titre}" (Offre #${offre_id}, Candidature #${candidature_id}).`,
      html: mailer.htmlNouvelleCandidatureEntreprise({ etudiantNom: nomEtudiant, poste: offre_titre }),
    });
    if (envoi.ok) emailsOk += 1;
  }

  // --- Notification to STUDENT ---
  const suffixe = nomEntreprise ? ` chez ${nomEntreprise}` : "";
  const msgEtudiant = `Votre candidature pour "${offre_titre}"${suffixe} a \u00e9t\u00e9 envoy\u00e9e avec succ\u00e8s`;
  await creerNotification(etudiant_user_id, msgEtudiant, "candidature");
  notifications += 1;

  const etudiant = await authClient.obtenirUtilisateur(etudiant_user_id);
  const emailEtudiant = etudiant?.email ? String(etudiant.email).trim() : null;

  if (emailEtudiant) {
    const envoi = await mailer.envoyerEmail({
      destinataire: emailEtudiant,
      sujet: `[TalentBridge] Candidature envoy\u00e9e \u2013 ${offre_titre}`,
      texte: `Votre candidature pour le poste "${offre_titre}"${suffixe} a \u00e9t\u00e9 envoy\u00e9e avec succ\u00e8s.`,
      html: mailer.htmlCandidatureEnvoyee({ poste: offre_titre, entreprise: nomEntreprise }),
    });
    if (envoi.ok) emailsOk += 1;
  }

  return { notifications, emailsOk };
}

/**
 * Acceptation / refus : in-app + email to student.
 */
async function traiterChangementStatut(payload) {
  const { etudiant_user_id, statut, offre_titre, entreprise_nom, candidature_id } = payload;

  const accepte = statut === "accepte";
  const libelle = accepte ? "accept\u00e9e" : "refus\u00e9e";
  const suffixe = entreprise_nom ? ` chez ${entreprise_nom}` : "";
  const message = `Votre candidature pour "${offre_titre}"${suffixe} a \u00e9t\u00e9 ${libelle}`;

  await creerNotification(etudiant_user_id, message, "statut");

  const etudiant = await authClient.obtenirUtilisateur(etudiant_user_id);
  const emailEtudiant = etudiant?.email ? String(etudiant.email).trim() : null;
  let emailOk = false;

  if (emailEtudiant) {
    const envoi = await mailer.envoyerEmail({
      destinataire: emailEtudiant,
      sujet: `[TalentBridge] Candidature ${libelle} \u2013 ${offre_titre}`,
      texte: `${message}.\n\nR\u00e9f\u00e9rence candidature : ${candidature_id}.`,
      html: mailer.htmlStatutCandidature({ poste: offre_titre, entreprise: entreprise_nom, statut }),
    });
    emailOk = envoi.ok;
  }

  return { notification: true, emailEtudiant: emailOk };
}

module.exports = {
  traiterNouvelleOffre,
  traiterNouvelleCandidature,
  traiterChangementStatut,
};
