// Service métier pour la logique des notifications
const { Notification, NotificationPreference } = require("../Models");

/**
 * Créer une nouvelle notification
 */
exports.createNotification = async (data) => {
  const {
    userId,
    type,
    message,
    canal = "in-app",
    priority = "normal",
    relatedEntityId = null,
    relatedEntityType = null
  } = data;

  if (!userId || !type || !message) {
    throw {
      statusCode: 400,
      message: "Champs requis manquants: userId, type, message"
    };
  }

  const notification = await Notification.create({
    userId,
    type,
    message,
    canal,
    priority,
    relatedEntityId,
    relatedEntityType,
    statut: "pending"
  });

  return notification;
};

/**
 * Récupérer les notifications d'un utilisateur
 */
exports.getNotificationsByUserId = async ({ userId, limit = 50, offset = 0, statut = null }) => {
  const where = { userId };

  if (statut) {
    where.statut = statut;
  }

  const notifications = await Notification.findAll({
    where,
    order: [["createdAt", "DESC"]],
    limit,
    offset
  });

  const total = await Notification.count({ where });

  return { notifications, total };
};

/**
 * Récupérer une notification par ID
 */
exports.getNotificationById = async ({ notificationId }) => {
  const notification = await Notification.findByPk(notificationId);

  if (!notification) {
    throw {
      statusCode: 404,
      message: "Notification non trouvée"
    };
  }

  return notification;
};

/**
 * Marquer une notification comme lue
 */
exports.markAsRead = async ({ notificationId }) => {
  const notification = await exports.getNotificationById({ notificationId });

  notification.statut = "read";
  notification.readAt = new Date();
  await notification.save();

  return notification;
};

/**
 * Marquer une notification comme non lue
 */
exports.markAsUnread = async ({ notificationId }) => {
  const notification = await exports.getNotificationById({ notificationId });

  notification.statut = "pending";
  notification.readAt = null;
  await notification.save();

  return notification;
};

/**
 * Supprimer une notification
 */
exports.deleteNotification = async ({ notificationId }) => {
  const notification = await exports.getNotificationById({ notificationId });

  notification.statut = "deleted";
  await notification.save();

  return notification;
};

/**
 * Supprimer définitivement une notification (hard delete)
 */
exports.hardDeleteNotification = async ({ notificationId }) => {
  const notification = await exports.getNotificationById({ notificationId });
  await notification.destroy();
};

/**
 * Compter les notifications non lues
 */
exports.getUnreadCount = async ({ userId }) => {
  const count = await Notification.count({
    where: { userId, statut: "pending" }
  });

  return count;
};

/**
 * Récupérer les préférences de notification d'un utilisateur
 */
exports.getNotificationPreferences = async ({ userId }) => {
  let prefs = await NotificationPreference.findOne({
    where: { userId }
  });

  // Créer les préférences par défaut si elles n'existent pas
  if (!prefs) {
    prefs = await NotificationPreference.create({ userId });
  }

  return prefs;
};

/**
 * Mettre à jour les préférences de notification
 */
exports.updateNotificationPreferences = async ({ userId, data }) => {
  const allowedFields = [
    "emailEnabled",
    "inAppEnabled",
    "pushEnabled",
    "preferredLanguage",
    "notificationFrequency"
  ];

  const updateData = {};
  allowedFields.forEach((field) => {
    if (data[field] !== undefined) {
      updateData[field] = data[field];
    }
  });

  let prefs = await NotificationPreference.findOne({
    where: { userId }
  });

  if (!prefs) {
    prefs = await NotificationPreference.create({ userId, ...updateData });
  } else {
    Object.assign(prefs, updateData);
    await prefs.save();
  }

  return prefs;
};
