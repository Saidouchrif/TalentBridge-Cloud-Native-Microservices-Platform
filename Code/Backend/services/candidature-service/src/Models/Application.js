const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Application = sequelize.define(
  'Application',
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    fullName: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING, allowNull: true },
    resumeUrl: { type: DataTypes.STRING, allowNull: true },
    coverLetter: { type: DataTypes.TEXT, allowNull: false },
    candidateId: { type: DataTypes.STRING, allowNull: true },
    status: {
      type: DataTypes.ENUM('PENDING', 'REVIEWING', 'ACCEPTED', 'REJECTED'),
      allowNull: false,
      defaultValue: 'PENDING',
    },
    jobId: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    tableName: 'applications',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at',
  }
);

module.exports = Application;
