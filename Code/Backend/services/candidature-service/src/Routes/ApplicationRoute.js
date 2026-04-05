const express = require('express');
const router = express.Router();
const ApplicationController = require('../Controllers/ApplicationController');

router.post('/', ApplicationController.createApplication);
router.get('/', ApplicationController.getApplications);
router.patch('/:id/status', ApplicationController.updateApplicationStatus);
router.get('/:id', ApplicationController.getApplicationById);

module.exports = router;