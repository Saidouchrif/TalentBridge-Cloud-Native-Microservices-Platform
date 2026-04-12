const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Etudiant = sequelize.define(
  "Etudiant",
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
    universite: { type: DataTypes.STRING, allowNull: false },
    niveau: { type: DataTypes.STRING, allowNull: false },
    cv: { type: DataTypes.STRING, allowNull: false },
    localisation: { type: DataTypes.STRING, allowNull: false },
  },
  {
    tableName: "etudiants",
    timestamps: true,
  }
);

module.exports = Etudiant;
