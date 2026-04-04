// Point d'entrée Express (création de l'app).
// On évite de lancer le serveur ici pour permettre les tests (on démarre dans `server.js`).
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

// Les routes sont regroupées sous `src/Routes/`.
const routes = require("./Routes");

// Création de l'application Express.
function createApp() {
  const app = express();

  // CORS: à adapter en production selon l'API Gateway / domaine de l'app frontend.
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || "*"
    })
  );

  app.use(express.json());

  // Convention API: tous les endpoints sont exposés sous `/api`.
  app.use("/api", routes);

  // Endpoint de santé (utile pour Docker / CI / supervision).
  app.get("/health", (req, res) => {
    res.json({ status: "Entreprise Service running" });
  });

  // Frontend React (build) : si le dossier `public/` existe, on sert les fichiers statiques.
  // L'objectif est de permettre un déploiement “prêt prod” avec un seul conteneur pour ce microservice.
  const publicDir = path.join(__dirname, "..", "public");
  if (fs.existsSync(publicDir)) {
    app.use(express.static(publicDir));

    // Pour les routes SPA (React Router), on renvoie le `index.html`.
    // Express 5 n'accepte pas correctement le wildcard `*` en route, donc on utilise
    // un middleware global conditionnel.
    app.use((req, res, next) => {
      // On évite d'intercepter les routes API.
      if (req.path.startsWith("/api")) return next();

      const indexPath = path.join(publicDir, "index.html");
      if (fs.existsSync(indexPath)) return res.sendFile(indexPath);

      return next();
    });
  }

  // Middleware de gestion d'erreurs (format simple et cohérent).
  // Les erreurs métier sont lancées via `next(err)` avec un `statusCode`.
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Erreur interne du serveur";

    // Format standardisé pour simplifier la consommation frontend.
    res.status(statusCode).json({
      message,
      // Détails en dev/test (sans exposer des secrets).
      ...(process.env.NODE_ENV !== "production" ? { details: err.details } : {})
    });
  });

  return app;
}

// Instance unique pour usage normal.
const app = createApp();

module.exports = { createApp, app };

