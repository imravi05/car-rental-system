const express = require('express');
const router = express.Router();
const rentalController = require('../controllers/rentalController');

// POST / (which becomes /api/rentals/)
router.post('/', rentalController.addRental);

// GET / (which becomes /api/rentals/)
router.get('/', rentalController.getAllRentals);

// GET /:id (which becomes /api/rentals/:id)
router.get('/:id', rentalController.getRentalById);

// PUT /:id (which becomes /api/rentals/:id)
router.put('/:id', rentalController.updateRental);

// DELETE /:id (which becomes /api/rentals/:id)
router.delete('/:id', rentalController.deleteRental);

module.exports = router;