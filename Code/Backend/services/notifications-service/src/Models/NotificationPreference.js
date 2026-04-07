const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

/**
 * Modèle NotificationPreference
 * Préférences utilisateur pour les notifications
 */
const NotificationPreference = sequelize.define(
  "NotificationPreference",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true
    },
    emailEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    inAppEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    pushEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    preferredLanguage: {
      type: DataTypes.ENUM("fr", "en"),
      allowNull: false,
      defaultValue: "fr"
    },
    notificationFrequency: {
      type: DataTypes.ENUM("immediate", "daily_summary", "weekly_summary"),
      allowNull: false,
      defaultValue: "immediate"
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    tableName: "notification_preferences",
    timestamps: true
  }
);

module.exports = NotificationPreference;
