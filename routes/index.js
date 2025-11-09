const express = require('express');
const router = express.Router();

// All API routes will be prefixed with /api
router.use('/api', require('./api'));

module.exports = router;