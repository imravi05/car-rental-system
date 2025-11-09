// Define the base URL for your API
const API_URL = 'http://localhost:3000/api';

// --- Main function that runs when the page loads ---
document.addEventListener('DOMContentLoaded', () => {
    // Load all data on startup
    refreshAllData();

    // Add event listeners for the three forms
    document.getElementById('add-customer-form').addEventListener('submit', handleAddCustomer);
    document.getElementById('add-car-form').addEventListener('submit', handleAddCar);
    document.getElementById('create-rental-form').addEventListener('submit', handleCreateRental);
    
    // Add a single listener for the "Complete" buttons (event delegation)
    document.getElementById('rental-list').addEventListener('click', (event) => {
        if (event.target.classList.contains('button-complete')) {
            handleCompleteRental(event);
        }
    });
});

/**
 * A helper function to refresh all data on the dashboard.
 * Call this after any C, U, or D operation.
 */
function refreshAllData() {
    loadDashboardStats();
    loadRecentCustomers();
    loadCarList();
    populateRentalDropdowns(); // <-- NEW
    loadRentalsList();        // <-- NEW
}

/**
 * Fetches data from all endpoints to populate the top stat cards.
 */
async function loadDashboardStats() {
    try {
        const [customerRes, carRes, rentalRes] = await Promise.all([
            fetch(`${API_URL}/customers`),
            fetch(`${API_URL}/cars`),
            fetch(`${API_URL}/rentals`)
        ]);
        const customers = await customerRes.json();
        const cars = await carRes.json();
        const rentals = await rentalRes.json();

        document.getElementById('stat-total-customers').textContent = customers.length;
        const availableCars = cars.filter(car => car.status === 'available').length;
        document.getElementById('stat-available-cars').textContent = availableCars;
        const activeRentals = rentals.filter(rental => rental.status === 'active').length;
        document.getElementById('stat-active-rentals').textContent = activeRentals;
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}

/**
 * Fetches customers for the "Recent Customers" list.
 */
async function loadRecentCustomers() {
    try {
        const response = await fetch(`${API_URL}/customers`);
        const customers = await response.json();
        const customerList = document.getElementById('customer-list');
        customerList.innerHTML = ''; 

        if (customers.length === 0) {
            customerList.innerHTML = '<li>No customers found.</li>';
            return;
        }
        customers.slice(0, 5).forEach(customer => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span class="customer-name">${customer.fullName}</span>
                <span class="customer-email">${customer.email}</span>
            `;
            customerList.appendChild(li);
        });
    } catch (error) {
        console.error('Error loading recent customers:', error);
        document.getElementById('customer-list').innerHTML = '<li>Error loading data.</li>';
    }
}

/**
 * Fetches cars for the "Car Inventory" list.
 */
async function loadCarList() {
    try {
        const response = await fetch(`${API_URL}/cars`);
        const cars = await response.json();
        const carList = document.getElementById('car-list');
        carList.innerHTML = ''; 

        if (cars.length === 0) {
            carList.innerHTML = '<li>No cars found. Add one!</li>';
            return;
        }
        cars.forEach(car => {
            const li = document.createElement('li');
            li.className = 'car-item';
            li.innerHTML = `
                <div class="car-info">
                    <span class="car-name">${car.year} ${car.make} ${car.model}</span>
                    <span class="car-license">${car.licensePlate}</span>
                </div>
                <span class="car-status ${car.status.toLowerCase()}">${car.status}</span>
            `;
            carList.appendChild(li);
        });
    } catch (error) {
        console.error('Error loading car list:', error);
        document.getElementById('car-list').innerHTML = '<li>Error loading data.</li>';
    }
}

/**
 * Handles the "Add Customer" form submission.
 */
async function handleAddCustomer(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const customerData = Object.fromEntries(formData.entries());

    try {
        const response = await fetch(`${API_URL}/customers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(customerData)
        });
        if (!response.ok) throw new Error((await response.json()).message);
        form.reset();
        refreshAllData(); // Refresh everything
    } catch (error) {
        console.error('Error adding customer:', error);
        alert(`Error: ${error.message}`);
    }
}

/**
 * Handles the "Add Car" form submission.
 */
