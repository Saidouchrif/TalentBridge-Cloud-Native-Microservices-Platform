const express = require('express');
const router = express.Router();
const jobController = require('../Controllers/jobController');

// GET    /jobs
router.get('/', jobController.getJobs);

// GET    /jobs/:id
router.get('/:id', jobController.getJobById);

// POST   /jobs
router.post('/', jobController.createJob);

// PUT    /jobs/:id
router.put('/:id', jobController.updateJob);

// DELETE /jobs/:id
router.delete('/:id', jobController.deleteJob);

module.exports = router;
