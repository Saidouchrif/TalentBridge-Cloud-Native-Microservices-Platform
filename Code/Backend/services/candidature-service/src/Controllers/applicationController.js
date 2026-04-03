const { Application, Job } = require('../Models');

const ALLOWED_STATUS = ['PENDING', 'REVIEWING', 'ACCEPTED', 'REJECTED'];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizePayload(app, job) {
  const json = app.toJSON ? app.toJSON() : app;
  const j = job || json.job || null;
  return {
    id: json.id,
    jobId: json.jobId,
    fullName: json.fullName,
    email: json.email,
    phone: json.phone,
    resumeUrl: json.resumeUrl,
    coverLetter: json.coverLetter,
    candidateId: json.candidateId,
    status: json.status,
    createdAt: json.created_at || json.createdAt,
    updatedAt: json.updated_at || json.updatedAt,
    jobTitle: j?.title ?? json.jobTitle ?? null,
    company: j?.company ?? json.company ?? null,
    location: j?.location ?? json.location ?? null,
  };
}

// POST /applications
exports.createApplication = async (req, res) => {
  try {
    const { jobId, fullName, email, phone, resumeUrl, coverLetter, candidateId } = req.body;

    if (!jobId || !fullName || !email || !coverLetter) {
      return res.status(400).json({
        message: 'Champs requis : offre (jobId), nom complet, email et lettre de motivation.',
      });
    }

    const trimmedEmail = String(email).trim().toLowerCase();
    if (!EMAIL_RE.test(trimmedEmail)) {
      return res.status(400).json({ message: 'Adresse email invalide.' });
    }

    const parsedJobId = Number(jobId);
    if (!Number.isInteger(parsedJobId) || parsedJobId < 1) {
      return res.status(400).json({ message: "Identifiant d'offre invalide." });
    }

    const job = await Job.findByPk(parsedJobId);
    if (!job) {
      return res.status(404).json({ message: 'Offre introuvable.' });
    }

    const existing = await Application.findOne({
      where: { jobId: parsedJobId, email: trimmedEmail },
    });
    if (existing) {
      return res.status(409).json({
        message: 'Vous avez déjà postulé à cette offre avec cet email.',
      });
    }

    const application = await Application.create({
      jobId: parsedJobId,
      fullName: String(fullName).trim(),
      email: trimmedEmail,
      phone: phone ? String(phone).trim() : null,
      resumeUrl: resumeUrl ? String(resumeUrl).trim() : null,
      coverLetter: String(coverLetter).trim(),
      candidateId: candidateId ? String(candidateId).trim() : null,
      status: 'PENDING',
    });

    res.status(201).json(normalizePayload(application, job));
  } catch (error) {
    console.error('[createApplication]', error);
    res.status(500).json({ message: error.message });
  }
};

// GET /applications
exports.getApplications = async (req, res) => {
  try {
    const { candidateId, jobId, status } = req.query;
    const where = {};
    if (candidateId) where.candidateId = candidateId;
    if (jobId) where.jobId = Number(jobId);
    if (status) where.status = String(status).toUpperCase();

    const applications = await Application.findAll({
      where,
      include: [{ model: Job, as: 'job', attributes: ['id', 'title', 'company', 'location'] }],
      order: [['id', 'DESC']],
    });

    const items = applications.map((item) => normalizePayload(item, item.job));
    res.json(items);
  } catch (error) {
    console.error('[getApplications]', error);
    res.status(500).json({ message: error.message });
  }
};

// GET /applications/:id
exports.getApplicationById = async (req, res) => {
  try {
    const application = await Application.findByPk(req.params.id, {
      include: [{ model: Job, as: 'job', attributes: ['id', 'title', 'company', 'location'] }],
    });
    if (!application) {
      return res.status(404).json({ message: 'Candidature introuvable.' });
    }
    res.json(normalizePayload(application, application.job));
  } catch (error) {
    console.error('[getApplicationById]', error);
    res.status(500).json({ message: error.message });
  }
};

// PATCH /applications/:id/status
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !ALLOWED_STATUS.includes(String(status).toUpperCase())) {
      return res.status(400).json({
        message: `Statut invalide. Valeurs possibles : ${ALLOWED_STATUS.join(', ')}.`,
      });
    }

    const application = await Application.findByPk(id, {
      include: [{ model: Job, as: 'job', attributes: ['id', 'title', 'company', 'location'] }],
    });
    if (!application) {
      return res.status(404).json({ message: 'Candidature introuvable.' });
    }

    application.status = String(status).toUpperCase();
    await application.save();

    res.json(normalizePayload(application, application.job));
  } catch (error) {
    console.error('[updateApplicationStatus]', error);
    res.status(500).json({ message: error.message });
  }
};

// DELETE /applications/:id
exports.deleteApplication = async (req, res) => {
  try {
    const application = await Application.findByPk(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Candidature introuvable.' });
    }
    await application.destroy();
    res.json({ message: 'Candidature supprimée avec succès.' });
  } catch (error) {
    console.error('[deleteApplication]', error);
    res.status(500).json({ message: error.message });
  }
};
