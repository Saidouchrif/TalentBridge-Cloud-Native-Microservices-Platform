const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Document = sequelize.define(
  'Document',
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    candidateId: { type: DataTypes.STRING, allowNull: true },
    name: { type: DataTypes.STRING, allowNull: false },
    type: { type: DataTypes.STRING, allowNull: false },
    mimeType: { type: DataTypes.STRING, allowNull: false },
    size: { type: DataTypes.INTEGER, allowNull: false },
    storagePath: { type: DataTypes.STRING, allowNull: false },
    uploadedBy: { type: DataTypes.STRING, allowNull: true },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'ACTIVE' },
  },
  {
    tableName: 'documents',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at',
  }
);

module.exports = Document;
