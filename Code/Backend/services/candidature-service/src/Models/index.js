<<<<<<< HEAD
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
=======
const Job = require('./Job');
const Application = require('./Application');

// Associations
Job.hasMany(Application, { foreignKey: 'jobId', as: 'applications' });
Application.belongsTo(Job, { foreignKey: 'jobId', as: 'job' });

module.exports = {
  Job,
  Application,
};
>>>>>>> b955a41bdc8111f7a93e78bc679344b7d7d789e8
