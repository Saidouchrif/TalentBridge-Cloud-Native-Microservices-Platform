const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const TYPES = ["emploi", "stage"];
const STATUTS = ["actif", "ferm\u00e9"];

const Offre = sequelize.define(
  "Offre",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    titre: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    competencesRequises: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    localisation: {
      type: DataTypes.STRING(300),
      allowNull: false,
    },
    datePublication: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    statut: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "actif",
      validate: {
        isIn: [STATUTS],
      },
    },
    type: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        isIn: [TYPES],
      },
    },
    entreprise_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    salaire: {
      type: DataTypes.STRING(120),
      allowNull: true,
    },
    dateExpiration: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    nombreCandidatures: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: "offres",
    timestamps: true,
  }
);

Offre.TYPES_OFFRE = TYPES;
Offre.STATUTS_OFFRE = STATUTS;
module.exports = Offre;
