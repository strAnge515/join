let _moveCallback = null;
let _draggedId = null;


/**
 * Initializes the drag-and-drop system for the board.
 * @param {Function} onMove - Callback invoked when a card is dropped into a new column.
 *                            Receives (taskId: string, newStatus: string).
 */
export function initDragDrop(onMove) {
  _moveCallback = onMove;
  _attachListeners();
}


/**
 * Re-attaches drag listeners to all task cards.
 * Call this after the board has been re-rendered.
 */
export function refreshCardListeners() {
  _attachCardListeners();
}


/**
 * Attaches all drag-and-drop listeners to columns and cards.
 */
function _attachListeners() {
  _attachColumnListeners();
  _attachCardListeners();
}


/**
 * Attaches dragover, dragleave and drop listeners to all board column containers.
 */
function _attachColumnListeners() {
  document.querySelectorAll('.board-column__cards').forEach((col) => {
    col.removeEventListener('dragover', _onDragOver);
    col.removeEventListener('dragleave', _onDragLeave);
    col.removeEventListener('drop', _onDrop);

    col.addEventListener('dragover', _onDragOver);
    col.addEventListener('dragleave', _onDragLeave);
    col.addEventListener('drop', _onDrop);
  });
}


/**
 * Attaches dragstart and dragend listeners to all task cards.
 */
function _attachCardListeners() {
  document.querySelectorAll('.task-card').forEach((card) => {
    card.setAttribute('draggable', 'true');

    card.removeEventListener('dragstart', _onDragStart);
    card.removeEventListener('dragend', _onDragEnd);

    card.addEventListener('dragstart', _onDragStart);
    card.addEventListener('dragend', _onDragEnd);
  });
}


/**
 * Handles the dragstart event on a task card.
 * Stores the dragged card's ID and applies a visual rotation class.
 * @param {DragEvent} e - The dragstart event.
 */
function _onDragStart(e) {
  _draggedId = this.dataset.id;
  this.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', _draggedId);
}


/**
 * Handles the dragend event on a task card.
 * Removes visual drag classes from the card and all columns.
 */
function _onDragEnd() {
  this.classList.remove('dragging');
  document.querySelectorAll('.board-column__cards').forEach((c) => c.classList.remove('drag-over'));
  _draggedId = null;
}


/**
 * Handles the dragover event on a column.
 * Prevents default to allow dropping and highlights the column.
 * @param {DragEvent} e - The dragover event.
 */
function _onDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  this.classList.add('drag-over');
}


/**
 * Handles the dragleave event on a column.
 * Removes the highlight only when leaving the column entirely.
 * @param {DragEvent} e - The dragleave event.
 */
function _onDragLeave(e) {
  if (!this.contains(e.relatedTarget)) {
    this.classList.remove('drag-over');
  }
}


/**
 * Handles the drop event on a column.
 * Retrieves the task ID and new status, then triggers the move callback.
 * @param {DragEvent} e - The drop event.
 */
async function _onDrop(e) {
  e.preventDefault();
  this.classList.remove('drag-over');

  const id = e.dataTransfer.getData('text/plain') || _draggedId;
  const newStatus = this.dataset.status;

  if (id && newStatus && _moveCallback) {
    await _moveCallback(id, newStatus);
  }
}