import { saveTask } from "./backend-tasks.js";
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
        assignet_to: data.contact,
        date: data.taskDate,
        prio: data.taskPrio,
        subtask: [{ title: "drag and drop einbauen", state: "false" },
        { titel: "Bispiel 2", state: "false" },
        { titel: "Beispiel 3", state: "false" }
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





document.addEventListener('DOMContentLoaded', init);