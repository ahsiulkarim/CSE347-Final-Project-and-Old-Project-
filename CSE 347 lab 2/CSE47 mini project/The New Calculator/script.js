// --- 1. GETTING REFERENCES TO HTML ELEMENTS ---
const display = document.getElementById('display');
const buttons = document.querySelectorAll('.btn');

// --- 2. ADDING EVENT LISTENERS TO ALL BUTTONS ---
buttons.forEach(function(button) {
    button.addEventListener('click', function() {
        handleButtonClick(button.dataset.value);
    });
});

// --- 3. THE MAIN FUNCTION TO HANDLE CLICKS ---
function handleButtonClick(value) {
    // The logic for parentheses and percent is the same as numbers: just append them.
    // The real magic for percent happens in calculateResult().
    if (value === 'C') {
        clearDisplay();
    } else if (value === '=') {
        calculateResult();
    } else {
        appendToDisplay(value);
    }
}

// --- 4. HELPER FUNCTIONS ---

function appendToDisplay(value) {
    // If the display shows '0' (and the new value isn't a '.'), or shows 'Error', replace it.
    // Otherwise, add to it.
    if ((display.textContent === '0' && value !== '.') || display.textContent === 'Error') {
        display.textContent = value;
    } else {
        display.textContent += value;
    }
}

function clearDisplay() {
    display.textContent = '0';
}

function calculateResult() {
    try {
        // Get the expression from the display.
        let expression = display.textContent;

        // --- NEW ---
        // Replace the '%' symbol with '/100' before evaluating.
        // This is a simple way to implement the percentage functionality.
        // For example, "50%" becomes "50/100", which evaluates to 0.5.
        // The 'g' flag in the regular expression /%/g means "global",
        // so it replaces ALL occurrences of '%' in the string.
        let expressionToEvaluate = expression.replace(/%/g, '/100');

        // Use eval() on the modified expression.
        // eval() calculates the math expression string.
        let result = eval(expressionToEvaluate);
        
        // To avoid issues like 0.1 + 0.2 = 0.30000000000000004
        // we can round the result to a reasonable number of decimal places.
        // Here we round to 10 decimal places.
        result = parseFloat(result.toFixed(10));


        // Display the result
        display.textContent = result;
    } catch (error) {
        // If the expression is invalid (e.g., "5++2" or "(5+2"), show an error.
        display.textContent = 'Error';
    }
}