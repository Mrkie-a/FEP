// Global variables to store our app data
let MONTHLY_BUDGET = 10000;
let expenses = [];
let toastTimer;

// Get elements from the HTML page
const form = document.getElementById('expenseForm');
const descInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const categoryInput = document.getElementById('category');

const expenseBody = document.getElementById('expenseBody');
const expenseTable = document.getElementById('expenseTable');
const emptyState = document.getElementById('emptyState');

const searchInput = document.getElementById('searchInput');
const clearAllBtn = document.getElementById('clearAllBtn');

const themeToggle = document.getElementById('themeToggle');
const themeLabel = document.getElementById('themeLabel');
const toast = document.getElementById('toast');

// Dashboard summary elements
const budgetDisplay = document.getElementById('budgetDisplay');
const totalSpentEl = document.getElementById('totalSpent');
const remainingBalEl = document.getElementById('remainingBalance');
const expenseCountEl = document.getElementById('expenseCount');
const progressFill = document.getElementById('progressFill');
const progressPercent = document.getElementById('progressPercent');

// Error message elements
const descError = document.getElementById('descError');
const amountError = document.getElementById('amountError');

// Format number to Philippine Peso display
function formatMoney(value) {
    return "₱" + value.toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// Format date and time nicely
function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-PH') + " " + d.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' });
}

// Generate a random unique ID for each expense row
function makeId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
}

// Show a popup notification message for 3 seconds
function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');

    if (toastTimer) clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Calculate the totals and update the main dashboard figures
function updateDashboard() {
    let total = 0;

    // Use a standard for-loop to calculate total spending
    for (let i = 0; i < expenses.length; i++) {
        total += expenses[i].amount;
    }

    let remaining = MONTHLY_BUDGET - total;
    let percent = MONTHLY_BUDGET > 0 ? (total / MONTHLY_BUDGET) * 100 : 0;

    if (percent > 100) percent = 100;

    // Display values onto the webpage
    budgetDisplay.textContent = formatMoney(MONTHLY_BUDGET);
    totalSpentEl.textContent = formatMoney(total);
    remainingBalEl.textContent = formatMoney(remaining);
    expenseCountEl.textContent = expenses.length;

    progressFill.style.width = percent + "%";
    progressPercent.textContent = percent.toFixed(1) + "%";

    // Change progress bar color to red if it goes over 80%
    if (percent > 80) {
        progressFill.classList.add('danger');
    } else {
        progressFill.classList.remove('danger');
    }

    // Change text color to red if over budget
    if (remaining < 0) {
        remainingBalEl.style.color = "#ef4444";
    } else {
        remainingBalEl.style.color = "";
    }
}

// Display the list of expenses inside the table
function renderTable(filterText = "") {
    expenseBody.innerHTML = "";

    // Filter the items matching the search input bar
    let filtered = expenses.filter(item => {
        return item.description.toLowerCase().includes(filterText.toLowerCase()) || item.category.toLowerCase().includes(filterText.toLowerCase());
    });

    // Show empty state message if no rows exist
    if (filtered.length === 0) {
        emptyState.style.display = "flex";
        expenseTable.style.display = "none";
        return;
    }

    emptyState.style.display = "none";
    expenseTable.style.display = "table";

    // Loop through the items and build the table rows
    filtered.forEach((e, idx) => {
        let row = document.createElement("tr");

        // We build the layout structure here
        row.innerHTML = `
            <td><span class="td-index">${idx + 1}</span></td>
            <td class="expense-title-cell"></td>
            <td><span class="category-badge">${e.category}</span></td>
            <td><span class="td-amount">${formatMoney(e.amount)}</span></td>
            <td><span class="td-date">${formatDate(e.date)}</span></td>
            <td>
                <button class="btn-delete" data-id="${e.id}" aria-label="Delete entry">
                    🗑 Delete
                </button>
            </td>
        `;

        // STUDENT-FRIENDLY SECURITY: 
        // We inject the user description safely into the empty cell using .textContent
        // This lets us delete the advanced 'escapeHtml' function entirely!
        row.querySelector('.expense-title-cell').textContent = e.description;

        expenseBody.appendChild(row);
    });
}

// Check if the input form fields are empty or invalid
function validate() {
    let desc = descInput.value.trim();
    let amount = parseFloat(amountInput.value);
    let isValid = true;

    descError.textContent = "";
    amountError.textContent = "";
    descInput.classList.remove('invalid');
    amountInput.classList.remove('invalid');

    if (desc === "") {
        descError.textContent = "Description cannot be empty.";
        descInput.classList.add('invalid');
        isValid = false;
    }

    if (isNaN(amount) || amount <= 0) {
        amountError.textContent = "Please enter a valid amount greater than 0.";
        amountInput.classList.add('invalid');
        isValid = false;
    }

    return isValid;
}

// Event Handler: Add a brand new expense item
function addExpense(e) {
    e.preventDefault(); // Stop page reload

    if (!validate()) return;

    let newExpense = {
        id: makeId(),
        description: descInput.value.trim(),
        amount: parseFloat(amountInput.value),
        category: categoryInput.value,
        date: new Date().toISOString()
    };

    expenses.push(newExpense);
    form.reset();

    renderTable(searchInput.value);
    updateDashboard();
    showToast("Saved!");
}

// Event Handler: Delete an individual expense item
function deleteExpense(id) {
    expenses = expenses.filter(e => e.id !== id);

    renderTable(searchInput.value);
    updateDashboard();
    showToast("Data Erased.");
}

// Event Handler: Clear the entire dashboard log list
function clearAll() {
    if (expenses.length === 0) return;
    if (!confirm("Are you sure you want to clear all expenses?")) return;

    expenses = [];
    renderTable();
    updateDashboard();
    showToast("All expenses cleared.");
}

// Event Handler: Change UI design styles
function toggleTheme() {
    if (themeToggle.checked) {
        document.body.classList.add("theme-savings");
        document.body.classList.remove("theme-bank");
        themeLabel.textContent = "Savings Mode";
    } else {
        document.body.classList.add("theme-bank");
        document.body.classList.remove("theme-savings");
        themeLabel.textContent = "Bank Mode";
    }
}

// Event Handler: Run search filtering on key input
function search() {
    renderTable(searchInput.value);
}

// Event Handler: Save new monthly budget limit changes
function saveBudget() {
    let value = parseFloat(budgetInput.value);

    if (isNaN(value) || value <= 0) {
        alert("Please enter a valid budget amount.");
        return;
    }

    MONTHLY_BUDGET = value;
    updateDashboard();
    budgetInput.value = ""; 
    showToast("Budget updated!");
}

// Listeners to connect user interaction to our functions
form.addEventListener("submit", addExpense);
clearAllBtn.addEventListener("click", clearAll);
themeToggle.addEventListener("change", toggleTheme);
searchInput.addEventListener("input", search);
saveBudgetBtn.addEventListener("click", saveBudget);

expenseBody.addEventListener("click", function (e) {
    if (e.target.classList.contains("btn-delete")) {
        deleteExpense(e.target.dataset.id);
    }
});

// App Startup initialization
function init() {
    updateDashboard();
    renderTable();
}
init();