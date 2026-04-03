const express = require('express');
const router = express.Router();

const authRoutes = require('./AuthRoute');
const jobRoutes = require('./JobRoute');
const applicationRoutes = require('./ApplicationRoute');
const documentRoutes = require('./DocumentRoute');

router.use('/auth', authRoutes);
router.use('/jobs', jobRoutes);
router.use('/applications', applicationRoutes);
router.use('/documents', documentRoutes);

module.exports = router;