const { Job } = require('../Models');

// GET /jobs
exports.getJobs = async (req, res) => {
  try {
    const jobs = await Job.findAll({ order: [['id', 'DESC']] });
    res.json(jobs);
  } catch (error) {
    console.error('[getJobs]', error);
    res.status(500).json({ message: error.message });
  }
};

// GET /jobs/:id
exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Offre introuvable.' });
    }
    res.json(job);
  } catch (error) {
    console.error('[getJobById]', error);
    res.status(500).json({ message: error.message });
  }
};

// POST /jobs
exports.createJob = async (req, res) => {
  try {
    const { title, company, location, description, contractType, salary } = req.body;

    if (!title || !company || !description) {
      return res.status(400).json({
        message: 'Champs requis : titre, entreprise et description.',
      });
    }

    const job = await Job.create({
      title: String(title).trim(),
      company: String(company).trim(),
      location: location ? String(location).trim() : null,
      description: String(description).trim(),
      contractType: contractType ? String(contractType).trim() : null,
      salary: salary ? String(salary).trim() : null,
    });

    res.status(201).json(job);
  } catch (error) {
    console.error('[createJob]', error);
    res.status(500).json({ message: error.message });
  }
};

// PUT /jobs/:id
exports.updateJob = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Offre introuvable.' });
    }

    const { title, company, location, description, contractType, salary } = req.body;
    await job.update({
      title: title ? String(title).trim() : job.title,
      company: company ? String(company).trim() : job.company,
      location: location !== undefined ? String(location).trim() : job.location,
      description: description ? String(description).trim() : job.description,
      contractType: contractType !== undefined ? String(contractType).trim() : job.contractType,
      salary: salary !== undefined ? String(salary).trim() : job.salary,
    });

    res.json(job);
  } catch (error) {
    console.error('[updateJob]', error);
    res.status(500).json({ message: error.message });
  }
};

// DELETE /jobs/:id
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Offre introuvable.' });
    }
    await job.destroy();
    res.json({ message: 'Offre supprimée avec succès.' });
  } catch (error) {
    console.error('[deleteJob]', error);
    res.status(500).json({ message: error.message });
  }
};
