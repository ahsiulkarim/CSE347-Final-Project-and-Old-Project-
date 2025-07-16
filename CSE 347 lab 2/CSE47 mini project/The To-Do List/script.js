// --- 1. GETTING REFERENCES TO HTML ELEMENTS ---
// We need to talk to the elements on our page.
// This is like getting their phone numbers so we can call them later.
// (Relates to Section 10.1 in your manual)

const taskInput = document.getElementById('task-input');
const addTaskButton = document.getElementById('add-task-button');
const taskList = document.getElementById('task-list');

// --- 2. ADDING AN EVENT LISTENER TO THE BUTTON ---
// We want something to happen when the "Add" button is clicked.
// `addEventListener` waits for a specific event (in this case, a 'click').
// When the click happens, it will run the function we provide.
// (Relates to Section 11.1 in your manual)

addTaskButton.addEventListener('click', function() {
    addTask();
});

// Also allow adding a task by pressing the "Enter" key in the input field
taskInput.addEventListener('keyup', function(event) {
    // The 'event' object contains details about the event, like which key was pressed.
    if (event.key === 'Enter') {
        addTask();
    }
});


// --- 3. THE CORE FUNCTION TO ADD A TASK ---
function addTask() {
    // Get the text from the input box. .trim() removes any extra spaces at the start or end.
    const taskText = taskInput.value.trim();

    // Check if the input is empty. If it is, we don't want to add an empty task.
    // This is a simple form of validation.
    // (Relates to Section 6.1: Conditional Statements)
    if (taskText === '') {
        alert('Please enter a task!');
        return; // 'return' stops the function from running any further
    }

    // --- Create the new HTML elements for the task ---
    // (Relates to Section 10.4: Add New Elements)

    // Create a new list item element: <li></li>
    const li = document.createElement('li');
    li.className = 'task-item'; // Add our CSS class for styling

    // Create a span to hold the task text. This makes it easier to click for completion.
    const taskTextSpan = document.createElement('span');
    taskTextSpan.textContent = taskText; // Set the text inside the span

    // Create the delete button: <button>Delete</button>
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.className = 'delete-btn'; // Add our CSS class for styling

    // --- Make the new elements interactive ---

    // Add a click listener to the delete button to remove the task
    deleteButton.addEventListener('click', function() {
        // .remove() deletes the entire list item from the page
        // (Relates to Section 10.4: Remove Elements)
        taskList.removeChild(li);
    });

    // Add a click listener to the task text to mark it as complete
    taskTextSpan.addEventListener('click', function() {
        // .classList.toggle() adds the 'completed' class if it's not there,
        // and removes it if it is. This is perfect for a toggle.
        // (Relates to Section 10.4: Modify Classes)
        li.classList.toggle('completed');
    });

    // --- Put all the pieces together ---
    // (Relates to Section 10.4: appendChild)
    li.appendChild(taskTextSpan);  // Put the <span> inside the <li>
    li.appendChild(deleteButton); // Put the <button> inside the <li>
    taskList.appendChild(li);     // Put the new <li> into our <ul>

    // Finally, clear the input box so the user can type a new task
    taskInput.value = '';
}