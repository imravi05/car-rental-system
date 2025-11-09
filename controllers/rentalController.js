const db = require('../config/database');
const crypto = require('crypto'); // To create unique IDs

// --- CREATE (Add Rental / Book a Car) ---
// POST /api/rentals
exports.addRental = (req, res) => {
  const { customerId, carId, rentalStartDate, rentalEndDate } = req.body;

  if (!customerId || !carId || !rentalStartDate || !rentalEndDate) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const newRental = {
    id: `rent_${crypto.randomUUID()}`,
    customerId,
    carId,
    rentalStartDate,
    rentalEndDate,
    status: 'active' // Default status
  };

  // --- Transaction ---
  // We need to do two things: 1) Create the rental, 2) Update the car's status
  // A transaction ensures that if one fails, both are rolled back.
  db.serialize(() => {
    // Start the transaction
    db.run("BEGIN TRANSACTION");

    // 1. Check if the car is available first
    const checkSql = "SELECT status FROM cars WHERE id = ? AND status = 'available'";
    db.get(checkSql, [carId], (err, row) => {
      if (err) {
        db.run("ROLLBACK");
        return res.status(500).json({ message: 'Error checking car status', error: err.message });
      }
      if (!row) {
        db.run("ROLLBACK");
        return res.status(409).json({ message: 'Car is not available for rent' });
      }

      // 2. Insert the new rental
      const insertSql = `
        INSERT INTO rentals (id, customerId, carId, rentalStartDate, rentalEndDate, status)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      const insertParams = [newRental.id, newRental.customerId, newRental.carId, newRental.rentalStartDate, newRental.rentalEndDate, newRental.status];

      db.run(insertSql, insertParams, function (err) {
        if (err) {
          db.run("ROLLBACK");
          return res.status(500).json({ message: 'Error creating rental', error: err.message });
        }

        // 3. Update the car's status to 'rented'
        const updateSql = "UPDATE cars SET status = 'rented' WHERE id = ?";
        db.run(updateSql, [carId], function (err) {
          if (err) {
            db.run("ROLLBACK");
            return res.status(500).json({ message: 'Error updating car status', error: err.message });
          }

          // If all steps succeeded, commit the transaction
          db.run("COMMIT");
          res.status(201).json(newRental);
        });
      });
    });
  });
};

// --- READ (Get All Rentals) ---
// GET /api/rentals
// We use JOINs to get useful data from other tables
exports.getAllRentals = (req, res) => {
  const sql = `
    SELECT 
      r.id, r.rentalStartDate, r.rentalEndDate, r.status,
      c.fullName AS customerName,
      car.make, car.model, car.licensePlate
    FROM rentals r
    JOIN customers c ON r.customerId = c.id
    JOIN cars car ON r.carId = car.id
  `;
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching rentals', error: err.message });
    }
    res.json(rows);
  });
};

// --- READ (Get Single Rental) ---
// GET /api/rentals/:id
exports.getRentalById = (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT 
      r.id, r.rentalStartDate, r.rentalEndDate, r.status,
      c.id AS customerId, c.fullName AS customerName, c.email AS customerEmail,
      car.id AS carId, car.make, car.model, car.licensePlate
    FROM rentals r
    JOIN customers c ON r.customerId = c.id
    JOIN cars car ON r.carId = car.id
    WHERE r.id = ?
  `;

  db.get(sql, [id], (err, row) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching rental', error: err.message });
    }
    if (!row) {
      return res.status(404).json({ message: 'Rental not found' });
    }
    res.json(row);
  });
};

// --- UPDATE (Complete or Cancel a Rental) ---
// PUT /api/rentals/:id
// This is used to change a rental's status (e.g., from 'active' to 'completed')
exports.updateRental = (req, res) => {
  const { id } = req.params;
  const { status, rentalEndDate, carId } = req.body; // We need carId to update the car

  if (!status || !carId) {
     return res.status(400).json({ message: 'Missing required fields: status, carId' });
  }

  // If the rental is being marked 'completed' or 'cancelled', set the car back to 'available'
  if (status === 'completed' || status === 'cancelled') {
    db.serialize(() => {
      db.run("BEGIN TRANSACTION");

      // 1. Update the rental
      const updateRentalSql = "UPDATE rentals SET status = ?, rentalEndDate = ? WHERE id = ?";
      db.run(updateRentalSql, [status, rentalEndDate, id], function(err) {
        if (err) {
          db.run("ROLLBACK");
          return res.status(500).json({ message: 'Error updating rental status', error: err.message });
        }
        if (this.changes === 0) {
          db.run("ROLLBACK");
          return res.status(404).json({ message: 'Rental not found' });
        }

        // 2. Update the car's status back to 'available'
        const updateCarSql = "UPDATE cars SET status = 'available' WHERE id = ?";
        db.run(updateCarSql, [carId], function(err) {
          if (err) {
            db.run("ROLLBACK");
            return res.status(500).json({ message: 'Error setting car to available', error: err.message });
          }
          
          db.run("COMMIT");
          res.status(200).json({ message: `Rental ${status} and car set to available` });
        });
      });
    });
  } else {
    // If just updating other details (e.g., changing end date)
    const sql = "UPDATE rentals SET status = ?, rentalEndDate = ? WHERE id = ?";
    db.run(sql, [status, rentalEndDate, id], function (err) {
      if (err) {
        return res.status(500).json({ message: 'Error updating rental', error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ message: 'Rental not found' });
      }
      res.status(200).json({ message: 'Rental updated' });
    });
  }
};

// --- DELETE (Remove Rental) ---
// DELETE /api/rentals/:id
// (Note: In a real system, you should CANCEL a rental, not delete it.
// This is here to complete the 'D' in CRUD.)
exports.deleteRental = (req, res) => {
  const { id } = req.params;
  
  // We first need to find which car this rental was for
  db.get("SELECT carId FROM rentals WHERE id = ?", [id], (err, row) => {
    if (err) {
      return res.status(500).json({ message: 'Error finding rental', error: err.message });
    }
    if (!row) {
      return res.status(404).json({ message: 'Rental not found' });
    }

    const { carId } = row;

    // Now, delete the rental and set the car to 'available' in a transaction
    db.serialize(() => {
      db.run("BEGIN TRANSACTION");

      const deleteSql = "DELETE FROM rentals WHERE id = ?";
      db.run(deleteSql, [id], function (err) {
        if (err) {
          db.run("ROLLBACK");
          return res.status(500).json({ message: 'Error deleting rental', error: err.message });
        }

        const updateCarSql = "UPDATE cars SET status = 'available' WHERE id = ?";
        db.run(updateCarSql, [carId], (err) => {
          if (err) {
            db.run("ROLLBACK");
            return res.status(500).json({ message: 'Error setting car to available', error: err.message });
          }

          db.run("COMMIT");
          res.status(200).json({ message: 'Rental removed and car set to available' });
        });
      });
    });
  });
};