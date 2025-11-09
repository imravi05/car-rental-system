const express = require('express');
const cors = require('cors');
const config = require('./config');
// REMOVED: const mainRoutes = require('./routes');
require('./config/database'); // This initializes the database connection

// --- Import routes directly ---
const customerRoutes = require('./routes/customerRoutes');
// You will add more routes here later, like:
 const carRoutes = require('./routes/carRoutes');
 const rentalRoutes = require('./routes/rentalRoutes');

const app = express();

// --- Middleware ---
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse incoming JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// --- Routes ---
// REMOVED: app.use(mainRoutes);

// --- Use routes directly with their prefixes ---
app.use('/api/customers', customerRoutes);
// You will add more routes here later, like:
 app.use('/api/cars', carRoutes);
 app.use('/api/rentals', rentalRoutes);
    
app.get('/', (req, res) => {
  res.send('Car Rental System API is running!');
});

// --- Start Server ---
app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);
});