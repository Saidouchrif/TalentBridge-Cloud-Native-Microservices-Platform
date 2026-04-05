const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true,},

  email: {type: DataTypes.STRING,allowNull: false,unique: true,},

  password: {type: DataTypes.STRING,allowNull: false,},
  
  role: {type: DataTypes.STRING,defaultValue: 'user',},
}, 
{tableName: 'users', timestamps: true, createdAt: 'created_at',updatedAt: 'updated_at',
paranoid: true,deletedAt: 'deleted_at'
});

module.exports = User;