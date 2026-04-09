import { saveTask } from "./backend-tasks.js";

const subtaskInput = document.getElementById('subtask-input');
const addButtonSubtask = document.getElementById('btn-add-subtask');
const deleteButtonSubtask = document.getElementById('btn-delete-subtask');

function init() {
    addTask();
    setPriorityButtons();
}
function addTask() {
    let addButton = document.getElementById('btn-create');
    addButton.addEventListener("click", async () => {
        let informartionsFromInput = addInformations();
        let object = createTaskObjekt(informartionsFromInput)

        await saveTask(object);
    })
}

function addInformations() {
    let taskTitle = document.getElementById('task-title').value;
    let tastkDescription = document.getElementById('task-description').value;
    let taskCategory = document.getElementById('task-category').value;
    let taskDate = document.getElementById('task-date').value;
    let taskPrio = document.querySelector('[class*="selected-"]').dataset.prio;
    let taskAssignedTo = document.getElementById('task-assigned');
    let selectedContacts = Array.from(taskAssignedTo.selectedOptions);
    let contact = selectedContacts.map((contact) => contact.value)

    return { taskTitle, tastkDescription, taskCategory, taskDate, taskPrio, contact }

}

function createTaskObjekt(data) {
    return {
        title: data.taskTitle,
        description: data.tastkDescription,
        category: data.taskCategory,
        status: "to do",
        assigned_to: data.contact,
        date: data.taskDate,
        prio: data.taskPrio,
        subtasks: [{ title: "drag and drop einbauen", state: false },
        { title: "Bispiel 2", state: false },
        { title: "Beispiel 3", state: false }
        ]
    }
}

function setPriorityButtons() {
    const activeButton = document.querySelectorAll('.prio-btn');
    activeButton.forEach(button => {
        button.addEventListener('click', () => {
            activeButton.forEach(button => {
                button.classList.remove('selected-urgent', 'selected-medium', 'selected-low');
            })
            button.classList.add('selected-' + button.dataset.prio)

        })
    });
}

addButtonSubtask.addEventListener('click', addSubtask);

function addSubtask() {
    const subtaskValue = subtaskInput.value;
    const subtaskList = document.getElementById('subtask-list');
    if (subtaskValue === "") return;
    subtaskList.innerHTML += "<li>" + subtaskValue + "</li>";
    subtaskInput.value = "";
}

subtaskInput.addEventListener('blur', () => {
    deleteButtonSubtask.classList.add('subtask-button-hidden');
    addButtonSubtask.classList.add('subtask-button-hidden');
})

subtaskInput.addEventListener('focus', () => {
    deleteButtonSubtask.classList.remove('subtask-button-hidden');
    addButtonSubtask.classList.remove('subtask-button-hidden');
})

document.addEventListener('DOMContentLoaded', init);