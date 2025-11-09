const express = require('express');
const router = express.Router();
const carController = require('../controllers/carController');

// GET / (which becomes /api/cars/)
router.get('/', carController.getAllCars);

// POST / (which becomes /api/cars/)
router.post('/', carController.addCar);

// GET /:id (which becomes /api/cars/:id)
router.get('/:id', carController.getCarById);

// PUT /:id (which becomes /api/cars/:id)
router.put('/:id', carController.updateCar);

// DELETE /:id (which becomes /api/cars/:id)
router.delete('/:id', carController.removeCar);

module.exports = router;