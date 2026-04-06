const { DataTypes } = require('sequelize');
<<<<<<< HEAD
const sequelize = require('../config/database');

const Application = sequelize.define('Application', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  jobId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  fullName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true,
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  resumeUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  coverLetter: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  candidateId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'REVIEWING', 'ACCEPTED', 'REJECTED'),
    defaultValue: 'PENDING',
  }
}, {
  tableName: 'applications',
  timestamps: true,
});

module.exports = Application;
=======
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
>>>>>>> b955a41bdc8111f7a93e78bc679344b7d7d789e8
