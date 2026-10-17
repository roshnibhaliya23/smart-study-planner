
const taskForm = document.getElementById("task-form");
const taskName = document.getElementById("task-name");
const subjectInput = document.getElementById("subject");
const deadlineInput = document.getElementById("deadline");

const taskList = document.getElementById("task-list");
const emptyMessage = document.getElementById("empty-message");

const totalTasks = document.getElementById("total-tasks");
const completedTasks = document.getElementById("completed-tasks");
const pendingTasks = document.getElementById("pending-tasks");

const taskFilter = document.getElementById("task-filter");
const progressBar = document.getElementById("progress-bar");
const progressText = document.getElementById("progress-text");
const progressTrack = document.getElementById("progress-track");

// Load saved tasks from the browser
let tasks = JSON.parse(localStorage.getItem("studyTasks")) || [];

// Get today's date in YYYY-MM-DD format using local time
function getToday() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

// Check whether a task is overdue
function isOverdue(task) {
    return !task.completed && task.deadline < getToday();
}

// Save tasks in the browser
function saveTasks() {
    localStorage.setItem("studyTasks", JSON.stringify(tasks));
}

// Update statistics and progress
function updateStats() {
    const completed = tasks.filter(task => task.completed).length;
    const pending = tasks.length - completed;

    const progress = tasks.length === 0
        ? 0
        : Math.round((completed / tasks.length) * 100);

    totalTasks.textContent = tasks.length;
    completedTasks.textContent = completed;
    pendingTasks.textContent = pending;

    progressBar.style.width = `${progress}%`;
    progressText.textContent = `${progress}%`;
    progressTrack.setAttribute("aria-valuenow", progress);
}

// Display tasks according to the selected filter
function renderTasks() {
    taskList.replaceChildren();

    const filter = taskFilter.value;

    const visibleTasks = tasks.filter(task => {
        if (filter === "pending") {
            return !task.completed;
        }

        if (filter === "completed") {
            return task.completed;
        }

        if (filter === "overdue") {
            return isOverdue(task);
        }

        return true;
    });

    emptyMessage.style.display =
        visibleTasks.length === 0 ? "block" : "none";

    if (visibleTasks.length === 0) {
        emptyMessage.textContent = tasks.length === 0
            ? "No tasks yet. Add your first study task!"
            : "No tasks match this filter.";
    }

    visibleTasks.forEach(task => {
        const li = document.createElement("li");
        const details = document.createElement("div");
        const status = document.createElement("span");
        const actions = document.createElement("div");

        details.className = "task-details";
        actions.className = "task-actions";

        details.textContent =
            `${task.name} | ${task.subject} | Due: ${task.deadline}`;

        const overdue = isOverdue(task);

        if (task.completed) {
            details.style.textDecoration = "line-through";
            status.textContent = "Completed";
            status.style.color = "#238653";
        } else if (overdue) {
            status.textContent = "Overdue";
            status.style.color = "#c73737";
            li.classList.add("overdue");
        } else {
            status.textContent = "Pending";
            status.style.color = "#596579";
        }

        status.className = "task-status";
        details.appendChild(document.createElement("br"));
        details.appendChild(status);

        const completeButton = document.createElement("button");
        completeButton.type = "button";
        completeButton.textContent =
            task.completed ? "Undo" : "Complete";

        completeButton.addEventListener("click", () => {
            task.completed = !task.completed;
            saveTasks();
            renderTasks();
        });

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.textContent = "Edit";
        editButton.className = "edit-button";

        editButton.addEventListener("click", () => {
            const newName = prompt("Edit task name:", task.name);

            if (newName === null) return;

            const newSubject = prompt(
                "Edit subject:", task.subject
            );

            if (newSubject === null) return;

            const newDeadline = prompt(
                "Edit deadline (YYYY-MM-DD):",
                task.deadline
            );

            if (newDeadline === null) return;

            const name = newName.trim();
            const subject = newSubject.trim();

            // Validate the edited values
            if (!name || !subject) {
                alert("Task name and subject cannot be empty.");
                return;
            }

            if (!/^\d{4}-\d{2}-\d{2}$/.test(newDeadline)) {
                alert("Enter the deadline as YYYY-MM-DD.");
                return;
            }

            const date = new Date(`${newDeadline}T00:00:00`);

            if (
                Number.isNaN(date.getTime()) ||
                date.getFullYear() !== Number(newDeadline.slice(0, 4)) ||
                date.getMonth() + 1 !== Number(newDeadline.slice(5, 7)) ||
                date.getDate() !== Number(newDeadline.slice(8, 10))
            ) {
                alert("Please enter a valid calendar date.");
                return;
            }

            task.name = name;
            task.subject = subject;
            task.deadline = newDeadline;

            saveTasks();
            renderTasks();
        });

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-button";

        deleteButton.addEventListener("click", () => {
            const confirmed = confirm(
                `Delete "${task.name}"?`
            );

            if (!confirmed) return;

            tasks = tasks.filter(item => item.id !== task.id);
            saveTasks();
            renderTasks();
        });

        actions.append(
            completeButton,
            editButton,
            deleteButton
        );

        li.append(details, actions);
        taskList.appendChild(li);
    });

    updateStats();
}

// Add a new task
taskForm.addEventListener("submit", event => {
    event.preventDefault();

    const name = taskName.value.trim();
    const subject = subjectInput.value.trim();
    const deadline = deadlineInput.value;

    if (!name || !subject || !deadline) {
        alert("Please fill in all fields.");
        return;
    }

    tasks.push({
        id: crypto.randomUUID(),
        name,
        subject,
        deadline,
        completed: false
    });

    saveTasks();
    renderTasks();
    taskForm.reset();
});

// Re-render when the filter changes
taskFilter.addEventListener("change", renderTasks);

// Show saved tasks when the page opens
renderTasks();
