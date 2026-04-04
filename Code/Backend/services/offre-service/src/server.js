const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");

require("dotenv").config();

const sequelize = require("./database");
const offerRoutes = require("./Routes/offerRoutes");

const app = express();

// -------------------------
// Middlewares globaux
// -------------------------

app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.CORS_ORIGIN || "*",
  credentials: true,
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limite chaque IP à 100 requêtes par windowMs
  message: "Trop de requêtes depuis cette IP, veuillez réessayer plus tard.",
});
app.use(limiter);

// -------------------------
// Routes
// -------------------------

// Health check
app.get("/health", (req, res) => {
  res.json({ 
    status: "OK", 
    service: "offre-service",
    timestamp: new Date().toISOString(),
    version: "1.0.0"
  });
});

// Routes API
app.use("/api/offers", offerRoutes);

// Proxy vers entreprise-service pour vérifier les entreprises
const axios = require("axios");
app.get("/api/enterprises/:enterpriseId", async (req, res) => {
  try {
    const { enterpriseId } = req.params;
    const response = await axios.get(`${process.env.ENTREPRISE_SERVICE_URL || "http://localhost:5002"}/api/entreprises/${enterpriseId}`);
    res.json(response.data);
  } catch (error) {
    if (error.response?.status === 404) {
      res.status(404).json({ message: "Entreprise introuvable." });
    } else {
      res.status(500).json({ message: "Erreur de communication avec le service entreprise." });
    }
  }
});

app.get("/api/enterprises/:enterpriseId/exists", async (req, res) => {
  try {
    const { enterpriseId } = req.params;
    const response = await axios.get(`${process.env.ENTREPRISE_SERVICE_URL || "http://localhost:5002"}/api/entreprises/${enterpriseId}`);
    res.json({ exists: true });
  } catch (error) {
    res.json({ exists: false });
  }
});

// -------------------------
// Gestion des erreurs
// -------------------------

// 404 - Route non trouvée
app.use((req, res) => {
  res.status(404).json({ message: "Route non trouvée." });
});

// Erreur globale
app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = err.statusCode || 500;
  const message = err.message || "Erreur interne du serveur.";
  res.status(status).json({ message });
});

// -------------------------
// Démarrage du serveur
// -------------------------

const PORT = process.env.PORT || 5003;

async function startServer() {
  try {
    // Test de connexion à la base de données
    await sequelize.authenticate();
    console.log("✅ Connexion à la base de données réussie.");

    // Synchronisation des modèles
    await sequelize.sync({ force: false });
    console.log("✅ Base de données synchronisée.");

    // Démarrage du serveur
    app.listen(PORT, () => {
      console.log(`🚀 Offre Service démarré sur le port ${PORT}`);
      console.log(`📊 Health: http://localhost:${PORT}/health`);
      console.log(`🔗 API: http://localhost:${PORT}/api/offers`);
    });
  } catch (error) {
    console.error("❌ Erreur au démarrage du serveur:", error);
    process.exit(1);
  }
}

// Démarrage uniquement si le fichier est exécuté directement
if (require.main === module) {
  startServer();
}

module.exports = app;
