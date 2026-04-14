const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Entreprise = sequelize.define(
  "Entreprise",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    nomEntreprise: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    secteur: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    adresse: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    ville: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    pays: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },
    siteWeb: {
      type: DataTypes.STRING(2000),
      allowNull: true,
    },
    logo: {
      type: DataTypes.STRING(2000),
      allowNull: true,
    },
    telephone: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    typeCompteEntreprise: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "entreprises",
    timestamps: true,
  }
);

module.exports = Entreprise;
