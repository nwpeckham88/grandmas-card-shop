<!-- Draggable image element with resize handles and selection support -->
<script>
  import { cardState, selectElement, updateElement } from '$lib/stores/cardStore.js';
  
  let { imageElement } = $props();
  
  let element = $state();
  let isDragging = $state(false);
  let isResizing = $state(false);
  let dragStart = $state({ x: 0, y: 0, elementX: 0, elementY: 0 });
  let resizeStart = $state({ width: 0, height: 0, x: 0, y: 0 });
  
  // Get selection state
  let selectedElements = $derived($cardState.selectedElements);
  let isSelected = $derived(selectedElements.includes(imageElement.id));
  
  function handleMouseDown(event) {
    const multiSelect = event.ctrlKey || event.metaKey;
    selectElement(imageElement.id, multiSelect);
    
    if (event.button === 0 && !event.target.classList.contains('resize-handle')) {
      // Left click for dragging (not on resize handle)
      isDragging = true;
      dragStart = {
        x: event.clientX,
        y: event.clientY,
        elementX: imageElement.x,
        elementY: imageElement.y
      };
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
  }
  
  function handleMouseMove(event) {
    if (isDragging) {
      const deltaX = event.clientX - dragStart.x;
      const deltaY = event.clientY - dragStart.y;
      
      const newX = Math.max(0, dragStart.elementX + deltaX);
      const newY = Math.max(0, dragStart.elementY + deltaY);
      
      updateElement(imageElement.id, { x: newX, y: newY });
    } else if (isResizing) {
      const deltaX = event.clientX - resizeStart.x;
      const deltaY = event.clientY - resizeStart.y;
      
      const aspectRatio = resizeStart.width / resizeStart.height;
      const newWidth = Math.max(20, resizeStart.width + deltaX);
      const newHeight = Math.max(20, newWidth / aspectRatio);
      
      updateElement(imageElement.id, { width: newWidth, height: newHeight });
    }
  }
  
  function handleMouseUp() {
    isDragging = false;
    isResizing = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }
  
  function handleResizeStart(event) {
    event.stopPropagation();
    isResizing = true;
    resizeStart = {
      width: imageElement.width,
      height: imageElement.height,
      x: event.clientX,
      y: event.clientY
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }
  
  function handleClick(event) {
    const multiSelect = event.ctrlKey || event.metaKey;
    selectElement(imageElement.id, multiSelect);
  }
</script>

<div
  bind:this={element}
  class="card-element draggable-element image-element"
  class:dragging={isDragging}
  class:resizing={isResizing}
  class:selected={isSelected}
  style="left: {imageElement.x}px; top: {imageElement.y}px; z-index: {isDragging || isResizing ? 1000 : isSelected ? 100 : 1};"
  onmousedown={handleMouseDown}
  onclick={handleClick}
  role="button"
  tabindex="0"
>
  <img 
    src={imageElement.src} 
    alt="Card image"
    class="element-image"
    style="width: {imageElement.width}px; height: {imageElement.height}px;"
    draggable="false"
  />
  
  <!-- Resize handles (only show when selected) -->
  {#if isSelected}
    <div class="resize-handles">
      <!-- Corner resize handles -->
      <div 
        class="resize-handle corner-handle top-left"
        onmousedown={handleResizeStart}
        role="button"
        tabindex="0"
      ></div>
      <div 
        class="resize-handle corner-handle top-right"
        onmousedown={handleResizeStart}
        role="button"
        tabindex="0"
      ></div>
      <div 
        class="resize-handle corner-handle bottom-left"
        onmousedown={handleResizeStart}
        role="button"
        tabindex="0"
      ></div>
      <div 
        class="resize-handle corner-handle bottom-right"
        onmousedown={handleResizeStart}
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
  
  .element-image {
    display: block;
    object-fit: cover;
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