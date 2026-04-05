const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
dotenv.config();

const sequelize = new Sequelize(process.env.DATABASE_URL || 'postgres://postgres:password@localhost:5432/talentbridge_db', {
  dialect: 'postgres',
  logging: false, // Mettre à console.log pour voir les requêtes SQL
});

module.exports = sequelize;