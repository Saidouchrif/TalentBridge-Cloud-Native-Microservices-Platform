const sequelize = require('../config/database');
const Application = require('./Application');
const Job = require('./Job');

// Définition des relations
Application.belongsTo(Job, { foreignKey: 'jobId', as: 'job' });
Job.hasMany(Application, { foreignKey: 'jobId', as: 'applications' });

// Synchronisation avec la base de données PostgreSQL
sequelize.sync({ alter: true })
  .then(() => console.log('📦 Database & tables synced successfully!'))
  .catch((err) => console.error('❌ Error syncing database:', err));

module.exports = { sequelize, Application, Job };