const axios = require("axios");

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta";

function openaiModel() {
  return (process.env.OPENAI_MODEL || "gpt-4o-mini").trim();
}

function geminiModel() {
  return (process.env.GEMINI_MODEL || "gemini-2.0-flash").trim();
}

function erreurUtilisateur(code, message) {
  const e = new Error(message);
  e.statusCode = code;
  return e;
}

/* ── OpenAI helpers ──────────────────────────────── */

function extraireTexteOpenAI(data) {
  const choix = data?.choices;
  if (!Array.isArray(choix) || choix.length === 0) return null;
  const contenu = choix[0]?.message?.content;
  return typeof contenu === "string" ? contenu.trim() : null;
}

function extraireErreur(data) {
  if (data?.error?.message) return data.error.message;
  if (typeof data === "string") return data.slice(0, 300);
  return null;
}

async function tryOpenAI(model, textePrompt) {
  const cle = process.env.OPENAI_API_KEY;
  if (!cle || !String(cle).trim()) {
    return { ok: false, retryable: false, message: "Cle OpenAI manquante" };
  }

  try {
    console.log(`[AI] OpenAI ${model} ...`);
    const r = await axios.post(
      OPENAI_URL,
      {
        model,
        messages: [
          {
            role: "system",
            content:
              "Tu es un assistant professionnel specialise dans la redaction de documents de candidature en francais. " +
              "Redige de facon claire, structuree et professionnelle.",
          },
          { role: "user", content: textePrompt },
        ],
        max_tokens: 4096,
        temperature: 0.7,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${String(cle).trim()}`,
        },
        timeout: 120000,
        validateStatus: () => true,
      }
    );

    console.log(`[AI] OpenAI ${model} → HTTP ${r.status}`);

    if (r.status >= 200 && r.status < 300) {
      const txt = extraireTexteOpenAI(r.data);
      if (txt) return { ok: true, content: txt, provider: "openai" };
      return { ok: false, retryable: false, message: "Aucun texte genere" };
    }

    const detail = extraireErreur(r.data);
    console.error(`[AI] OpenAI ${model} error:`, detail || "(no body)");
    const retryable = r.status === 429 || r.status === 503;
    return { ok: false, retryable, status: r.status, message: detail || `HTTP ${r.status}` };
  } catch (err) {
    if (axios.isAxiosError(err) && err.code === "ECONNABORTED") {
      return { ok: false, retryable: false, message: "Timeout OpenAI" };
    }
    console.error(`[AI] OpenAI network:`, err.message);
    return { ok: false, retryable: false, message: err.message };
  }
}

/* ── Gemini helpers ──────────────────────────────── */

function extraireTexteGemini(data) {
  const cands = data?.candidates;
  if (!Array.isArray(cands) || cands.length === 0) return null;
  const parts = cands[0]?.content?.parts;
  if (!Array.isArray(parts) || parts.length === 0) return null;
  return parts
    .map((p) => (p && typeof p.text === "string" ? p.text : ""))
    .filter(Boolean)
    .join("\n")
    .trim();
}

async function tryGemini(model, textePrompt) {
  const cle = process.env.GEMINI_API_KEY;
  if (!cle || !String(cle).trim()) {
    return { ok: false, retryable: false, message: "Cle Gemini manquante" };
  }

  const url = `${GEMINI_BASE}/models/${model}:generateContent?key=${encodeURIComponent(String(cle).trim())}`;

  try {
    console.log(`[AI] Gemini ${model} ...`);
    const r = await axios.post(
      url,
      { contents: [{ parts: [{ text: textePrompt }] }] },
      { headers: { "Content-Type": "application/json" }, timeout: 120000, validateStatus: () => true }
    );

    console.log(`[AI] Gemini ${model} → HTTP ${r.status}`);

    if (r.status >= 200 && r.status < 300) {
      const txt = extraireTexteGemini(r.data);
      if (txt) return { ok: true, content: txt, provider: "gemini" };
      return { ok: false, retryable: false, message: "Aucun texte genere" };
    }

    const detail = extraireErreur(r.data);
    console.error(`[AI] Gemini ${model} error:`, detail || "(no body)");
    const retryable = r.status === 404 || r.status === 429;
    return { ok: false, retryable, status: r.status, message: detail || `HTTP ${r.status}` };
  } catch (err) {
    if (axios.isAxiosError(err) && err.code === "ECONNABORTED") {
      return { ok: false, retryable: false, message: "Timeout Gemini" };
    }
    console.error(`[AI] Gemini network:`, err.message);
    return { ok: false, retryable: false, message: err.message };
  }
}

/* ── Main orchestrator: OpenAI → Gemini fallback ─── */

async function generateContent(prompt) {
  const hasOpenAI = Boolean(process.env.OPENAI_API_KEY && String(process.env.OPENAI_API_KEY).trim());
  const hasGemini = Boolean(process.env.GEMINI_API_KEY && String(process.env.GEMINI_API_KEY).trim());

  if (!hasOpenAI && !hasGemini) {
    throw erreurUtilisateur(503, "Aucune cle API IA configuree (OPENAI_API_KEY ou GEMINI_API_KEY)");
  }

  const textePrompt = typeof prompt === "string" ? prompt.trim() : "";
  if (!textePrompt) {
    throw erreurUtilisateur(400, "Le prompt ne peut pas etre vide");
  }

  let lastError = null;

  // Step 1: Try OpenAI models
  if (hasOpenAI) {
    const primary = openaiModel();
    const models = [primary, ...["gpt-4o-mini", "gpt-4o"].filter((m) => m !== primary)];

    for (const model of models) {
      const res = await tryOpenAI(model, textePrompt);
      if (res.ok) {
        console.log(`[AI] Success: OpenAI ${model}`);
        return res.content;
      }
      lastError = res;
      if (!res.retryable) break;
    }
    console.log("[AI] OpenAI failed, trying Gemini fallback...");
  }

  // Step 2: Fallback to Gemini
  if (hasGemini) {
    const primary = geminiModel();
    const models = [primary, ...["gemini-2.5-flash", "gemini-2.0-flash"].filter((m) => m !== primary)];

    for (const model of models) {
      const res = await tryGemini(model, textePrompt);
      if (res.ok) {
        console.log(`[AI] Success: Gemini ${model} (fallback)`);
        return res.content;
      }
      lastError = res;
      if (!res.retryable) break;
    }
  }

  // Both providers failed
  const hint = lastError?.message || "erreur inconnue";
  console.error(`[AI] All providers failed. Last: ${hint}`);

  if (lastError?.status === 401 || hint.toLowerCase().includes("api key")) {
    throw erreurUtilisateur(502, "Cle(s) API IA invalide(s). Contactez l'administrateur.");
  }
  if (lastError?.status === 429) {
    throw erreurUtilisateur(502, "Quota IA depasse. Reessayez dans quelques minutes.");
  }
  if (lastError?.message?.includes("Timeout")) {
    throw erreurUtilisateur(504, "La generation a pris trop de temps, reessayez");
  }
  throw erreurUtilisateur(502, "Le service de generation IA est temporairement indisponible");
}

/* ── Prompt builders ─────────────────────────────── */

function construirePromptCv(donnees) {
  return [
    "Redige un CV clair et professionnel en francais, pret a etre copie dans un document.",
    "Structure avec des sections : Coordonnees (si fournies), Profil, Competences, Experiences, Formation, Langues, Centres d'interet (si pertinents).",
    "Utilise des puces et un ton sobre. Ne invente pas d'experiences : si une information manque, omets la section ou indique a completer.",
    "",
    "Informations candidat (JSON) :",
    JSON.stringify(donnees, null, 2),
  ].join("\n");
}

function construirePromptLettre(donnees) {
  return [
    "Redige une lettre de motivation en francais, ton professionnel, une page environ, pour la candidature decrite ci-dessous.",
    "Inclut formule de politesse, motivation, lien avec l'offre, conclusion avec demande d'entretien.",
    "",
    "Contexte (JSON) :",
    JSON.stringify(donnees, null, 2),
  ].join("\n");
}

function construirePromptEmail(donnees) {
  return [
    "Redige un email de candidature court et professionnel en francais (objet + corps).",
    "Format : premiere ligne 'Objet: ...' puis ligne vide puis corps de l'email.",
    "",
    "Contexte (JSON) :",
    JSON.stringify(donnees, null, 2),
  ].join("\n");
}

function construirePromptAdaptOffre(donnees) {
  return [
    "Adapte le document du candidat a l'offre d'emploi suivante : mots-cles, competences mises en avant, ton coherent avec le secteur.",
    "Conserve les faits ; tu peux reformuler et reordonner pour mieux matcher l'offre.",
    "Reponds uniquement avec le texte adapte, sans commentaire meta.",
    "",
    "Offre (JSON) :",
    JSON.stringify(donnees.offre || {}, null, 2),
    "",
    "Document a adapter :",
    String(donnees.contenu || "").slice(0, 120000),
  ].join("\n");
}

function toArray(value) {
  if (Array.isArray(value)) {
    return value.map((v) => String(v ?? "").trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(/[\n,;]+/)
      .map((v) => v.trim())
      .filter(Boolean);
  }
  return [];
}

function toBulletList(items, emptyText) {
  if (!Array.isArray(items) || items.length === 0) return `- ${emptyText}`;
  return items.map((it) => `- ${it}`).join("\n");
}

function formatNomComplet(ctx) {
  return [ctx?.prenom, ctx?.nom].map((v) => String(v || "").trim()).filter(Boolean).join(" ");
}

function fallbackCv(ctx = {}) {
  const nomComplet = formatNomComplet(ctx) || "Candidat";
  const contact = [
    ctx?.email ? `Email: ${ctx.email}` : null,
    ctx?.telephone ? `Telephone: ${ctx.telephone}` : null,
    ctx?.ville ? `Ville: ${ctx.ville}` : null,
  ]
    .filter(Boolean)
    .join(" | ");

  const competences = toArray(ctx?.competences);
  const langues = toArray(ctx?.langues);

  const experiences =
    typeof ctx?.experiences === "string"
      ? ctx.experiences.trim()
      : Array.isArray(ctx?.experiences)
        ? ctx.experiences
            .map((e) => {
              if (!e || typeof e !== "object") return null;
              const titre = [e.poste, e.titre].find(Boolean);
              const entreprise = [e.entreprise, e.societe, e.company].find(Boolean);
              const periode = [e.periode, e.dateDebut && e.dateFin ? `${e.dateDebut} - ${e.dateFin}` : null].find(Boolean);
              return [titre, entreprise, periode].filter(Boolean).join(" - ");
            })
            .filter(Boolean)
            .join("\n")
        : "";

  const formations =
    typeof ctx?.formations === "string"
      ? ctx.formations.trim()
      : Array.isArray(ctx?.formations)
        ? ctx.formations
            .map((f) => {
              if (!f || typeof f !== "object") return null;
              return [f.diplome, f.etablissement, f.periode].filter(Boolean).join(" - ");
            })
            .filter(Boolean)
            .join("\n")
        : "";

  return [
    `${nomComplet}`,
    contact || "Contact a completer",
    "",
    "PROFIL",
    ctx?.resumeProfil ? String(ctx.resumeProfil) : "Profil a completer selon l'objectif du poste vise.",
    "",
    "POSTE VISE",
    ctx?.titreSouhaite ? `- ${ctx.titreSouhaite}` : "- A definir",
    "",
    "COMPETENCES",
    toBulletList(competences, "Competences a completer"),
    "",
    "EXPERIENCES",
    experiences ? toBulletList(experiences.split("\n"), "Experiences a completer") : "- Experiences a completer",
    "",
    "FORMATION",
    formations ? toBulletList(formations.split("\n"), "Formation a completer") : "- Formation a completer",
    "",
    "LANGUES",
    toBulletList(langues, "Langues a completer"),
    "",
    "NOTE",
    "- Document genere en mode secours local (IA externe temporairement indisponible).",
  ].join("\n");
}

function fallbackLettre(ctx = {}) {
  const nomComplet = formatNomComplet(ctx) || "Candidat";
  const entreprise = String(ctx?.entreprise || "votre entreprise");
  const poste = String(ctx?.offre_titre || "le poste propose");
  const motivation = String(ctx?.messageMotivation || "").trim();

  return [
    `${nomComplet}`,
    ctx?.email ? `${ctx.email}` : "",
    "",
    `Objet : Candidature - ${poste}`,
    "",
    `Madame, Monsieur,`,
    "",
    `Je vous adresse ma candidature pour ${poste} au sein de ${entreprise}.`,
    "Mon parcours et mes competences me permettent de contribuer efficacement a vos objectifs.",
    motivation || "Je suis motive(e) a mettre mes competences techniques et mon sens de l'organisation au service de votre equipe.",
    "",
    "Je reste a votre disposition pour un entretien afin de vous presenter ma motivation en detail.",
    "",
    "Cordialement,",
    `${nomComplet}`,
    "",
    "Note: document genere en mode secours local (IA externe temporairement indisponible).",
  ]
    .filter((line) => line !== "")
    .join("\n");
}

function fallbackEmail(ctx = {}) {
  const nomComplet = formatNomComplet(ctx) || "Candidat";
  const poste = String(ctx?.offre_titre || "votre offre");
  const destinataire = String(ctx?.destinataire || "Madame, Monsieur");

  return [
    `Objet: Candidature - ${poste}`,
    "",
    `${destinataire},`,
    "",
    `Je vous contacte pour vous soumettre ma candidature concernant ${poste}.`,
    "Vous trouverez ci-joint mon CV et, si besoin, ma lettre de motivation.",
    "Je reste disponible pour echanger a votre convenance.",
    "",
    "Cordialement,",
    nomComplet,
    "",
    "Note: email genere en mode secours local (IA externe temporairement indisponible).",
  ].join("\n");
}

function fallbackAdaptOffre(ctx = {}) {
  const offre = ctx?.offre && typeof ctx.offre === "object" ? ctx.offre : {};
  const contenu = String(ctx?.contenu || "").trim();

  return [
    `Titre: ${offre.titre || "Offre de poste"}`,
    `Type: ${offre.type || "emploi"}`,
    `Localisation: ${offre.localisation || "A definir"}`,
    "",
    "Competences requises:",
    toBulletList(toArray(offre.competencesRequises), "A completer"),
    "",
    "Description adaptee:",
    offre.description || "Description a completer",
    "",
    "Base fournie:",
    contenu || "Aucun contenu source fourni.",
    "",
    "Note: adaptation produite en mode secours local (IA externe temporairement indisponible).",
  ].join("\n");
}

function genererFallback(type, contexte) {
  switch (type) {
    case "cv":
      return fallbackCv(contexte);
    case "lettre":
      return fallbackLettre(contexte);
    case "email":
      return fallbackEmail(contexte);
    case "adapt":
      return fallbackAdaptOffre(contexte);
    default:
      return "Document genere en mode secours local.";
  }
}

module.exports = {
  generateContent,
  construirePromptCv,
  construirePromptLettre,
  construirePromptEmail,
  construirePromptAdaptOffre,
  genererFallback,
  openaiModel,
  geminiModel,
};
