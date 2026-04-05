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
    const job = await Job.findByPk(parsedJobId);
    if (!job) return res.status(404).json({ message: 'Offre introuvable.' });

    const existing = await Application.findOne({
      where: { jobId: parsedJobId, email: trimmedEmail },
    });
    if (existing) return res.status(409).json({ message: 'Vous avez déjà postulé à cette offre avec cet email.' });

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
    res.status(500).json({ message: error.message });
  }
};

exports.getApplications = async (req, res) => {
  try {
    const { candidateId } = req.query;
    const where = candidateId ? { candidateId } : undefined;
    const applications = await Application.findAll({
      where,
      include: [{ model: Job, as: 'job', attributes: ['id', 'title', 'company', 'location'] }],
      order: [['id', 'DESC']],
    });
    res.json(applications.map((item) => normalizePayload(item, item.job)));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Les endpoints updateApplicationStatus et getApplicationById 
// sont supposés être implémentés ici similairement à votre code d'origine.