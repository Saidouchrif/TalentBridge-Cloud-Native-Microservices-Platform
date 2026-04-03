const express = require('express');
const router = express.Router();
const applicationController = require('../Controllers/applicationController');

// POST   /applications
router.post('/', applicationController.createApplication);

// GET    /applications?candidateId=&jobId=&status=
router.get('/', applicationController.getApplications);

// GET    /applications/:id
router.get('/:id', applicationController.getApplicationById);

// PATCH  /applications/:id/status
router.patch('/:id/status', applicationController.updateApplicationStatus);

// DELETE /applications/:id
router.delete('/:id', applicationController.deleteApplication);

module.exports = router;
