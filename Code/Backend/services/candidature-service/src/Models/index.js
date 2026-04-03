const Job = require('./Job');
const Application = require('./Application');

// Associations
Job.hasMany(Application, { foreignKey: 'jobId', as: 'applications' });
Application.belongsTo(Job, { foreignKey: 'jobId', as: 'job' });

module.exports = {
  Job,
  Application,
};
