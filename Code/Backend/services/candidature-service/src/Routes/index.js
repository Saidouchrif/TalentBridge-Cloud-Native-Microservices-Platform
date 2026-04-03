const express = require('express');
const router = express.Router();

const applicationRoutes = require('./applicationRoutes');
const jobRoutes = require('./jobRoutes');

router.use('/applications', applicationRoutes);
router.use('/jobs', jobRoutes);

module.exports = router;
