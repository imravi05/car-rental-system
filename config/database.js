const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Define the path for the database file (inside the /data folder)
const DB_PATH = path.join(__dirname, '../data/car_rental.db');

// Create a new database instance
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    // Run the table creation script on startup
    createTables();
  }
});

// Function to create the necessary tables
const createTables = () => {
  db.serialize(() => {
    // 1. Customers Table
    db.run(`
      CREATE TABLE IF NOT EXISTS customers (
        id TEXT PRIMARY KEY,
        fullName TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT,
        driversLicenseId TEXT NOT NULL UNIQUE,
        dateOfBirth TEXT
      )
    `, (err) => {
      if (err) console.error("Error creating customers table", err);
    });

    // 2. Cars Table
    db.run(`
      CREATE TABLE IF NOT EXISTS cars (
        id TEXT PRIMARY KEY,
        make TEXT NOT NULL,
        model TEXT NOT NULL,
        year INTEGER,
        licensePlate TEXT NOT NULL UNIQUE,
        status TEXT NOT NULL DEFAULT 'available' 
      )
    `, (err) => {
      if (err) console.error("Error creating cars table", err);
    });

    // 3. Rentals Table
    db.run(`
      CREATE TABLE IF NOT EXISTS rentals (
        id TEXT PRIMARY KEY,
        customerId TEXT NOT NULL,
        carId TEXT NOT NULL,
        rentalStartDate TEXT NOT NULL,
        rentalEndDate TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'active', 
        FOREIGN KEY (customerId) REFERENCES customers (id),
        FOREIGN KEY (carId) REFERENCES cars (id)
      )
    `, (err) => {
      if (err) console.error("Error creating rentals table", err);
    });

    console.log('Tables checked/created successfully.');
  });
};

// Export the database instance to be used by controllers
module.exports = db;