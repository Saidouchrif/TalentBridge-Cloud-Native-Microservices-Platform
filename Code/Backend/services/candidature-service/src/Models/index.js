const sequelize = require('../config/database');
const Application = require('./Application');
const Document = require('./Document');

// Exemple de relation future pour l'utilisateur
// Document.belongsTo(User, { foreignKey: 'candidateId' });

// Synchronisation avec la base de données PostgreSQL
sequelize.sync({ alter: true })
  .then(() => console.log('📦 Database & tables synced successfully!'))
  .catch((err) => console.error('❌ Error syncing database:', err));

module.exports = { sequelize, Application, Document };