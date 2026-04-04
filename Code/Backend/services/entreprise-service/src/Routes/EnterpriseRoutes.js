const express = require("express");

const { requireAuth } = require("../middlewares/requireAuth");

const enterpriseController = require("../Controllers/enterpriseController");

const router = express.Router();

// -------------------------
// CRUD Entreprise
// -------------------------

// Lister les entreprises (lecture publique).
router.get("/", enterpriseController.listEnterprisesPublic);

// Récupérer une entreprise par id (lecture publique).
router.get("/:enterpriseId", enterpriseController.getEnterprisePublic);

// Créer une entreprise (mode test avec middleware).
router.post("/", requireAuth, enterpriseController.createEnterprise);

// Mettre à jour une entreprise (mode test avec middleware).
router.put("/:enterpriseId", requireAuth, enterpriseController.updateEnterprise);

// Supprimer une entreprise (mode test avec middleware).
router.delete("/:enterpriseId", requireAuth, enterpriseController.deleteEnterprise);

module.exports = router;

