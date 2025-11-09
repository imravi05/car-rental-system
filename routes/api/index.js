const express = require('express');
const router = express.Router();

// Import and use customer routes
router.use('/customers', require('./customerRoutes'));

// --- Add other routes here later ---
// router.use('/cars', require('./carRoutes'));
// router.use('/rentals', require('./rentalRoutes'));

module.exports = router;
