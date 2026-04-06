const { DataTypes } = require('sequelize');
<<<<<<< HEAD
const sequelize = require('../config/database');

const Job = sequelize.define('Job', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  company: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true,
  }
}, { tableName: 'jobs', timestamps: false });

module.exports = Job;
=======
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
>>>>>>> b955a41bdc8111f7a93e78bc679344b7d7d789e8
