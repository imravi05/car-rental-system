// Define the base URL for your API
const API_URL = 'http://localhost:3000/api';

// --- Main function that runs when the page loads ---
document.addEventListener('DOMContentLoaded', () => {
    // Load all the dynamic data
    loadDashboardStats();
    loadRecentCustomers();
    loadCarList(); // <-- ADD THIS

    // Add event listeners for the forms
    document.getElementById('add-customer-form').addEventListener('submit', handleAddCustomer);
    document.getElementById('add-car-form').addEventListener('submit', handleAddCar); // <-- ADD THIS
});

/**
 * Fetches data from all endpoints to populate the top stat cards.
 */
async function loadDashboardStats() {
    try {
        // Fetch all data in parallel
        const [customerRes, carRes, rentalRes] = await Promise.all([
            fetch(`${API_URL}/customers`),
            fetch(`${API_URL}/cars`),
            fetch(`${API_URL}/rentals`)
        ]);

        const customers = await customerRes.json();
        const cars = await carRes.json();
        const rentals = await rentalRes.json();

        // Update "Total Customers" card
        document.getElementById('stat-total-customers').textContent = customers.length;

        // Update "Available Cars" card
        const availableCars = cars.filter(car => car.status === 'available').length;
        document.getElementById('stat-available-cars').textContent = availableCars;

        // Update "Active Rentals" card
        const activeRentals = rentals.filter(rental => rental.status === 'active').length;
        document.getElementById('stat-active-rentals').textContent = activeRentals;

    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}

/**
 * Fetches the list of customers and displays them in the "Recent Customers" list.
 */
async function loadRecentCustomers() {
    try {
        const response = await fetch(`${API_URL}/customers`);
        const customers = await response.json();

        const customerList = document.getElementById('customer-list');
        customerList.innerHTML = ''; // Clear the "Loading..." text

        if (customers.length === 0) {
            customerList.innerHTML = '<li>No customers found.</li>';
            return;
        }

        // Add each customer to the list
        customers.slice(0, 5).forEach(customer => { // Only show top 5
            const li = document.createElement('li');
            
            const nameSpan = document.createElement('span');
            nameSpan.className = 'customer-name';
            nameSpan.textContent = customer.fullName;

            const emailSpan = document.createElement('span');
            emailSpan.className = 'customer-email';
            emailSpan.textContent = customer.email;
            
            li.appendChild(nameSpan);
            li.appendChild(emailSpan);
            
            customerList.appendChild(li);
        });

    } catch (error) {
        console.error('Error loading recent customers:', error);
        document.getElementById('customer-list').innerHTML = '<li>Error loading data.</li>';
    }
}

/**
 * Handles the "Add Customer" form submission.
 */
async function handleAddCustomer(event) {
    event.preventDefault(); // Prevent page refresh
    const form = event.target;
    const formData = new FormData(form);
    const customerData = Object.fromEntries(formData.entries());

    try {
        const response = await fetch(`${API_URL}/customers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(customerData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to add customer');
        }
        
        form.reset(); // Clear the form
        loadDashboardStats(); // Refresh stats
        loadRecentCustomers(); // Refresh customer list

    } catch (error) {
        console.error('Error adding customer:', error);
        alert(`Error: ${error.message}`);
    }
}


// --- NEW FUNCTIONS FOR CARS ---

/**
 * Fetches the list of cars and displays them in the "Car Inventory" list.
 */
async function loadCarList() {
    try {
        const response = await fetch(`${API_URL}/cars`);
        const cars = await response.json();

        const carList = document.getElementById('car-list');
        carList.innerHTML = ''; // Clear the "Loading..." text

        if (cars.length === 0) {
            carList.innerHTML = '<li>No cars found. Add one!</li>';
            return;
        }

        // Add each car to the list
        cars.forEach(car => {
            const li = document.createElement('li');
            li.className = 'car-item'; // Use new class for flex layout

            // Car info (name, license)
            const infoDiv = document.createElement('div');
            infoDiv.className = 'car-info';
            
            const nameSpan = document.createElement('span');
            nameSpan.className = 'car-name';
            nameSpan.textContent = `${car.year} ${car.make} ${car.model}`;

            const licenseSpan = document.createElement('span');
            licenseSpan.className = 'car-license';
            licenseSpan.textContent = car.licensePlate;
            
            infoDiv.appendChild(nameSpan);
            infoDiv.appendChild(licenseSpan);

            // Car status (Available, Rented, etc.)
            const statusSpan = document.createElement('span');
            // Add classes for styling based on status
            statusSpan.className = `car-status ${car.status.toLowerCase()}`;
            statusSpan.textContent = car.status;
            
            li.appendChild(infoDiv);
            li.appendChild(statusSpan);
            
            carList.appendChild(li);
        });

    } catch (error)
        {
        console.error('Error loading car list:', error);
        document.getElementById('car-list').innerHTML = '<li>Error loading data.</li>';
    }
}

/**
 * Handles the "Add Car" form submission.
 */
async function handleAddCar(event) {
    event.preventDefault(); // Prevent page refresh
    const form = event.target;
    const formData = new FormData(form);
    const carData = Object.fromEntries(formData.entries());

    try {
        const response = await fetch(`${API_URL}/cars`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(carData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to add car');
        }
        
        form.reset(); // Clear the form
        loadDashboardStats(); // Refresh stats (available cars)
        loadCarList(); // Refresh car list

    } catch (error) {
        console.error('Error adding car:', error);
        alert(`Error: ${error.message}`);
    }
}