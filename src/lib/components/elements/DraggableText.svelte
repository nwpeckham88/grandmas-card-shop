<!-- Draggable text element with inline editing functionality and selection support -->
<script>
  import { cardState, selectElement, updateElement } from '$lib/stores/cardStore.js';
  
  let { textElement } = $props();
  
  console.log('DraggableText component created with element:', textElement);
  
  let isEditing = $state(false);
  let element = $state();
  let isDragging = $state(false);
  let dragStart = $state({ x: 0, y: 0, elementX: 0, elementY: 0 });
  
  // Get selection state
  let selectedElements = $derived($cardState.selectedElements);
  let isSelected = $derived(selectedElements.includes(textElement.id));
  
  function handleMouseDown(event) {
    if (isEditing) return;
    
    const multiSelect = event.ctrlKey || event.metaKey;
    selectElement(textElement.id, multiSelect);
    
    if (event.button === 0) { // Left click for dragging
      isDragging = true;
      dragStart = {
        x: event.clientX,
        y: event.clientY,
        elementX: textElement.x,
        elementY: textElement.y
      };
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
  }
  
  function handleMouseMove(event) {
    if (!isDragging) return;
    
    const deltaX = event.clientX - dragStart.x;
    const deltaY = event.clientY - dragStart.y;
    
    const newX = Math.max(0, dragStart.elementX + deltaX);
    const newY = Math.max(0, dragStart.elementY + deltaY);
    
    updateElement(textElement.id, { x: newX, y: newY });
  }
  
  function handleMouseUp() {
    isDragging = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }
  
  function handleDoubleClick() {
    isEditing = true;
  }
  
  function handleBlur(event) {
    isEditing = false;
  }
  
  function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      isEditing = false;
    } else if (event.key === 'Escape') {
      isEditing = false;
    }
  }
  
  function handleInput(event) {
    updateElement(textElement.id, { content: event.target.value });
  }
  
  function handleClick(event) {
    const multiSelect = event.ctrlKey || event.metaKey;
    selectElement(textElement.id, multiSelect);
  }
</script>

<div
  bind:this={element}
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
      type="text"
      value={textElement.content}
      oninput={handleInput}
      onblur={handleBlur}
      onkeydown={handleKeyDown}
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