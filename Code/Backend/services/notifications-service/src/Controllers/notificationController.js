// Contrôleur pour les opérations sur les notifications
const notificationService = require("../services/notificationService");
const emailService = require("../services/emailService");
const { asyncHandler } = require("../utils/asyncHandler");

/**
 * Créer une nouvelle notification
 * POST /api/notifications
 */
exports.createNotification = asyncHandler(async (req, res) => {
  const { userId, type, message, canal = "in-app", priority = "normal", relatedEntityId, relatedEntityType } = req.body;

  // Validation basique
  if (!userId || !type || !message) {
    return res.status(400).json({
      message: "Champs requis manquants: userId, type, message"
    });
  }

  const notification = await notificationService.createNotification({
    userId,
    type,
    message,
    canal,
    priority,
    relatedEntityId,
    relatedEntityType
  });

  res.status(201).json({ notification });
});

/**
 * Récupérer les notifications d'un utilisateur
 * GET /api/notifications
 */
exports.getNotifications = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const limit = req.query.limit ? Number(req.query.limit) : 50;
  const offset = req.query.offset ? Number(req.query.offset) : 0;
  const statut = req.query.statut || null;

  const { notifications, total } = await notificationService.getNotificationsByUserId({
    userId,
    limit,
    offset,
    statut
  });

  res.json({
    notifications,
    pagination: { total, limit, offset }
  });
});

/**
 * Récupérer une notification spécifique
 * GET /api/notifications/:id
 */
exports.getNotification = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const notification = await notificationService.getNotificationById({
    notificationId: id
  });

  res.json({ notification });
});

/**
 * Marquer une notification comme lue
 * PATCH /api/notifications/:id/read
 */
exports.markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const notification = await notificationService.markAsRead({
    notificationId: id
  });

  res.json({ notification });
});

/**
 * Marquer une notification comme non lue
 * PATCH /api/notifications/:id/unread
 */
exports.markAsUnread = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const notification = await notificationService.markAsUnread({
    notificationId: id
  });

  res.json({ notification });
});

/**
 * Supprimer (soft delete) une notification
 * DELETE /api/notifications/:id
 */
exports.deleteNotification = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await notificationService.deleteNotification({
    notificationId: id
  });

  res.json({ message: "Notification supprimée" });
});

/**
 * Compter les notifications non lues
 * GET /api/notifications/unread/count
 */
exports.getUnreadCount = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const count = await notificationService.getUnreadCount({ userId });

  res.json({ unreadCount: count });
});

/**
 * Récupérer les préférences de notification
 * GET /api/notifications/preferences
 */
exports.getPreferences = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const prefs = await notificationService.getNotificationPreferences({ userId });

  res.json({ preferences: prefs });
});

/**
 * Mettre à jour les préférences de notification
 * PUT /api/notifications/preferences
 */
exports.updatePreferences = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { emailEnabled, inAppEnabled, pushEnabled, preferredLanguage, notificationFrequency } = req.body;

  const prefs = await notificationService.updateNotificationPreferences({
    userId,
    data: {
      emailEnabled,
      inAppEnabled,
      pushEnabled,
      preferredLanguage,
      notificationFrequency
    }
  });

  res.json({ preferences: prefs });
});
