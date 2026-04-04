const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// Modèle Sequelize représentant une candidature d'un étudiant à une offre.
const Application = sequelize.define(
  "Application",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

    offerId: { type: DataTypes.INTEGER, allowNull: false },

    // Identifiant utilisateur côté auth-service (l'étudiant).
    studentUserId: { type: DataTypes.INTEGER, allowNull: false },

    // pending / accepted / rejected
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: "pending" }
  },
  {
    tableName: "applications",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    paranoid: true,
    deletedAt: "deleted_at",
    indexes: [
      { fields: ["offerId"] },
      { fields: ["studentUserId"] }
      ,
      // Contrôle métier: un étudiant ne peut postuler qu'une seule fois à une offre.
      { unique: true, fields: ["offerId", "studentUserId"], name: "application_unique_offer_student" }
    ],
  }
);

module.exports = Application;

