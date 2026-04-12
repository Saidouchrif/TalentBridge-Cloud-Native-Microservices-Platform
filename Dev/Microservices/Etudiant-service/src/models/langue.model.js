const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Langue = sequelize.define(
  "Langue",
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
    tableName: "langues",
    timestamps: true,
  }
);

module.exports = Langue;
