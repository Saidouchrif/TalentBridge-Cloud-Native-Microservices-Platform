const { Job } = require('../Models');

async function ensureSeedJob() {
  const count = await Job.count();
  if (count === 0) {
    await Job.create({
      title: 'Developpeur Full Stack',
      company: 'TalentBridge',
      location: 'Remote',
      description:
        "Nous cherchons un profil Full Stack pour renforcer notre equipe cloud-native.",
    });
  }
}

exports.getAllJobs = async (req, res) => {
  try {
    await ensureSeedJob();
    const jobs = await Job.findAll({ order: [['id', 'DESC']] });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getJobById = async (req, res) => {
  try {
    await ensureSeedJob();
    const job = await Job.findByPk(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
