// --- 1. GETTING REFERENCES TO HTML ELEMENTS ---
// (Relates to Section 10.1 in your manual)

/*

const form = document.getElementById('validation-form');
const username = document.getElementById('username');
const email = document.getElementById('email');
const phone = document.getElementById('phone');
const password = document.getElementById('password');
const confirmPassword = document.getElementById('confirm-password');

const showPasswordCheckbox = document.getElementById('show-password-checkbox');

// --- 2. ADDING THE SUBMIT EVENT LISTENER ---
// We listen for the 'submit' event on the entire form.
// (Relates to Section 11)
form.addEventListener('submit', function(event) {
    // IMPORTANT: This stops the form from submitting and reloading the page.
    // This allows our script to check the inputs first.
    // (Relates to Section 14: Default Action)
    event.preventDefault();

    // Run our main validation function
    validateInputs();
});

// --- START: NEW EVENT LISTENER FOR THE CHECKBOX ---
// We listen for the 'change' event, which fires when a checkbox is checked or unchecked.
showPasswordCheckbox.addEventListener('change', function() {
    // 'this.checked' is a boolean (true or false) that tells us if the checkbox is currently checked.
    if (this.checked) {
        // If it's checked, change the input type from 'password' to 'text'.
        // This makes the characters visible.
        password.type = 'text';
        confirmPassword.type = 'text';
    } else {
        // If it's unchecked, change the type back to 'password'.
        // This hides the characters again.
        password.type = 'password';
        confirmPassword.type = 'password';
    }
});
// --- END: NEW EVENT LISTENER FOR THE CHECKBOX ---


// --- 3. HELPER FUNCTIONS FOR SHOWING ERRORS/SUCCESS ---
// These functions help us visually update the form.

// This function adds the error styles and message.
function showError(inputElement, message) {
    const formControl = inputElement.parentElement; // Gets the parent div (.form-control)
    const errorElement = formControl.querySelector('.error-message');

    formControl.className = 'form-control error'; // Add 'error' class
    errorElement.innerText = message; // Set the error text
}

// This function adds the success styles.
function showSuccess(inputElement) {
    const formControl = inputElement.parentElement;
    formControl.className = 'form-control success'; // Add 'success' class
}


// --- 4. FUNCTIONS FOR SPECIFIC VALIDATION RULES ---

// A simple function to check if an email is in a valid format using a Regular Expression.
// A Regular Expression (RegEx) is a special pattern for matching text.
function isValidEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

// A simple function to check for a common US phone number format.
function isValidPhone(phone) {
    const re = /^\d{11}$/; // Matches XXXXXXXXXX format
    return re.test(phone);
}

// --- 5. THE MAIN VALIDATION FUNCTION ---
// This function runs when the form is submitted.
function validateInputs() {
    // .trim() removes whitespace from both ends of a string.
    const usernameValue = username.value.trim();
    const emailValue = email.value.trim();
    const phoneValue = phone.value.trim();
    const passwordValue = password.value.trim();
    const confirmPasswordValue = confirmPassword.value.trim();

    // --- Validate Username ---
    // (Relates to Section 6.1: Conditional Statements)
    if (usernameValue === '') {
        showError(username, 'Username is required');
    } else {
        showSuccess(username);
    }

    // --- Validate Email ---
    if (emailValue === '') {
        showError(email, 'Email is required');
    } else if (!isValidEmail(emailValue)) {
        showError(email, 'Provide a valid email address');
    } else {
        showSuccess(email);
    }
    
    // --- Validate Phone Number ---
    if (phoneValue === '') {
        showError(phone, 'Phone number is required');
    } else if (!isValidPhone(phoneValue)) {
        showError(phone, 'Phone number must be in 123-456-7890 format');
    } else {
        showSuccess(phone);
    }

    // --- Validate Password ---
    if (passwordValue === '') {
        showError(password, 'Password is required');
    } else if (passwordValue.length < 8) {
        showError(password, 'Password must be at least 8 characters.');
    } else {
        showSuccess(password);
    }

    // --- Validate Confirm Password ---
    if (confirmPasswordValue === '') {
        showError(confirmPassword, 'Please confirm your password');
    } else if (passwordValue !== confirmPasswordValue) {
        showError(confirmPassword, 'Passwords do not match');
    } else {
        // Only show success if the original password is also valid
        if (passwordValue.length >= 8) {
            showSuccess(confirmPassword);
        }
    }
}

*/

// Here is the updated from Goodle AI Studio

// --- 1. GETTING REFERENCES TO HTML ELEMENTS ---
// (Relates to Section 10.1 in your manual)
const form = document.getElementById('validation-form');
const username = document.getElementById('username');
const email = document.getElementById('email');
const phone = document.getElementById('phone');
const password = document.getElementById('password');
const confirmPassword = document.getElementById('confirm-password');

