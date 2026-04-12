const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Competence = sequelize.define(
  "Competence",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nom: { type: DataTypes.STRING, allowNull: false },
    niveau: { type: DataTypes.STRING, allowNull: false },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    tableName: "competences",
    timestamps: true,
  }
);

module.exports = Competence;
