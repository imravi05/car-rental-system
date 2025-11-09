const express = require('express');
const router = express.Router();
const customerController = require('../../controllers/customerController');

// GET /api/customers (Get all)
router.get('/', customerController.getAllCustomers);

// POST /api/customers (Create)
router.post('/', customerController.addCustomer);

// GET /api/customers/:id (Get one)
router.get('/:id', customerController.getCustomerById);

// PUT /api/customers/:id (Update)
router.put('/:id', customerController.updateCustomer);

// DELETE /api/customers/:id (Delete)
router.delete('/:id', customerController.removeCustomer);

module.exports = router;