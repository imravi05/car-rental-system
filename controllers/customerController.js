const db = require('../config/database');
const crypto = require('crypto'); // To create unique IDs

// --- CREATE (Add Customer) ---
exports.addCustomer = (req, res) => {
  const { fullName, email, phone, driversLicenseId, dateOfBirth } = req.body;
  if (!fullName || !email || !driversLicenseId) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  const newCustomer = {
    id: `cust_${crypto.randomUUID()}`,
    fullName, email, phone, driversLicenseId, dateOfBirth
  };

  const sql = `INSERT INTO customers (id, fullName, email, phone, driversLicenseId, dateOfBirth) VALUES (?, ?, ?, ?, ?, ?)`;
  const params = [newCustomer.id, newCustomer.fullName, newCustomer.email, newCustomer.phone, newCustomer.driversLicenseId, newCustomer.dateOfBirth];

  db.run(sql, params, function (err) {
    if (err) {
      if (err.code === 'SQLITE_CONSTRAINT') {
        return res.status(409).json({ message: 'Error: Email or Driver\'s License already exists.' });
      }
      return res.status(500).json({ message: 'Error saving customer', error: err.message });
    }
    res.status(201).json(newCustomer);
  });
};

// --- READ (Get All Customers) ---
exports.getAllCustomers = (req, res) => {
  const sql = "SELECT * FROM customers";
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching customers', error: err.message });
    }
    res.json(rows);
  });
};

// --- READ (Get Single Customer) ---
exports.getCustomerById = (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM customers WHERE id = ?";

  db.get(sql, [id], (err, row) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching customer', error: err.message });
    }
    if (!row) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json(row);
  });
};

// --- UPDATE (Edit Customer) ---
exports.updateCustomer = (req, res) => {
  const { id } = req.params;
  const { fullName, email, phone, driversLicenseId, dateOfBirth } = req.body;

  const sql = `
    UPDATE customers
    SET fullName = ?, email = ?, phone = ?, driversLicenseId = ?, dateOfBirth = ?
    WHERE id = ?
  `;
  const params = [fullName, email, phone, driversLicenseId, dateOfBirth, id];

  db.run(sql, params, function (err) {
    if (err) {
      if (err.code === 'SQLITE_CONSTRAINT') {
        return res.status(409).json({ message: 'Error: Email or Driver\'s License already exists.' });
      }
      return res.status(500).json({ message: 'Error updating customer', error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.status(200).json({ message: 'Customer updated successfully' });
  });
};

// --- DELETE (Remove Customer) ---
exports.removeCustomer = (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM customers WHERE id = ?";

  db.run(sql, [id], function (err) {
    if (err) {
      return res.status(500).json({ message: 'Error deleting customer', error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.status(200).json({ message: 'Customer removed successfully' });
  });
};