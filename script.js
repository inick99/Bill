function addRecord(productName, description, date, price, quantity, id) {
    // Calculate amount
    const amount = price * quantity;

    // Create the record object
    const record = {
        Id: id || Date.now(), // Use provided ID or generate a new one
        ProductName: productName,
        Description: description,
        Date: date,
        Price: price,
        Quantity: quantity,
        Amount: amount
    };

    // Retrieve existing records from local storage or initialize an empty array
    let records = JSON.parse(localStorage.getItem('productRecords')) || [];

    // If updating, find and replace the existing record
    if (id) {
        records = records.map(r => r.Id === id ? record : r);
    } else {
        // Add the new record to the records array
        records.push(record);
    }
    // Validate form fields
    if (!productName || !description || !date || !price || !quantity) {
        alert('Please fill in all required fields.');
        return; // Do not proceed if validation fails
    }

    // Save the updated records array back to local storage
    localStorage.setItem('productRecords', JSON.stringify(records));

    // Refresh the records display
    displayRecords();
}

function submitForm() {
    // Get form values
    const productName = document.getElementById('productName').value;
    const description = document.getElementById('description').value;
    const date = document.getElementById('date').value;
    const price = parseFloat(document.getElementById('price').value);
    const quantity = parseFloat(document.getElementById('quantity').value);
    const id = document.getElementById('editId').value ? Number(document.getElementById('editId').value) : null; // Convert to number

    // Add or update record
    addRecord(productName, description, date, price, quantity, id);

    // Reset the form
    document.getElementById('productForm').reset();
    document.getElementById('editId').value = '';

    // Set form to the last record's values (if any)
    setFormToLastRecord();
}

function setFormToLastRecord() {
    // Retrieve existing records from local storage
    const records = JSON.parse(localStorage.getItem('productRecords')) || [];

    if (records.length > 0) {
        const lastRecord = records[records.length - 1];
        document.getElementById('productName').value = lastRecord.ProductName || 'Diesel'; // default value if not provided
        document.getElementById('description').value = lastRecord.Description || '';
        document.getElementById('date').value = lastRecord.Date || '';
        document.getElementById('price').value = lastRecord.Price != null ? lastRecord.Price : '';
        document.getElementById('quantity').value = lastRecord.Quantity != null ? lastRecord.Quantity : '';
    } else {
        // Set default values if no records exist
        document.getElementById('productName').value = 'Diesel';
        document.getElementById('description').value = '';
        document.getElementById('date').value = '';
        document.getElementById('price').value = '';
        document.getElementById('quantity').value = '';
    }
}

function deleteRecord(id) {
    // Retrieve existing records from local storage
    let records = JSON.parse(localStorage.getItem('productRecords')) || [];

    // Filter out the record to delete
    records = records.filter(record => record.Id !== id);

    // Save the updated records array back to local storage
    localStorage.setItem('productRecords', JSON.stringify(records));

    // Refresh the records display
    displayRecords();
}

function editRecord(id) {
    // Retrieve existing records from local storage
    let records = JSON.parse(localStorage.getItem('productRecords')) || [];
    const record = records.find(record => record.Id === id);

    // Populate form with the record data
    document.getElementById('productName').value = record.ProductName;
    document.getElementById('description').value = record.Description;
    document.getElementById('date').value = record.Date;
    document.getElementById('price').value = record.Price;
    document.getElementById('quantity').value = record.Quantity;
    document.getElementById('editId').value = record.Id;
}
// Function to convert JSON data to CSV
function jsonToCSV(json) {
    const fields = ["ProductName", "Description", "Date", "Price", "Quantity", "Amount"];
    const replacer = (key, value) => (value === null ? '' : value);
    const csv = json.map(row => fields.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','));
    csv.unshift(fields.join(',')); // add header column
    return csv.join('\r\n');
}

// Function to download CSV
function downloadCSV() {
    const records = JSON.parse(localStorage.getItem('productRecords')) || [];
    const csv = jsonToCSV(records);
    navigator.clipboard.writeText(csv)
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");

    if (link.download !== undefined) { // feature detection
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "product_records.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}
function displayRecords() {
    // Retrieve existing records from local storage
    const records = JSON.parse(localStorage.getItem('productRecords')) || [];

    // Get the records container
    const container = document.getElementById('recordsContainer');

    // Clear existing cards
    container.innerHTML = '';

    // Initialize grand total
    let grandTotal = 0;

    // Insert new cards
    records.forEach(record => {
        const card = document.createElement('div');
        card.className = 'card';

        // Check if record.Quantity is valid and use toFixed, otherwise set a default value
        const quantityText = record.Quantity != null ? record.Quantity.toFixed(2) : 'N/A';

        // Check if record.Price is valid and use toFixed, otherwise set a default value
        const priceText = record.Price != null ? record.Price.toFixed(2) : 'N/A';

        // Check if record.Amount is valid and use toFixed, otherwise set a default value
        const amountText = record.Amount != null ? record.Amount.toFixed(2) : 'N/A';

        // Update grand total
        if (record.Amount != null) {
            grandTotal += record.Amount;
        }

        // Display the card content
        card.innerHTML = `
            <h3>${record.Description}</h3>
            <p><strong>Description:</strong> ${record.ProductName}</p>
            <p><strong>Date:</strong> ${record.Date}</p>
            <p><strong>Price:</strong> ₹${priceText}</p>
            <p><strong>Quantity:</strong> ${quantityText}</p>
            <p><strong>Amount:</strong> ₹${amountText}</p>
            <div class="card-actions">
                <button class="edit" onclick="editRecord(${record.Id})">Edit</button>
                <button class="delete" onclick="deleteRecord(${record.Id})">Delete</button>
            </div>
        `;

        container.appendChild(card);
    });

    // Update the grand total display
    document.getElementById('grandTotal').textContent = grandTotal.toFixed(2);

    // Set form to the last record's values (if any)
    setFormToLastRecord();
}
function clearAllData() {
    if (confirm('Are you sure you want to delete all records? This action cannot be undone.')) {
        localStorage.clear();
        displayRecords(); // Refresh the display to show that the records are gone
    }
}
// Initial display of records
displayRecords();