const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const TYPES_DOCUMENT = ["cv", "lettre", "email"];

const Document = sequelize.define(
  "Document",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    type: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        isIn: [TYPES_DOCUMENT],
      },
    },
    contenu: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    dateGeneration: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "documents",
    timestamps: false,
  }
);

Document.TYPES_DOCUMENT = TYPES_DOCUMENT;
module.exports = Document;
