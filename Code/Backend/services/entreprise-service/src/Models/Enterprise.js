const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// Modèle Sequelize représentant l'entreprise (propriétaire d'offres et de candidatures).
const Enterprise = sequelize.define(
  "Enterprise",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

    // Identifiant utilisateur côté auth-service.
    ownerUserId: { type: DataTypes.INTEGER, allowNull: false },

    name: { type: DataTypes.STRING, allowNull: false },
    sector: { type: DataTypes.STRING, allowNull: true },
    description: { type: DataTypes.TEXT, allowNull: true },

    // Coordonnées (simplifiées pour garder le service autonome).
    
    addressLine1: { type: DataTypes.STRING, allowNull: true },
    city: { type: DataTypes.STRING, allowNull: true },
    postalCode: { type: DataTypes.STRING, allowNull: true },
    country: { type: DataTypes.STRING, allowNull: true },
    phone: { type: DataTypes.STRING, allowNull: true },
    website: { type: DataTypes.STRING, allowNull: true }
  },
  {
    tableName: "enterprises",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    paranoid: true,
    deletedAt: "deleted_at",
    indexes: [
      // On optimise les requêtes courantes: recherche par owner et jointures vers les offres.
      { fields: ["ownerUserId"] },
      { fields: ["name"] }
    ]
  }
);

module.exports = Enterprise;

