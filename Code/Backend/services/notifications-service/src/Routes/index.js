const express = require("express");
const router = express.Router();

const { requireAuth, requireRole } = require("../middlewares/requireAuth");
const notificationController = require("../Controllers/notificationController");

// ========================
// Routes publiques (sans auth)
// ========================

/**
 * Endpoint de santé
 */
router.get("/health", (req, res) => {
  res.json({ status: "Notifications Service running" });
});

// ========================
// Routes protégées par authentification
// ========================

/**
 * Créer une notification (admin/service)
 * POST /api/notifications
 */
router.post(
  "/",
  requireAuth,
  requireRole(["admin", "system"]),
  notificationController.createNotification
);

/**
 * Récupérer les notifications de l'utilisateur actuel
 * GET /api/notifications
 */
router.get("/", requireAuth, notificationController.getNotifications);

/**
 * Récupérer le nombre de notifications non lues
 * GET /api/notifications/unread/count
 * (À placer avant /:id pour éviter conflict avec les params)
 */
router.get("/unread/count", requireAuth, notificationController.getUnreadCount);

/**
 * Récupérer les préférences de notification
 * GET /api/notifications/preferences
 */
router.get("/preferences", requireAuth, notificationController.getPreferences);

/**
 * Mettre à jour les préférences de notification
 * PUT /api/notifications/preferences
 */
router.put("/preferences", requireAuth, notificationController.updatePreferences);

/**
 * Récupérer une notification spécifique
 * GET /api/notifications/:id
 */
router.get("/:id", requireAuth, notificationController.getNotification);

/**
 * Marquer comme lue
 * PATCH /api/notifications/:id/read
 */
router.patch("/:id/read", requireAuth, notificationController.markAsRead);

/**
 * Marquer comme non lue
 * PATCH /api/notifications/:id/unread
 */
router.patch("/:id/unread", requireAuth, notificationController.markAsUnread);

/**
 * Supprimer une notification (soft delete)
 * DELETE /api/notifications/:id
 */
router.delete("/:id", requireAuth, notificationController.deleteNotification);

module.exports = router;
