const sequelize = require("../config/db");
const Notification = require("./Notification");
const NotificationPreference = require("./NotificationPreference");

// Associations (si nécessaire pour les futures joins)
// Pour l'instant, Notification et NotificationPreference sont indépendants

module.exports = {
  sequelize,
  Notification,
  NotificationPreference
};
