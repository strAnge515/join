function getTaskCardHTML(categoryBadge, task) {
  return `
  <div class="modal-content">
  <div class="modal-top">
      <span class="task-category" style="background:${categoryBadge.color}">${task.category}</span>
      <button class="close ">
        <img class="close-icon" src="../assets/img/contacts/close.svg" alt="Close button"></button>
      </div>
      <h1 id="taskTitle">${task.title}</h1>
      <p id="taskDescription" class="task-description">${task.description}</p>
      <div class="info">
        <div class="info-item"><h2>Due date: </h2><p id="taskDate">${task.date}</p></div>
        <div class="info-item"><h2>Priority: </h2><p id="taskPrio">${task.prio}</p></div>
        <div class="info-item info-item--assigned"><h2>Assigned To:</h2>
        <div class ="assigned-list" id="assignedList"></div></div>
        <div class="info-item info-item--subtasks"><h2>Subtasks</h2>
        <div class="subtask-list" id="subtaskList"></div></div>
      <div class="actions">
          <button class="edit-btn" id="deleteTaskBtn" data-id="${task.id}">
          <div class="delete-icon"></div>
           Delete</button>
           <div class="edit-divider"></div>
          <button class="edit-btn" id="editTaskBtn" data-id="${task.id}">
          <div class="edit-icon"></div>
          Edit </button>
          </div>
          </div>
  `;
}

function getAssignedUsersHTML(color, initials, user) {
  return `
        <div class="assigned-user">
          <div class="avatar" style="background:${color};">${initials}</div>
          <span class="user-name">${user}</span>
        </div>
      `;
}

function getSubtaskList(index, subtask) {
  return `
  <div class="subtask-item">
  <input
    type="checkbox"
    id="subtask-${index}"
    class="custom-checkbox"
  />
  <label class="subtask-label" for="subtask-${index}">
    ${subtask.title}
  </label>
</div>
    `;
}
