const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const DocumentHistory = sequelize.define(
  'DocumentHistory',
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    documentId: { type: DataTypes.INTEGER, allowNull: false },
    action: { type: DataTypes.STRING, allowNull: false },
    actor: { type: DataTypes.STRING, allowNull: true },
    details: { type: DataTypes.JSONB, allowNull: true },
  },
  {
    tableName: 'document_history',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  }
);

module.exports = DocumentHistory;
