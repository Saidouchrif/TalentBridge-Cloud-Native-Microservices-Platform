const { DataTypes } = require('sequelize');
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