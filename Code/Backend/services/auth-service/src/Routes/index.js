const express = require('express');
const router = express.Router();

const authRoutes = require('./AuthRoute');

router.use('/auth', authRoutes);

module.exports = router;