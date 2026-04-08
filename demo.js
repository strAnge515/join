import { saveTask, loadTasks, deleteTask } from './scripts/backend-tasks.js';

const form = document.getElementById('test-task-form');
const listContainer = document.getElementById('task-list-container');

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const newTaskData = {
        title: document.getElementById('test-title').value,
        description: document.getElementById('test-desc').value,
        date: document.getElementById('test-date').value,
        prio: document.getElementById('test-prio').value,
        category: document.getElementById('test-category').value,
        assigned_to: document.getElementById('test-assigned').value.split(',').map(name => name.trim()) 
    };

    await saveTask(newTaskData);
    
    form.reset();
    renderAllTasks();
});

async function renderAllTasks() {
    listContainer.innerHTML = "<p>Lade Tasks aus Datenbank...</p>";
    
    const tasks = await loadTasks();
    
    listContainer.innerHTML = "";

    if (!tasks || tasks.length === 0) {
        listContainer.innerHTML = "<p>Keine Tasks gefunden. Erstelle oben einen neuen!</p>";
        return;
    }

    tasks.forEach(task => {
        const taskDiv = document.createElement('div');
        taskDiv.className = 'task-card-test';
        
        taskDiv.innerHTML = `
            <h3>${task.title} <span style="font-size: 14px; font-weight: normal; background: #eee; padding: 3px;">${task.category}</span></h3>
            <p><strong>Prio:</strong> ${task.prio} | <strong>Due:</strong> ${task.date}</p>
            <p><strong>Assigned:</strong> ${task.assigned_to.join(', ')}</p>
            <p><em>${task.description}</em></p>
            <p style="font-size: 10px; color: gray;">Firebase ID: ${task.id}</p>
        `;

        const deleteBtn = document.createElement('button');
        deleteBtn.innerText = "Task löschen 🗑️";
        deleteBtn.className = "delete-btn";
        
        deleteBtn.addEventListener('click', async () => {
            await deleteTask(task.id);
            renderAllTasks();
        });

        taskDiv.appendChild(deleteBtn);
        listContainer.appendChild(taskDiv);
    });
}

document.addEventListener('DOMContentLoaded', renderAllTasks);