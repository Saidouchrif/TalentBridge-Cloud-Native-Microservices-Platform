const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Job = sequelize.define(
  'Job',
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: false },
    company: { type: DataTypes.STRING, allowNull: false },
    location: { type: DataTypes.STRING, allowNull: true },
    description: { type: DataTypes.TEXT, allowNull: false },
    contractType: { type: DataTypes.STRING, allowNull: true },
    salary: { type: DataTypes.STRING, allowNull: true },
  },
  {
    tableName: 'jobs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at',
  }
);

module.exports = Job;
