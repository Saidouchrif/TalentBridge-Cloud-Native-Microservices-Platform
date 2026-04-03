const { Document, DocumentHistory } = require('../Models');

async function addHistory(documentId, action, actor, details) {
  await DocumentHistory.create({ documentId, action, actor: actor || null, details: details || null });
}

exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'File is required' });
    }

    const { candidateId, type, uploadedBy } = req.body;
    const docType = type || 'OTHER';

    const document = await Document.create({
      candidateId: candidateId || null,
      name: req.file.originalname,
      type: docType,
      mimeType: req.file.mimetype,
      size: req.file.size,
      storagePath: req.file.path,
      uploadedBy: uploadedBy || null,
      status: 'ACTIVE',
    });

    await addHistory(document.id, 'UPLOADED', uploadedBy, {
      name: document.name,
      type: document.type,
      size: document.size,
    });

    res.status(201).json(document);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDocuments = async (req, res) => {
  try {
    const where = req.query.candidateId ? { candidateId: req.query.candidateId } : undefined;
    const documents = await Document.findAll({ where, order: [['id', 'DESC']] });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDocumentById = async (req, res) => {
  try {
    const document = await Document.findByPk(req.params.id);
    if (!document) return res.status(404).json({ message: 'Document not found' });
    res.json(document);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateDocumentStatus = async (req, res) => {
  try {
    const { status, actor } = req.body;
    if (!status) return res.status(400).json({ message: 'status is required' });

    const document = await Document.findByPk(req.params.id);
    if (!document) return res.status(404).json({ message: 'Document not found' });

    const previousStatus = document.status;
    document.status = status;
    await document.save();

    await addHistory(document.id, 'STATUS_UPDATED', actor, {
      from: previousStatus,
      to: status,
    });

    res.json(document);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDocumentHistory = async (req, res) => {
  try {
    const document = await Document.findByPk(req.params.id);
    if (!document) return res.status(404).json({ message: 'Document not found' });

    const history = await DocumentHistory.findAll({
      where: { documentId: document.id },
      order: [['id', 'DESC']],
    });

    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
