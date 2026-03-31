import { saveTask } from "./backend-tasks";

function addTask() {
    let addButton = document.getElementById('btn-create');
    addButton.addEventListener("click", () => {

        saveTask();
        setPriorityButtons();

    })
}

function addInformations() {
    let taskTitle = document.getElementById('task-title').value;
    let tastkDescription = document.getElementById('task-description').value;

}

function setPriorityButtons() {
    activeButton = document.querySelectorAll('.prio-btn');
    activeButton.forEach(button => {
        button.addEventListener('click', () => {
            activeButton.forEach(button => {
                button.classList.remove('selected-urgent', 'selected-medium', 'selected-low');
            })
            button.classList.add('selected-' + button.dataset.prio)

        })
    });
}

let task = {
    title: "Kanbanboard erstellen",
    description: "baue ein Kanbanboard mit drag and drop system",
    category: "to do",
    assignet_to: ["Max", "Steffi", "Denny"],
    date: "date",
    prio: "urgend",
    subtask: [{ title: "drag and drop einbauen", state: "false" },
    { titel: "Bispiel 2", state: "false" },
    { titel: "Beispiel 3", state: "false" }
    ]
}



document.addEventListener('DOMContentLoaded', addTask);