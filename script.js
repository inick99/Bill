function calculateTotal() {
    const rows = document.querySelectorAll('#recordTable tr');
    let total = Array.from(rows).reduce((sum, row) => {
        const amount = parseFloat(row.cells[5].querySelector('input').value);
        return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
    document.getElementById('totalAmount').innerText = total.toFixed(2);
}

function toggleForm(displayState) {
    document.getElementById('popupForm').style.display = displayState;
    document.getElementById('overlay').style.display = displayState;
}

function openForm() {
    toggleForm('block');
}

function closeForm() {
    toggleForm('none');
}

function addNewRowFromForm() {
    const product = document.getElementById('product').value;
    const description = document.getElementById('description').value.trim();
    const date = document.getElementById('date').value;
    const price = parseFloat(document.getElementById('price').value);
    const quantity = parseInt(document.getElementById('quantity').value);
    const amount = price * quantity;

    if (!product || !description || !date || isNaN(price) || isNaN(quantity)) {
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
        <td><input type="number" value="${price}" readonly></td>
        <td><input type="number" value="${quantity}" readonly></td>
        <td><input type="number" value="${amount.toFixed(2)}" readonly></td>
        <td>
            <button class="btn" onclick="editRow(this)">Edit</button>
            <button class="btn" onclick="deleteRow(this)">Delete</button>
        </td>
    `;
    table.appendChild(newRow);
    calculateTotal();
    updateCookieData({ product, description, date, price, quantity });
    closeForm();
}

function deleteRow(button) {
    const row = button.closest('tr');
    row.remove();
    calculateTotal();
}

function editRow(button) {
    const row = button.closest('tr');
    const inputs = row.querySelectorAll('input, select');

    if (button.textContent === 'Edit') {
        enableRowEditing(inputs);
        button.textContent = 'Save';
    } else {
        disableRowEditing(inputs);
        button.textContent = 'Edit';
        calculateTotal();
    }
}

function enableRowEditing(inputs) {
    inputs.forEach((input, index) => {
        if (index < 5) input.removeAttribute('readonly'); // Exclude the "Amount" field
    });
    inputs[0].removeAttribute('disabled');
    inputs[3].oninput = () => updateAmount(inputs);
    inputs[4].oninput = () => updateAmount(inputs);
}

function disableRowEditing(inputs) {
    inputs.forEach(input => input.setAttribute('readonly', true));
    inputs[0].setAttribute('disabled', true);
}

function updateAmount(inputs) {
    const price = parseFloat(inputs[3].value);
    const quantity = parseInt(inputs[4].value);
    const amount = (price * quantity).toFixed(2);
    inputs[5].value = amount;
    calculateTotal();
}

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

function downloadCSV(csvContent, filename) {
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function updateCookieData({ product, description, date, price, quantity }) {
    setCookie('lastProduct', product);
    setCookie('lastDescription', description);
    setCookie('lastDate', date);
    setCookie('lastPrice', price);
    setCookie('lastQuantity', quantity);
}

function setCookie(name, value) {
    const date = new Date();
    date.setTime(date.getTime() + (365 * 24 * 60 * 60 * 1000)); // Set expiration for 1 year
    const expires = "expires=" + date.toUTCString();
    document.cookie = `${name}=${value};${expires};path=/`;
}
