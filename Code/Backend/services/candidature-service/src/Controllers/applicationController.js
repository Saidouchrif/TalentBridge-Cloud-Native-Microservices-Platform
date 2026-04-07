const { Application, Document } = require('../Models');

// 1. Créer une nouvelle candidature (POST)
exports.createApplication = async (req, res) => {
  try {
    const newApplication = await Application.create(req.body);
    res.status(201).json(newApplication);
  } catch (error) {
    console.error('Erreur createApplication:', error);
    res.status(500).json({ message: 'Erreur lors de la création de la candidature', error: error.message });
  }
};

// 4. Sauvegarder un document généré par l'IA (POST) (TCNMP-244)
exports.saveDocument = async (req, res) => {
  try {
    const { type, content, candidateId } = req.body;
    const newDocument = await Document.create({ type, content, candidateId });
    res.status(201).json(newDocument);
  } catch (error) {
    console.error('Erreur saveDocument:', error);
    res.status(500).json({ message: 'Erreur lors de la sauvegarde du document', error: error.message });
  }
};

// 5. Récupérer l'historique des documents générés (GET) (TCNMP-245)
exports.getDocumentHistory = async (req, res) => {
  try {
    const documents = await Document.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(documents);
  } catch (error) {
    console.error('Erreur getDocumentHistory:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'historique', error: error.message });
  }
};

// 2. Récupérer toutes les candidatures (GET)
exports.getApplications = async (req, res) => {
  try {
    // On trie par date de création décroissante (les plus récentes en premier)
    const applications = await Application.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(applications);
  } catch (error) {
    console.error('Erreur getApplications:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des candidatures', error: error.message });
  }
};

// 3. Mettre à jour le statut d'une candidature (PATCH)
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const application = await Application.findByPk(id);
    if (!application) {
      return res.status(404).json({ message: 'Candidature introuvable' });
    }
    
    application.status = status;
    await application.save();
    
    res.json(application);
  } catch (error) {
    console.error('Erreur updateStatus:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du statut', error: error.message });
  }
};
