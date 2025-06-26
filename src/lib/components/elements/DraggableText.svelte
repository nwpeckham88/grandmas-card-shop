<!-- Draggable text element with inline editing functionality and selection support -->
<script>
  import { cardState, selectElement, updateElement } from '$lib/stores/cardStore.js';
  
  let { textElement } = $props();
  
  let isDragging = $state(false);
  let isEditing = $state(false);
  let dragStartX = 0;
  let dragStartY = 0;
  let elementStartX = 0;
  let elementStartY = 0;
  let textInput = $state();
  
  // Check if this element is selected
  let isSelected = $derived($cardState.selectedElements.includes(`textElements:${textElement.id}`));
  
  function handleMouseDown(event) {
    // Handle multi-selection with Ctrl/Cmd key
    const multiSelect = event.ctrlKey || event.metaKey;
    selectElement('textElements', textElement.id, multiSelect);
    
    isDragging = true;
    dragStartX = event.clientX;
    dragStartY = event.clientY;
    elementStartX = textElement.x;
    elementStartY = textElement.y;
    
    // Add global mouse move and up listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    event.preventDefault();
    event.stopPropagation();
  }
  
  function handleMouseMove(event) {
    if (!isDragging) return;
    
    const deltaX = event.clientX - dragStartX;
    const deltaY = event.clientY - dragStartY;
    
    const newX = Math.max(0, elementStartX + deltaX);
    const newY = Math.max(0, elementStartY + deltaY);
    
    updateElement('textElements', textElement.id, { x: newX, y: newY });
  }
  
  function handleMouseUp() {
    isDragging = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }
  
  function handleDoubleClick(event) {
    event.stopPropagation();
    isEditing = true;
    setTimeout(() => {
      if (textInput) {
        textInput.focus();
        textInput.select();
      }
    }, 0);
  }
  
  function handleInputBlur() {
    isEditing = false;
  }
  
  function handleKeyDown(event) {
    if (isEditing) {
      if (event.key === 'Enter') {
        event.preventDefault();
        isEditing = false;
      } else if (event.key === 'Escape') {
        event.preventDefault();
        isEditing = false;
        // Restore original content if needed
      }
      // Don't propagate keyboard events while editing
      event.stopPropagation();
    }
  }
  
  function handleInput(event) {
    updateElement('textElements', textElement.id, { content: event.target.value });
  }
  
  function handleClick(event) {
    if (!isEditing) {
      event.stopPropagation();
      const multiSelect = event.ctrlKey || event.metaKey;
      selectElement('textElements', textElement.id, multiSelect);
    }
  }
</script>

<div
  class="card-element draggable-element text-element"
  class:dragging={isDragging}
  class:selected={isSelected}
  class:editing={isEditing}
  style="left: {textElement.x}px; top: {textElement.y}px; z-index: {isDragging ? 1000 : isSelected ? 100 : 1};"
  onmousedown={handleMouseDown}
  ondblclick={handleDoubleClick}
  onclick={handleClick}
  role="button"
  tabindex="0"
>
  {#if isEditing}
    <input
      bind:this={textInput}
      type="text"
      value={textElement.content}
      onblur={handleInputBlur}
      onkeydown={handleKeyDown}
      oninput={handleInput}
      class="text-input bg-transparent border-none outline-none resize-none"
      style="font-size: {textElement.fontSize}px; color: {textElement.color}; font-family: {textElement.fontFamily}; font-weight: {textElement.fontWeight}; text-align: {textElement.textAlign}; min-width: 100px;"
    />
  {:else}
    <span
      class="text-content"
      style="font-size: {textElement.fontSize}px; color: {textElement.color}; font-family: {textElement.fontFamily}; font-weight: {textElement.fontWeight}; text-align: {textElement.textAlign}; white-space: nowrap; cursor: {isDragging ? 'grabbing' : 'grab'};"
    >
      {textElement.content}
    </span>
  {/if}
  
  <!-- Selection indicator -->
  {#if isSelected && !isEditing}
    <div class="selection-outline"></div>
  {/if}
</div>

<style>
  .card-element {
    position: absolute;
    user-select: none;
  }
  
  .draggable-element {
    cursor: grab;
    transition: transform 0.1s ease;
  }
  
  .draggable-element.dragging {
    cursor: grabbing;
    transform: scale(1.02);
    z-index: 1000;
  }
  
  .draggable-element.selected {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
    background-color: rgba(59, 130, 246, 0.1);
  }
  
  .draggable-element.editing {
    outline: 2px solid #10b981;
    outline-offset: 2px;
    background-color: rgba(16, 185, 129, 0.1);
  }
  
  .text-input {
    background: rgba(255, 255, 255, 0.9);
    border-radius: 4px;
    padding: 2px 4px;
  }
  
  .text-content {
    display: inline-block;
    padding: 2px;
    border-radius: 2px;
  }
  
  .selection-outline {
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    border: 2px solid #3b82f6;
    border-radius: 4px;
    pointer-events: none;
    background: rgba(59, 130, 246, 0.1);
  }
</style> 