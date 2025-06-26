<!-- Draggable sticker element with resize handles and selection support -->
<script>
  import { cardState, selectElement, updateElement } from '$lib/stores/cardStore.js';
  
  export let stickerElement;
  
  let isDragging = false;
  let isResizing = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let elementStartX = 0;
  let elementStartY = 0;
  let resizeStartWidth = 0;
  let resizeStartHeight = 0;
  
  // Check if this element is selected
  $: isSelected = $cardState.selectedElements.includes(`stickerElements:${stickerElement.id}`);
  
  function handleMouseDown(event) {
    if (event.target.classList.contains('resize-handle')) {
      return; // Let resize handle its own mouse events
    }
    
    // Handle multi-selection with Ctrl/Cmd key
    const multiSelect = event.ctrlKey || event.metaKey;
    selectElement('stickerElements', stickerElement.id, multiSelect);
    
    isDragging = true;
    dragStartX = event.clientX;
    dragStartY = event.clientY;
    elementStartX = stickerElement.x;
    elementStartY = stickerElement.y;
    
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
    
    updateElement('stickerElements', stickerElement.id, { x: newX, y: newY });
  }
  
  function handleMouseUp() {
    isDragging = false;
    isResizing = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeUp);
  }
  
  function handleResizeStart(event) {
    isResizing = true;
    dragStartX = event.clientX;
    dragStartY = event.clientY;
    resizeStartWidth = stickerElement.width;
    resizeStartHeight = stickerElement.height;
    
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeUp);
    
    event.stopPropagation();
    event.preventDefault();
  }
  
  function handleResizeMove(event) {
    if (!isResizing) return;
    
    const deltaX = event.clientX - dragStartX;
    const deltaY = event.clientY - dragStartY;
    
    const newWidth = Math.max(20, resizeStartWidth + deltaX);
    const newHeight = Math.max(20, resizeStartHeight + deltaY);
    
    updateElement('stickerElements', stickerElement.id, { width: newWidth, height: newHeight });
  }
  
  function handleResizeUp() {
    isResizing = false;
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeUp);
  }
  
  function handleClick(event) {
    event.stopPropagation();
    const multiSelect = event.ctrlKey || event.metaKey;
    selectElement('stickerElements', stickerElement.id, multiSelect);
  }
</script>

<div
  class="card-element draggable-element sticker-element"
  class:dragging={isDragging}
  class:resizing={isResizing}
  class:selected={isSelected}
  style="left: {stickerElement.x}px; top: {stickerElement.y}px; width: {stickerElement.width}px; height: {stickerElement.height}px; z-index: {isDragging || isResizing ? 1000 : isSelected ? 100 : 1};"
  on:mousedown={handleMouseDown}
  on:click={handleClick}
  role="button"
  tabindex="0"
>
  <img 
    src={stickerElement.src} 
    alt="Sticker: {stickerElement.emoji || 'sticker'}"
    class="element-sticker"
    draggable="false"
  />
  
  <!-- Resize handles (only show when selected) -->
  {#if isSelected}
    <div class="resize-handles">
      <!-- Corner resize handles -->
      <div 
        class="resize-handle corner-handle top-left"
        on:mousedown={handleResizeStart}
        role="button"
        tabindex="0"
      ></div>
      <div 
        class="resize-handle corner-handle top-right"
        on:mousedown={handleResizeStart}
        role="button"
        tabindex="0"
      ></div>
      <div 
        class="resize-handle corner-handle bottom-left"
        on:mousedown={handleResizeStart}
        role="button"
        tabindex="0"
      ></div>
      <div 
        class="resize-handle corner-handle bottom-right"
        on:mousedown={handleResizeStart}
        role="button"
        tabindex="0"
      ></div>
    </div>
  {/if}
  
  <!-- Selection indicator -->
  {#if isSelected}
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
  
  .draggable-element.resizing {
    z-index: 1000;
  }
  
  .draggable-element.selected {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
    background-color: rgba(59, 130, 246, 0.1);
  }
  
  .element-sticker {
    width: 100%;
    height: 100%;
    object-fit: contain;
    border-radius: 4px;
    pointer-events: none;
  }
  
  .resize-handles {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
  }
  
  .resize-handle {
    position: absolute;
    background: #3b82f6;
    border: 2px solid white;
    border-radius: 50%;
    width: 12px;
    height: 12px;
    pointer-events: all;
    cursor: nw-resize;
    z-index: 10;
  }
  
  .resize-handle:hover {
    background: #2563eb;
    transform: scale(1.2);
  }
  
  .corner-handle.top-left {
    top: -6px;
    left: -6px;
    cursor: nw-resize;
  }
  
  .corner-handle.top-right {
    top: -6px;
    right: -6px;
    cursor: ne-resize;
  }
  
  .corner-handle.bottom-left {
    bottom: -6px;
    left: -6px;
    cursor: sw-resize;
  }
  
  .corner-handle.bottom-right {
    bottom: -6px;
    right: -6px;
    cursor: se-resize;
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