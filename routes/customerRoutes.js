const express = require('express');
const router = express.Router();
// FIX: The path to the controller is now one level up
const customerController = require('../controllers/customerController');

// GET / (which becomes /api/customers/)
router.get('/', customerController.getAllCustomers);

// POST / (which becomes /api/customers/)
router.post('/', customerController.addCustomer);

// GET /:id (which becomes /api/customers/:id)
router.get('/:id', customerController.getCustomerById);

// PUT /:id (which becomes /api/customers/:id)
router.put('/:id', customerController.updateCustomer);

// DELETE /:id (which becomes /api/customers/:id)
router.delete('/:id', customerController.removeCustomer);

module.exports = router;