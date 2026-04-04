const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// Modèle Sequelize représentant une offre de stage publiée par une entreprise.
const Offer = sequelize.define(
  "Offer",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

    enterpriseId: { type: DataTypes.INTEGER, allowNull: false },

    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },

    // Compétences requises: on stocke un tableau en JSON.
    // `DataTypes.JSON` est suffisamment compatible (PostgreSQL + SQLite).
    requiredSkills: { type: DataTypes.JSON, allowNull: true },

    // Localisation: pour rester simple, on utilise une chaîne.
    location: { type: DataTypes.STRING, allowNull: true },

    // Statut de l'offre (published / closed / draft).
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: "published" },

    publishedAt: { type: DataTypes.DATE, allowNull: true }
  },
  {
    tableName: "offers",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    paranoid: true,
    deletedAt: "deleted_at",
    indexes: [
      { fields: ["enterpriseId"] },
      { fields: ["status"] }
    ]
  }
);

module.exports = Offer;

