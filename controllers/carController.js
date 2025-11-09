const db = require('../config/database');
const crypto = require('crypto'); // To create unique IDs

// --- CREATE (Add Car) ---
// POST /api/cars
exports.addCar = (req, res) => {
  const { make, model, year, licensePlate } = req.body;

  // Simple validation
  if (!make || !model || !licensePlate) {
    return res.status(400).json({ message: 'Missing required fields: make, model, licensePlate' });
  }

  const newCar = {
    id: `car_${crypto.randomUUID()}`,
    make,
    model,
    year,
    licensePlate,
    status: 'available' // Default status
  };

  const sql = `
    INSERT INTO cars (id, make, model, year, licensePlate, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const params = [
    newCar.id,
    newCar.make,
    newCar.model,
    newCar.year,
    newCar.licensePlate,
    newCar.status
  ];

  db.run(sql, params, function (err) {
    if (err) {
      if (err.code === 'SQLITE_CONSTRAINT') {
        return res.status(409).json({ message: 'Error: License plate already exists.' });
      }
      return res.status(500).json({ message: 'Error saving car', error: err.message });
    }
    res.status(201).json(newCar);
  });
};

// --- READ (Get All Cars) ---
// GET /api/cars
exports.getAllCars = (req, res) => {
  const sql = "SELECT * FROM cars";
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching cars', error: err.message });
    }
    res.json(rows);
  });
};

// --- READ (Get Single Car) ---
// GET /api/cars/:id
exports.getCarById = (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM cars WHERE id = ?";

  db.get(sql, [id], (err, row) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching car', error: err.message });
    }
    if (!row) {
      return res.status(404).json({ message: 'Car not found' });
    }
    res.json(row);
  });
};

// --- UPDATE (Edit Car) ---
// PUT /api/cars/:id
exports.updateCar = (req, res) => {
  const { id } = req.params;
  // Note: We also include 'status' here so you can change it (e.g., 'rented', 'maintenance')
  const { make, model, year, licensePlate, status } = req.body;

  const sql = `
    UPDATE cars
    SET make = ?, model = ?, year = ?, licensePlate = ?, status = ?
    WHERE id = ?
  `;
  const params = [make, model, year, licensePlate, status, id];

  db.run(sql, params, function (err) {
    if (err) {
      if (err.code === 'SQLITE_CONSTRAINT') {
        return res.status(409).json({ message: 'Error: License plate already exists.' });
      }
      return res.status(500).json({ message: 'Error updating car', error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Car not found' });
    }
    res.status(200).json({ message: 'Car updated successfully' });
  });
};

// --- DELETE (Remove Car) ---
// DELETE /api/cars/:id
exports.removeCar = (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM cars WHERE id = ?";

  db.run(sql, [id], function (err) {
    if (err) {
      return res.status(500).json({ message: 'Error deleting car', error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Car not found' });
    }
    res.status(200).json({ message: 'Car removed successfully' });
  });
};