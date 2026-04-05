const express = require('express');
const router = express.Router();
const JobController = require('../Controllers/JobController');

router.get('/', JobController.getAllJobs);
router.get('/:id', JobController.getJobById);

module.exports = router;
