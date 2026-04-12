const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Experience = sequelize.define(
  "Experience",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    poste: { type: DataTypes.STRING, allowNull: false },
    entreprise: { type: DataTypes.STRING, allowNull: false },
    dateDebut: { type: DataTypes.DATEONLY, allowNull: false },
    dateFin: { type: DataTypes.DATEONLY, allowNull: true },
    description: { type: DataTypes.TEXT, allowNull: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    tableName: "experiences",
    timestamps: true,
  }
);

module.exports = Experience;
