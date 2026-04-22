function getTaskCardHTML(categoryBadge, task) {
  return `
  <div class="modal-top">
      <button class="close" onclick="closeModal()">×</button>
      <span class="task-card__category" style="background:${categoryBadge.color}">${task.category}</span>
      </div>
      <h1 id="taskTitle">${task.title}</h1>
      <p id="taskDescription">${task.description}</p>
      <div class="info">
        <div class="info-item"><h2>Due date: </h2><p id="taskDate">${task.date}</p></div>
        <div class="info-item"><h2>Priority: </h2><p id="taskPrio">${task.prio}</p></div>
        <div class="info-item"><h2>Assigned To:</h2><p id="assignedList">${task.assignet_to}</p></div>
        <div class="info-item"><h2>Subtasks</h2><ul id="subtaskList">${task.subtasks}</ul></div>
      </div>
      <div class="actions">
        <button>Delete</button>
        <button>Edit</button>
      </div>
  `;
}
