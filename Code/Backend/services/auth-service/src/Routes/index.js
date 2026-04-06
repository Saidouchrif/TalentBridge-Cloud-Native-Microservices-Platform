const express = require('express');
const router = express.Router();

const authRoutes = require('./AuthRoute');
<<<<<<< HEAD

router.use('/auth', authRoutes);
=======
const jobRoutes = require('./JobRoute');
const applicationRoutes = require('./ApplicationRoute');
const documentRoutes = require('./DocumentRoute');

router.use('/auth', authRoutes);
router.use('/jobs', jobRoutes);
router.use('/applications', applicationRoutes);
router.use('/documents', documentRoutes);
>>>>>>> b955a41bdc8111f7a93e78bc679344b7d7d789e8

module.exports = router;