function addRecord(productName, description, billno, date, price, quantity, id) {
    // Calculate amount
    const amount = price * quantity;

    // Create the record object
    const record = {
        Id: id || Date.now(), // Use provided ID or generate a new one
        ProductName: productName,
        Description: description,
        Billno: billno,
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
    if (!productName || !description || !billno|| !date || !price || !quantity) {
        alert('Please fill in all required fields.');
        return; // Do not proceed if validation fails
    }

    // Save the updated records array back to local storage
    localStorage.setItem('productRecords', JSON.stringify(records));

    // Refresh the records display
    displayRecords();
}

function showAlert(message, type) {
    const alertBox = document.getElementById('alertMessage');
    alertBox.className = `alert alert-${type}`;
    alertBox.textContent = message;
    alertBox.style.display = 'block';

    // Automatically hide the alert after 3 seconds
    setTimeout(() => {
        alertBox.style.display = 'none';
    }, 3000);
}

function submitForm() {
    // Get form values
    const productName = document.getElementById('productName').value;
    const description = document.getElementById('description').value;
    const billno = document.getElementById('billno').value;
    const date = document.getElementById('date').value;
    const price = parseFloat(document.getElementById('price').value);
    const quantity = parseFloat(document.getElementById('quantity').value);
    const id = document.getElementById('editId').value ? Number(document.getElementById('editId').value) : null; // Convert to number

    // Add or update record
    const isUpdate = !!id;
    addRecord(productName, description, billno, date, price, quantity, id);

    // Reset the form
    document.getElementById('productForm').reset();
    document.getElementById('editId').value = '';

    // Set form to the last record's values (if any)
    setFormToLastRecord();

    // Show success message
    showAlert(isUpdate ? 'Record updated successfully!' : 'Record added successfully!', 'success');
}

function setFormToLastRecord() {
    // Retrieve existing records from local storage
    const records = JSON.parse(localStorage.getItem('productRecords')) || [];

    if (records.length > 0) {
        const lastRecord = records[records.length - 1];
        document.getElementById('productName').value = lastRecord.ProductName || 'Diesel'; // default value if not provided
        document.getElementById('description').value = lastRecord.Description || '';
        document.getElementById('billno').value = lastRecord.Billno || '';
        document.getElementById('date').value = lastRecord.Date || '';
        document.getElementById('price').value = lastRecord.Price != null ? lastRecord.Price : '';
        document.getElementById('quantity').value = lastRecord.Quantity != null ? lastRecord.Quantity : '';
    } else {
        // Set default values if no records exist
        document.getElementById('productName').value = 'Diesel';
        document.getElementById('description').value = '';
        document.getElementById('billno').value = '';
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

    // Show delete message
    showAlert('Record deleted successfully!', 'danger');
}

function editRecord(id) {
    // Retrieve existing records from local storage
    let records = JSON.parse(localStorage.getItem('productRecords')) || [];
    const record = records.find(record => record.Id === id);

    // Populate form with the record data
    document.getElementById('productName').value = record.ProductName;
    document.getElementById('description').value = record.Description;
    document.getElementById('billno').value = record.Billno;
    document.getElementById('date').value = record.Date;
    document.getElementById('price').value = record.Price;
    document.getElementById('quantity').value = record.Quantity;
    document.getElementById('editId').value = record.Id;

    // Show an alert message indicating that the record is being edited
    showAlert('Editing record: ' + record.Description, 'info');
}

// Function to convert JSON data to CSV
function jsonToCSV(json) {
    const fields = ["ProductName", "Description", "Billno", "Date", "Price", "Quantity", "Amount"];
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
        // Display alert message after file download
        showAlert('File downloaded successfully!', 'success');
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

        // Ensure record.Quantity is a number before using toFixed
        const quantityText = typeof record.Quantity === 'number' ? record.Quantity.toFixed(2) : 'N/A';

        // Ensure record.Billno is a number before using toFixed
        const billnoText = typeof record.Billno === 'number' ? record.Billno.toFixed(2) : 'N/A';

        // Ensure record.Price is a number before using toFixed
        const priceText = typeof record.Price === 'number' ? record.Price.toFixed(2) : 'N/A';

        // Ensure record.Amount is a number before using toFixed
        const amountText = typeof record.Amount === 'number' ? record.Amount.toFixed(2) : 'N/A';

        // Update grand total
        if (typeof record.Amount === 'number') {
            grandTotal += record.Amount;
        }

        // Display the card content
        card.innerHTML = `
            <h3>${record.Description}</h3>
            <p><strong>Product:</strong> ${record.ProductName}</p>
            <p><strong>Bill No:</strong> ${billnoText}</p>
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

        // Show clear all message
        showAlert('All records deleted!', 'warning');
    }
}

// Initial display of records
displayRecords();