async function handleAddCar(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const carData = Object.fromEntries(formData.entries());

    try {
        const response = await fetch(`${API_URL}/cars`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(carData)
        });
        if (!response.ok) throw new Error((await response.json()).message);
        form.reset();
        refreshAllData(); // Refresh everything
    } catch (error) {
        console.error('Error adding car:', error);
        alert(`Error: ${error.message}`);
    }
}


// --- NEW FUNCTIONS FOR RENTALS ---

/**
 * Fetches customers and cars to populate the <select> dropdowns in the rental form.
 */
async function populateRentalDropdowns() {
    try {
        // Fetch customers
        const [customerRes, carRes] = await Promise.all([
            fetch(`${API_URL}/customers`),
            fetch(`${API_URL}/cars`)
        ]);
        const customers = await customerRes.json();
        const cars = await carRes.json();

        const customerSelect = document.getElementById('rental-customer');
        customerSelect.innerHTML = '<option value="">-- Select a Customer --</option>'; // Placeholder
        customers.forEach(cust => {
            customerSelect.innerHTML += `<option value="${cust.id}">${cust.fullName}</option>`;
        });

        // Filter for ONLY available cars
        const availableCars = cars.filter(car => car.status === 'available');
        const carSelect = document.getElementById('rental-car');
        carSelect.innerHTML = '<option value="">-- Select an Available Car --</option>'; // Placeholder
        availableCars.forEach(car => {
            carSelect.innerHTML += `<option value="${car.id}">${car.year} ${car.make} ${car.model} (${car.licensePlate})</option>`;
        });

    } catch (error) {
        console.error('Error populating dropdowns:', error);
    }
}

/**
 * Fetches active rentals and displays them in the "Active Rentals" list.
 */
async function loadRentalsList() {
    try {
        const response = await fetch(`${API_URL}/rentals`);
        const rentals = await response.json();
        
        const rentalList = document.getElementById('rental-list');
        rentalList.innerHTML = '';

        const activeRentals = rentals.filter(r => r.status === 'active');

        if (activeRentals.length === 0) {
            rentalList.innerHTML = '<li>No active rentals.</li>';
            return;
        }

        activeRentals.forEach(async rental => {
            const li = document.createElement('li');
            li.className = 'rental-item';
            
            // Get carId and endDate for the button
            const carId = rental.carId || (await (await fetch(`${API_URL}/rentals/${rental.id}`)).json()).carId;
            const endDate = new Date(rental.rentalEndDate).toISOString().split('T')[0];
            
            li.innerHTML = `
                <div class="rental-info">
                    <span class="rental-customer-car">${rental.customerName} - ${rental.make} ${rental.model}</span>
                    <span class="rental-dates">${new Date(rental.rentalStartDate).toLocaleDateString()} to ${new Date(rental.rentalEndDate).toLocaleDateString()}</span>
                </div>
                <button class="button-complete" 
                        data-rental-id="${rental.id}" 
                        data-car-id="${carId}"
                        data-end-date="${endDate}">
                    Mark Complete
                </button>
            `;
            rentalList.appendChild(li);
        });
    } catch (error) {
        console.error('Error loading rentals:', error);
        rentalList.innerHTML = '<li>Error loading rentals.</li>';
    }
}

/**
 * Handles the "Create a Rental" form submission.
 */
async function handleCreateRental(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const rentalData = Object.fromEntries(formData.entries());

    try {
        const response = await fetch(`${API_URL}/rentals`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(rentalData)
        });
        if (!response.ok) throw new Error((await response.json()).message);
        
        form.reset();
        refreshAllData(); // Refresh everything
        
    } catch (error) {
        console.error('Error creating rental:', error);
        alert(`Error: ${error.message}`);
    }
}

/**
 * Handles clicking the "Mark Complete" button on a rental.
 */
async function handleCompleteRental(event) {
    const button = event.target;
    const rentalId = button.dataset.rentalId;
    const carId = button.dataset.carId;
    const rentalEndDate = button.dataset.endDate;

    if (!confirm('Are you sure you want to mark this rental as complete?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/rentals/${rentalId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                status: 'completed',
                carId: carId,
                rentalEndDate: rentalEndDate
            })
        });
        
        if (!response.ok) throw new Error((await response.json()).message);

        refreshAllData(); // Refresh everything

    } catch (error) {
        console.error('Error completing rental:', error);
        alert(`Error: ${error.message}`);
    }
}