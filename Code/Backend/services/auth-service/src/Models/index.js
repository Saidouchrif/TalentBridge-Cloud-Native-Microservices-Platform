const User = require('./User');
const Job = require('./Job');
const Application = require('./Application');
const Document = require('./Document');
const DocumentHistory = require('./DocumentHistory');

Job.hasMany(Application, { foreignKey: 'jobId', as: 'applications' });
Application.belongsTo(Job, { foreignKey: 'jobId', as: 'job' });
Document.hasMany(DocumentHistory, { foreignKey: 'documentId', as: 'history' });
DocumentHistory.belongsTo(Document, { foreignKey: 'documentId', as: 'document' });

module.exports = {
  User,
  Job,
  Application,
  Document,
  DocumentHistory,
};