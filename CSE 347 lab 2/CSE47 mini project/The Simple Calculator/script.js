// --- 1. GETTING REFERENCES TO HTML ELEMENTS ---
const display = document.getElementById('display');
// querySelectorAll gets ALL elements that match the selector, returning a list (NodeList).
const buttons = document.querySelectorAll('.btn');

// --- 2. ADDING EVENT LISTENERS TO ALL BUTTONS ---
// We loop through each button in our 'buttons' list.
// The `forEach` loop is a clean way to do something for every item in a list.
// (This is a more advanced loop than the 'for' loop in Section 6.3, but very common)
buttons.forEach(function(button) {
    button.addEventListener('click', function() {
        // 'button.dataset.value' gets the value from the 'data-value' attribute in our HTML.
        handleButtonClick(button.dataset.value);
    });
});

// --- 3. THE MAIN FUNCTION TO HANDLE CLICKS ---
function handleButtonClick(value) {
    if (value === 'C') {
        // If 'C' (Clear) is clicked, reset the display.
        clearDisplay();
    } else if (value === '=') {
        // If '=' is clicked, calculate the result.
        calculateResult();
    } else {
        // For any other button (numbers, operators), add its value to the display.
        appendToDisplay(value);
    }
}

// --- 4. HELPER FUNCTIONS ---

// This function adds a value to the display screen.
function appendToDisplay(value) {
    // If the display currently shows '0' or 'Error', replace it. Otherwise, add to it.
    if (display.textContent === '0' || display.textContent === 'Error') {
        display.textContent = value;
    } else {
        display.textContent += value;
    }
}

// This function clears the display and sets it back to '0'.
function clearDisplay() {
    display.textContent = '0';
}

// This is where the calculation happens.
function calculateResult() {
    // We use a try...catch block to handle potential errors.
    // For example, if the user enters "5 * / 2", it's not a valid calculation
    // and would cause an error. The catch block prevents the app from crashing.
    // (Relates to Section 13: Error Handling)
    try {
        // 'eval()' is a powerful but potentially dangerous JavaScript function.
        // It takes a string and executes it as code. For a simple calculator, it's perfect.
        // It calculates the math expression in our display string.
        let result = eval(display.textContent);

        // Display the result
        display.textContent = result;
    } catch (error) {
        // If an error occurs in the 'try' block, the 'catch' block runs.
        display.textContent = 'Error';
    }
}