const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

/**
 * Modèle Notification
 * Représente une notification (email, in-app, push)
 * Indexed sur userId et dateCreation pour performance
 */
const Notification = sequelize.define(
  "Notification",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      index: true // Index pour requêtes rapides par utilisateur
    },
    type: {
      type: DataTypes.ENUM(
        "registration",      // Confirmation inscription
        "profile_update",     // Mise à jour profil
        "new_offer",          // Nouvelle offre
        "application_status", // Statut candidature
        "admin_alert",        // Alerte admin
        "document_generated", // Document généré
        "message",            // Message général
        "event"               // Événement
      ),
      allowNull: false,
      defaultValue: "message"
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    canal: {
      type: DataTypes.ENUM("email", "in-app", "push"),
      allowNull: false,
      defaultValue: "in-app"
    },
    statut: {
      type: DataTypes.ENUM("pending", "sent", "read", "deleted"),
      allowNull: false,
      defaultValue: "pending"
    },
    relatedEntityId: {
      type: DataTypes.INTEGER,
      allowNull: true, // ID de l'offre, candidature, etc.
    },
    relatedEntityType: {
      type: DataTypes.STRING,
      allowNull: true, // 'offer', 'application', 'profile', etc.
    },
    priority: {
      type: DataTypes.ENUM("low", "normal", "high", "critical"),
      allowNull: false,
      defaultValue: "normal"
    },
    readAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    sentAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      index: true // Index pour tri par date
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    tableName: "notifications",
    timestamps: true,
    indexes: [
      { fields: ["userId", "createdAt"] }, // Composite index pour list récentes
      { fields: ["statut"] } // Index pour filtrer par statut
    ]
  }
);

module.exports = Notification;
