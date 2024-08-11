document.addEventListener('DOMContentLoaded', () => {
    loadTableFromLocalStorage();
    calculateTotal();
});

// Function to calculate the total amount
function calculateTotal() {
    const rows = document.querySelectorAll('#recordTable tr');
    let total = Array.from(rows).reduce((sum, row) => {
        const amount = parseFloat(row.cells[5].querySelector('input').value);
        return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
    document.getElementById('totalAmount').innerText = total.toFixed(2);
}

// Function to save the current state of the table to localStorage
function saveTableToLocalStorage() {
    const rows = document.querySelectorAll('#recordTable tr');
    const records = [];

    rows.forEach(row => {
        const product = row.cells[0].querySelector('select').value;
        const description = row.cells[1].querySelector('input').value;
        const date = row.cells[2].querySelector('input').value;
        const price = row.cells[3].querySelector('input').value;
        const quantity = row.cells[4].querySelector('input').value;
        const amount = row.cells[5].querySelector('input').value;

        records.push({ product, description, date, price, quantity, amount });
    });

    localStorage.setItem('records', JSON.stringify(records));
}

// Function to load the table data from localStorage
function loadTableFromLocalStorage() {
    const records = JSON.parse(localStorage.getItem('records')) || [];

    const table = document.getElementById('recordTable');
    records.forEach(record => {
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>
                <select disabled>
                    <option value="Petrol" ${record.product === 'Petrol' ? 'selected' : ''}>Petrol</option>
                    <option value="Diesel" ${record.product === 'Diesel' ? 'selected' : ''}>Diesel</option>
                    <option value="Oil" ${record.product === 'Oil' ? 'selected' : ''}>Oil</option>
                </select>
            </td>
            <td><input type="text" value="${record.description}" readonly></td>
            <td><input type="date" value="${record.date}" readonly></td>
            <td><input type="number" value="${parseFloat(record.price).toFixed(2)}" readonly></td>
            <td><input type="number" value="${parseInt(record.quantity)}" readonly></td>
            <td><input type="number" value="${parseFloat(record.amount).toFixed(2)}" readonly></td>
            <td>
                <button class="btn btn-edit" onclick="editRow(this)">Edit</button>
                <button class="btn btn-delete" onclick="deleteRow(this)">Delete</button>
            </td>
        `;
        table.appendChild(newRow);
    });
}

// Function to add a new row to the table from the form input
function addNewRowFromForm() {
    const product = document.getElementById('product').value;
    const description = document.getElementById('description').value.trim();
    const date = document.getElementById('date').value;
    const price = parseFloat(document.getElementById('price').value);
    const quantity = parseInt(document.getElementById('quantity').value);
    const amount = price * quantity;

    if (!description || isNaN(price) || isNaN(quantity) || !date) {
        alert("Please fill in all fields correctly.");
        return;
    }

    const table = document.getElementById('recordTable');
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td>
            <select disabled>
                <option value="Petrol" ${product === 'Petrol' ? 'selected' : ''}>Petrol</option>
                <option value="Diesel" ${product === 'Diesel' ? 'selected' : ''}>Diesel</option>
                <option value="Oil" ${product === 'Oil' ? 'selected' : ''}>Oil</option>
            </select>
        </td>
        <td><input type="text" value="${description}" readonly></td>
        <td><input type="date" value="${date}" readonly></td>
        <td><input type="number" value="${price.toFixed(2)}" readonly></td>
        <td><input type="number" value="${quantity}" readonly></td>
        <td><input type="number" value="${amount.toFixed(2)}" readonly></td>
        <td>
            <button class="btn btn-edit" onclick="editRow(this)">Edit</button>
            <button class="btn btn-delete" onclick="deleteRow(this)">Delete</button>
        </td>
    `;
    table.appendChild(newRow);
    saveTableToLocalStorage();  // Save data to localStorage
    calculateTotal();
    closeForm();
}

// Function to delete a row from the table
function deleteRow(button) {
    const row = button.closest('tr');
    row.remove();
    saveTableToLocalStorage();  // Save data to localStorage after deletion
    calculateTotal();
}

// Function to edit a row
function editRow(button) {
    const row = button.closest('tr');
    const product = row.cells[0].querySelector('select').value;
    const description = row.cells[1].querySelector('input').value;
    const date = row.cells[2].querySelector('input').value;
    const price = row.cells[3].querySelector('input').value;
    const quantity = row.cells[4].querySelector('input').value;

    // Populate form with current row data
    document.getElementById('product').value = product;
    document.getElementById('description').value = description;
    document.getElementById('date').value = date;
    document.getElementById('price').value = price;
    document.getElementById('quantity').value = quantity;

    // Show form and allow user to edit
    openForm();

    // Remove the current row after editing
    row.remove();
    saveTableToLocalStorage();  // Save data to localStorage after editing
}

// Function to toggle the visibility of the popup form
function toggleForm(displayState) {
    document.getElementById('popupForm').style.display = displayState;
    document.getElementById('overlay').style.display = displayState;
}

// Function to open the popup form
function openForm() {
    toggleForm('block');
}

// Function to close the popup form
function closeForm() {
    toggleForm('none');
}

// Function to export table data to CSV
function exportToCSV() {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Product,Description,Date,Price,Quantity,Amount\n";

    const rows = document.querySelectorAll('#recordTable tr');
    rows.forEach(row => {
        const cols = row.querySelectorAll('select, input');
        const rowData = Array.from(cols).map(col => col.value);
        csvContent += rowData.join(",") + "\n";
    });

    downloadCSV(csvContent, "record_list.csv");
}

// Function to initiate CSV download
function downloadCSV(csvContent, filename) {
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Function to prepare email with CSV content
function prepareEmail() {
    let csvContent = "Product,Description,Date,Price,Quantity,Amount;";

    const rows = document.querySelectorAll('#recordTable tr');
    rows.forEach(row => {
        const cols = row.querySelectorAll('select, input');
        const rowData = Array.from(cols).map(col => col.value);
        csvContent += rowData.join(",") + ";";
    });

    // Replace newline characters with spaces to ensure the CSV fits in the email body
    csvContent = csvContent.replace(/\n/g, ' ');

    // Prepare mailto link
    const email = 'example@email.com';
    const subject = encodeURIComponent('CSV Data');
    const body = encodeURIComponent(csvContent);
    const mailtoLink = `mailto:${email}?subject=${subject}&body=${body}`;

    // Open the default email application with the prefilled mailto link
    window.location.href = mailtoLink;
}