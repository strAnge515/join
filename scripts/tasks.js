import { saveTask } from "./backend-tasks.js";

const subtaskInput = document.getElementById('subtask-input');
const addButtonSubtask = document.getElementById('btn-add-subtask');
const deleteButtonSubtask = document.getElementById('btn-delete-subtask');
const subtaskButtonWrapper = document.getElementById('subtask-button-wrapper');

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

addButtonSubtask.addEventListener('mousedown', addSubtask);

function addSubtask() {
    const subtaskValue = subtaskInput.value;
    const subtaskList = document.getElementById('subtask-list');
    if (subtaskValue === "") return;
    const li = document.createElement('li')
    li.innerHTML = getSubtaskTemplate(subtaskValue);
    subtaskList.appendChild(li);
    addSubtaskEventListeners(li);
    subtaskInput.value = "";
}

function getSubtaskTemplate(subtaskValue) {
    return `<span>${subtaskValue}</span>
                    <button class="edit-btn"><img src="../assets/img/Property 1=edit.svg" alt="editsymbol"></button>
                     <button class="delete-btn"><img src="../assets/img/Property 1=delete.svg" alt="deletesymbol"></button>`;
}

function getEditTemplate(subtaskText) {
    return `<input class="subtask-edit-value" type="text" value="${subtaskText}" />
             <button class="edit-delete-btn"><img src="../assets/img/Property 1=delete.svg" alt="deletesymbol"></button>
             <button class="edit-confirm-btn"><img src="../assets/img/Property 1=check.svg" alt="checkicon"></button>`;
}

function addSubtaskEventListeners(li) {
    let deleteBtn = li.querySelector('.delete-btn');
    let editBtn = li.querySelector('.edit-btn');
    deleteBtn.addEventListener('click', () => li.remove());
    editBtn.addEventListener('click', () => {
        let subtaskText = li.querySelector('span').textContent;
        li.innerHTML = getEditTemplate(subtaskText);
        li.querySelector('.edit-delete-btn').addEventListener('click', () => li.remove());
        li.querySelector('.edit-confirm-btn').addEventListener('click', () => {
            subtaskText = li.querySelector('.subtask-edit-value').value;
            li.innerHTML = getSubtaskTemplate(subtaskText);
            addSubtaskEventListeners(li);
        });
    });
}

addButtonSubtask.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
        addSubtask();
        subtaskInput.value = "";
        subtaskInput.blur();
    }
})

subtaskInput.addEventListener('blur', () => {
    subtaskButtonWrapper.classList.remove('button-wrapper');
    subtaskButtonWrapper.classList.add('subtask-button-hidden');


})

subtaskInput.addEventListener('focus', () => {
    subtaskButtonWrapper.classList.remove('subtask-button-hidden');
    subtaskButtonWrapper.classList.add('button-wrapper');
})

deleteButtonSubtask.addEventListener('mousedown', () => {
    subtaskInput.value = "";
    subtaskInput.blur();
})

deleteButtonSubtask.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
        subtaskInput.value = "";
        subtaskInput.blur();
    }
})

document.addEventListener('DOMContentLoaded', init);