let isResizing = false;
let startY = 0;
let startHeight = 0;

/**
 * Initializes all three resize handle mouse event listeners.
 *
 * @returns {void}
 */
export function initResizeHandle(handle, textarea) {
  resizeHandleMouseDown(handle, textarea);
  resizeHandleMouseMove(textarea);
  resizeHandleMouseUp();
}

/**
 * Starts the resize process on mousedown, storing the start position and height.
 *
 * @returns {void}
 */
function resizeHandleMouseDown(handle, textarea) {
  handle.addEventListener('mousedown', (event) => {
    event.preventDefault();
    isResizing = true;
    startY = event.clientY;
    startHeight = textarea.offsetHeight;
  });
}

/**
 * Adjusts the textarea height while the mouse is being dragged.
 *
 * @returns {void}
 */
function resizeHandleMouseMove(textarea) {
  document.addEventListener('mousemove', (event) => {
    if (!isResizing) return;
    const deltaY = event.clientY - startY;
    const newHeight = startHeight + deltaY;
    textarea.style.height = newHeight + 'px';
  });
}

/**
 * Ends the resize process when the mouse button is released.
 *
 * @returns {void}
 */
function resizeHandleMouseUp() {
  document.addEventListener('mouseup', () => {
    isResizing = false;
  });
}
