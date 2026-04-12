const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Formation = sequelize.define(
  "Formation",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    etablissement: { type: DataTypes.STRING, allowNull: false },
    diplome: { type: DataTypes.STRING, allowNull: false },
    dateDebut: { type: DataTypes.DATEONLY, allowNull: false },
    dateFin: { type: DataTypes.DATEONLY, allowNull: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    tableName: "formations",
    timestamps: true,
  }
);

module.exports = Formation;
