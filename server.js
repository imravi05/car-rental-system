const express = require('express');
const cors = require('cors');
const config = require('./config');
const mainRoutes = require('./routes');
require('./config/database'); // This initializes the database connection

const app = express();

// --- Middleware ---
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse incoming JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// --- Routes ---
app.use(mainRoutes);
    
app.get('/', (req, res) => {
  res.send('Car Rental System API is running!');
});

// --- Start Server ---
app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);
});