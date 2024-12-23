/**
 * Get the "Add Task" button and attach a click event listener to display the form.
 */
const addTask = document.getElementById('add-task');
addTask.addEventListener('click', () => {
    document.getElementById("form").style.display = "block";
});

/**
 * Retrieve tasks from localStorage or initialize an empty array if no tasks exist.
 */
const taskArray = JSON.parse(localStorage.getItem('tasks')) || [];

/**
 * Task Constructor
 * @param {string} taskName - The name of the task.
 * @param {string} Category - The category of the task (e.g., work, personal, shopping).
 * @param {string} Priority - The priority of the task (low, medium, high).
 */
function Task(taskName, Category, Priority) {
    this.taskName = taskName;
    this.Category = Category;
    this.Priority = Priority;
    this.completed = false;
}

/**
 * Get the "Add" button and attach a click event listener to add tasks.
 */
const btnAdd = document.getElementById('add');
btnAdd.addEventListener('click', (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    if (validate(formData)) {
        //Create a new task, add it to the array and update the localstorage
        const task = new Task(formData.get('task-name'), formData.get('category'), formData.get('priority'));
        taskArray.push(task);
        localStorage.setItem('tasks', JSON.stringify(taskArray));
        form.reset();
        form.style.display = "none";
        displayTasks();
    }
});

/**
 * Display tasks in the table.
 * @param {string} filter - Filter criteria ("all", category, or priority).
 * @param {string} search - Search term for filtering tasks by name.
 */
function displayTasks(filter = "all", search = "") {
    const tbody = document.querySelector('tbody');
    tbody.innerHTML = "";

    // Filter and iterate through tasks to display them.
    taskArray
        .filter(task =>
            (filter === "all" || task.Category === filter || task.Priority === filter) &&
            task.taskName.toLowerCase().includes(search.toLowerCase())
        )
        .forEach((task, index) => {
            const row = document.createElement('tr');
            row.setAttribute('draggable', true); // Enable drag-and-drop.
            row.innerHTML = `
                <td>${task.taskName}</td>
                <td>${task.Category}</td>
                <td>${task.Priority}</td>
                <td>
                <div class="action-btn">
                    <button class="done-btn">${task.completed ? "&#10006" : "&#10004"}</button>
                    <button class="delete-btn fa fa-trash-o"></button>
                    <button class="update-btn fa fa-edit"></button>
                    </div>
                
                </td>
            `;

            // Mark as Done/Undo
            row.querySelector('.done-btn').addEventListener('click', () => {
                task.completed = !task.completed;
                localStorage.setItem('tasks', JSON.stringify(taskArray));
                displayTasks(filter, search);
            });

            // Delete Task
            row.querySelector('.delete-btn').addEventListener('click', () => {
                removeTaskFromStorage(task);
                displayTasks(filter, search);
            });

            // Apply strikethrough for completed tasks
            if (task.completed) {
                row.style.textDecoration = "line-through";

            }
             // Enable task editing
            row.querySelector('.update-btn').addEventListener('click', () => {
                const task = taskArray[index]; // Get the task object for the current row

                // Apply styling to the entire row for edit mode
                row.classList.add('editing-row');

                // Replace cells with input fields/dropdowns for inline editing
                row.cells[0].innerHTML = `<input type='text' value='${task.taskName}' class='edit-input' />`;
                row.cells[1].innerHTML = `
        <select class='edit-select'>
            <option value="work" ${task.Category === "work" ? "selected" : ""}>Work</option>
            <option value="personal" ${task.Category === "personal" ? "selected" : ""}>Personal</option>
            <option value="shopping" ${task.Category === "shopping" ? "selected" : ""}>Shopping</option>
        </select>`;
                row.cells[2].innerHTML = `
        <select class='edit-select'>
            <option value="low" ${task.Priority === "low" ? "selected" : ""}>Low</option>
            <option value="medium" ${task.Priority === "medium" ? "selected" : ""}>Medium</option>
            <option value="high" ${task.Priority === "high" ? "selected" : ""}>High</option>
        </select>`;

                // Replace update button with save and cancel buttons
                const actionsCell = row.querySelector('td:last-child');
                actionsCell.innerHTML = `
                <div class="edit-btn">
        <button class="save-btn">Save</button>
        <button class="cancel-btn">Cancel</button>
        </div>
    `;

                // Handle Save
                actionsCell.querySelector('.save-btn').addEventListener('click', () => {
                    const updatedTaskName = row.cells[0].querySelector('input').value.trim();
                    const updatedCategory = row.cells[1].querySelector('select').value;
                    const updatedPriority = row.cells[2].querySelector('select').value;

                    if (!updatedTaskName) {
                        alert('Task Name is required!');
                        return;
                    }

                    // Update the task in the array
                    task.taskName = updatedTaskName;
                    task.Category = updatedCategory;
                    task.Priority = updatedPriority;

                    // Save updated tasks to local storage
                    localStorage.setItem('tasks', JSON.stringify(taskArray));

                    // Re-render the table to reflect changes
                    displayTasks(filter, search);
                });

                // Handle Cancel
                actionsCell.querySelector('.cancel-btn').addEventListener('click', () => {
                    // Revert changes by re-rendering the tasks
                    displayTasks(filter, search);
                });


            })
            tbody.appendChild(row);

            // Drag-and-Drop Handlers
            row.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', index);
            });

            row.addEventListener('dragover', (e) => e.preventDefault());

            row.addEventListener('drop', (e) => {
                e.preventDefault();
                const draggedIndex = e.dataTransfer.getData('text/plain');
                const droppedIndex = index;
                // Swap the positions of dragged and dropped tasks
                [taskArray[draggedIndex], taskArray[droppedIndex]] = [taskArray[droppedIndex], taskArray[draggedIndex]];
                localStorage.setItem('tasks', JSON.stringify(taskArray));
                displayTasks(filter, search);
            });
        });
}

/**
 * Remove a task from the task array and localStorage.
 * @param {Object} taskToRemove - The task object to remove.
 */
function removeTaskFromStorage(taskToRemove) {
    const index = taskArray.findIndex(task =>
        task.taskName === taskToRemove.taskName &&
        task.Category === taskToRemove.Category &&
        task.Priority === taskToRemove.Priority
    );
    if (index !== -1) {
        taskArray.splice(index, 1);
        localStorage.setItem('tasks', JSON.stringify(taskArray));
    }
}

/**
 * Validate form data to ensure required fields are filled.
 * @param {FormData} formData - The form data to validate.
 * @returns {boolean} - True if valid, false otherwise.
 */
function validate(formData) {
    if (
        formData.get('task-name') === "" ||
        formData.get('category') === "" ||
        formData.get('priority') === ""
    ) {
        window.alert('Please fill all the required fields');
        return false;
    }
    return true;
}

// Filter tasks based on the selected category or priority.
document.getElementById('filter').addEventListener('change', (e) => {
    displayTasks(e.target.value, document.getElementById('search').value);
});

// Search Tasks by name
document.getElementById('search').addEventListener('input', (e) => {
    displayTasks(document.getElementById('filter').value, e.target.value);
});

// Initial Rendering of tasks
displayTasks();
