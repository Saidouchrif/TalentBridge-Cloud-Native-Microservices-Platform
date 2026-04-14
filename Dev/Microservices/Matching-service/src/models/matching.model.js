const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

/**
 * Aucune contrainte FK : user_id et offre_id sont des entiers de reference uniquement.
 */
const Matching = sequelize.define(
  "Matching",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    offre_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
        max: 100,
      },
    },
  },
  {
    tableName: "matchings",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

module.exports = Matching;
