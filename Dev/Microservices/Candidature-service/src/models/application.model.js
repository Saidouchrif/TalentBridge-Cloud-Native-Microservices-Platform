const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const STATUTS = ["en_attente", "accepte", "refuse"];

const Application = sequelize.define(
  "Application",
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
    statut: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: "en_attente",
      validate: {
        isIn: [STATUTS],
      },
    },
    dateCandidature: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    cv_url: {
      type: DataTypes.STRING(2000),
      allowNull: true,
    },
    lettre_url: {
      type: DataTypes.STRING(2000),
      allowNull: true,
    },
  },
  {
    tableName: "applications",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["user_id", "offre_id"],
        name: "uniq_user_offre",
      },
    ],
  }
);

Application.STATUTS = STATUTS;

module.exports = Application;
