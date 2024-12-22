const addTask = document.getElementById('add-task');
addTask.addEventListener('click', () => {
    document.getElementById("form").style.display = "block";
});

const taskArray = JSON.parse(localStorage.getItem('tasks')) || [];

function Task(taskName, Category, Priority) {
    this.taskName = taskName;
    this.Category = Category;
    this.Priority = Priority;
    this.completed = false;
}

const btnAdd = document.getElementById('add');
btnAdd.addEventListener('click', (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    if (validate(formData)) {
        const task = new Task(formData.get('task-name'), formData.get('category'), formData.get('priority'));
        taskArray.push(task);
        localStorage.setItem('tasks', JSON.stringify(taskArray));
        form.reset();
        form.style.display = "none";
        displayTasks();
    }
});

function displayTasks(filter = "all", search = "") {
    const tbody = document.querySelector('tbody');
    tbody.innerHTML = "";

    taskArray
        .filter(task => 
            (filter === "all" || task.Category === filter || task.Priority === filter) &&
            task.taskName.toLowerCase().includes(search.toLowerCase())
        )
        .forEach((task, index) => {
            const row = document.createElement('tr');
            row.setAttribute('draggable', true);
            row.innerHTML = `
                <td>${task.taskName}</td>
                <td>${task.Category}</td>
                <td>${task.Priority}</td>
                <td>
                    <button class="done-btn">${task.completed ? "Undo" : "Done"}</button>
                    <button class="delete-btn">Delete</button>
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
            if (task.completed){
                row.style.textDecoration = "line-through";
                
            } 
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
                [taskArray[draggedIndex], taskArray[droppedIndex]] = [taskArray[droppedIndex], taskArray[draggedIndex]];
                localStorage.setItem('tasks', JSON.stringify(taskArray));
                displayTasks(filter, search);
            });
        });
}

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

// Filter Tasks
document.getElementById('filter').addEventListener('change', (e) => {
    displayTasks(e.target.value, document.getElementById('search').value);
});

// Search Tasks
document.getElementById('search').addEventListener('input', (e) => {
    displayTasks(document.getElementById('filter').value, e.target.value);
});

// Initial Rendering
displayTasks();