// FIX: The ID of the checkbox is 'show-password', not 'show-password-checkbox'
const showPasswordCheckbox = document.getElementById('show-password');

// --- 2. ADDING EVENT LISTENERS ---

// We listen for the 'submit' event on the entire form.
// (Relates to Section 11)
form.addEventListener('submit', function(event) {
    // IMPORTANT: This stops the form from submitting and reloading the page.
    // This allows our script to check the inputs first.
    // (Relates to Section 14: Default Action)
    event.preventDefault();

    // Run our main validation function
    validateInputs();
});

// Add an event listener to the "Show Password" checkbox.
// We listen for the 'change' event, which fires when a checkbox is checked or unchecked.
showPasswordCheckbox.addEventListener('change', function() {
    // 'this.checked' is a boolean (true or false) that tells us if the checkbox is currently checked.
    if (this.checked) {
        // If it's checked, change the input type from 'password' to 'text'.
        // This makes the characters visible.
        password.type = 'text';
        confirmPassword.type = 'text';
    } else {
        // If it's unchecked, change the type back to 'password'.
        // This hides the characters again.
        password.type = 'password';
        confirmPassword.type = 'password';
    }
});


// --- 3. HELPER FUNCTIONS FOR SHOWING ERRORS/SUCCESS ---
// These functions help us visually update the form.

// This function adds the error styles and message.
function showError(inputElement, message) {
    const formControl = inputElement.parentElement; // Gets the parent div (.form-control)
    const errorElement = formControl.querySelector('.error-message');

    formControl.className = 'form-control error'; // Add 'error' class
    errorElement.innerText = message; // Set the error text
}

// This function adds the success styles.
function showSuccess(inputElement) {
    const formControl = inputElement.parentElement;
    formControl.className = 'form-control success'; // Add 'success' class
}


// --- 4. FUNCTIONS FOR SPECIFIC VALIDATION RULES ---

// A simple function to check if an email is in a valid format using a Regular Expression.
// A Regular Expression (RegEx) is a special pattern for matching text.
function isValidEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

// A simple function to check for a 10-digit phone number.
function isValidPhone(phone) {
    const re = /^\d{11}$/; // Matches exactly 10 digits
    return re.test(phone);
}


// --- 5. THE MAIN VALIDATION FUNCTION ---
// This function runs when the form is submitted.
function validateInputs() {
    // .trim() removes whitespace from both ends of a string.
    const usernameValue = username.value.trim();
    const emailValue = email.value.trim();
    const phoneValue = phone.value.trim();
    const passwordValue = password.value.trim();
    const confirmPasswordValue = confirmPassword.value.trim();

    // A flag to check if all validations pass
    let isFormValid = true;

    // --- Validate Username ---
    if (usernameValue === '') {
        showError(username, 'Username is required');
        isFormValid = false;
    } else {
        showSuccess(username);
    }

    // --- Validate Email ---
    if (emailValue === '') {
        showError(email, 'Email is required');
        isFormValid = false;
    } else if (!isValidEmail(emailValue)) {
        showError(email, 'Provide a valid email address');
        isFormValid = false;
    } else {
        showSuccess(email);
    }
    
    // --- Validate Phone Number ---
    if (phoneValue === '') {
        showError(phone, 'Phone number is required');
        isFormValid = false;
    } else if (!isValidPhone(phoneValue)) {
        showError(phone, 'Phone number must be 10 digits');
        isFormValid = false;
    } else {
        showSuccess(phone);
    }

    // --- Validate Password ---
    if (passwordValue === '') {
        showError(password, 'Password is required');
        isFormValid = false;
    } else if (passwordValue.length < 5) {
        showError(password, 'Password must be at least 8 characters.');
        isFormValid = false;
    } else {
        showSuccess(password);
    }

    // --- Validate Confirm Password ---
    if (confirmPasswordValue === '') {
        showError(confirmPassword, 'Please confirm your password');
        isFormValid = false;
    } else if (passwordValue !== confirmPasswordValue) {
        showError(confirmPassword, 'Passwords do not match');
        isFormValid = false;
    } else {
        // Only show success if the original password is also valid
        if (passwordValue.length >= 8) {
            showSuccess(confirmPassword);
        } else {
            isFormValid = false; // If original password is too short, this field is also invalid.
        }
    }
    
    // If all validations passed, you can now submit the form or show a success message.
    if (isFormValid) {
        alert('Registration successful!');
        // In a real application, you would now send the data to a server.
        // For example: form.submit(); or using fetch() to send data via API.
    }
}