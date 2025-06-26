<!-- Modern card canvas with view mode support and scaling -->
<script>
  import { cancelStickerPlacement, cardState, clearSelection, currentSideData, placeStickerAt } from '$lib/stores/cardStore.js';
  import DraggableImage from '../elements/DraggableImage.svelte';
  import DraggableSticker from '../elements/DraggableSticker.svelte';
  import DraggableText from '../elements/DraggableText.svelte';
  
  let { viewMode = 'spread' } = $props();
  
  let canvasElement = $state();
  let mouseX = $state(0);
  let mouseY = $state(0);
  let showPreview = $state(false);
  
  // Reactive declarations for current card state
  let cardSize = $derived($cardState.cardSize);
  let currentSide = $derived($cardState.currentSide);
  let sideData = $derived($currentSideData);
  let selectedSticker = $derived($cardState.selectedSticker);
  let placementMode = $derived($cardState.placementMode);
  
  // Convert elements object to arrays based on element type
  let textElements = $derived(() => {
    if (!sideData?.elements) return [];
    return Object.values(sideData.elements).filter(el => el.type === 'text');
  });
  
  let imageElements = $derived(() => {
    if (!sideData?.elements) return [];
    return Object.values(sideData.elements).filter(el => el.type === 'image');
  });
  
  let stickerElements = $derived(() => {
    if (!sideData?.elements) return [];
    return Object.values(sideData.elements).filter(el => el.type === 'sticker');
  });
  
  // Get side display information
  function getSideDisplayName(side) {
    const names = {
      'front': 'Front Cover',
      'inside-left': 'Inside Left',
      'inside-right': 'Inside Right',
      'back': 'Back Cover'
    };
    return names[side] || side;
  }

  function getSideEmoji(side) {
    const emojis = {
      'front': '📄',
      'inside-left': '📖',
      'inside-right': '📖',
      'back': '📋'
    };
    return emojis[side] || '📄';
  }

  // Check if current side is inside spread
  let isInsideSpread = $derived(currentSide === 'inside-left' || currentSide === 'inside-right');
  
  // Determine if we should show spread view
  let shouldShowSpread = $derived(isInsideSpread && viewMode === 'spread');
  
  // Get companion side for spread view
  let companionSide = $derived(currentSide === 'inside-left' ? 'inside-right' : 
                    currentSide === 'inside-right' ? 'inside-left' : null);
  let companionData = $derived(companionSide && shouldShowSpread ? $cardState[companionSide] : null);
  
  // Convert companion elements to arrays
  let companionTextElements = $derived(() => {
    if (!companionData?.elements) return [];
    return Object.values(companionData.elements).filter(el => el.type === 'text');
  });
  
  let companionImageElements = $derived(() => {
    if (!companionData?.elements) return [];
    return Object.values(companionData.elements).filter(el => el.type === 'image');
  });
  
  let companionStickerElements = $derived(() => {
    if (!companionData?.elements) return [];
    return Object.values(companionData.elements).filter(el => el.type === 'sticker');
  });
  
  export function getCanvasElement() {
    return canvasElement;
  }
  
  function handleCanvasClick(event) {
    // If in placement mode, place sticker
    if (placementMode && selectedSticker) {
      const rect = canvasElement.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      
      // Adjust coordinates for spread view
      let adjustedX = x;
      if (shouldShowSpread && currentSide === 'inside-right') {
        // For inside-right in spread view, adjust X coordinate
        adjustedX = x - cardSize.width;
      }
      
      if (adjustedX >= 0 && adjustedX <= cardSize.width && y >= 0 && y <= cardSize.height) {
        placeStickerAt(adjustedX, y);
      }
      return;
    }
    
    // Otherwise, clear selection when clicking on empty canvas
    if (event.target === canvasElement || event.target.classList.contains('card-canvas')) {
      clearSelection();
    }
  }
  
  function handleCanvasMouseMove(event) {
    if (!placementMode || !selectedSticker) return;
    
    const rect = canvasElement.getBoundingClientRect();
    mouseX = event.clientX - rect.left;
    mouseY = event.clientY - rect.top;
    showPreview = true;
  }
  
  function handleCanvasMouseLeave() {
    showPreview = false;
  }
  
  function handleKeyDown(event) {
    if (event.key === 'Escape' && placementMode) {
      cancelStickerPlacement();
    }
  }
</script>

<svelte:window onkeydown={handleKeyDown} />

<div class="card-editor-container">
  <!-- Minimal side indicator for single page view -->
  {#if isInsideSpread && viewMode === 'single'}
    <div class="text-center mb-4">
      <div class="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-lg">
        <span class="text-lg">{getSideEmoji(currentSide)}</span>
        <span class="font-medium text-blue-900">{getSideDisplayName(currentSide)} - Single Page View</span>
      </div>
    </div>
  {/if}
  
  <!-- Show companion side indicator in spread view -->
  {#if shouldShowSpread && companionData}
    <div class="flex items-center gap-2 text-sm text-gray-600">
      <span>Also editing:</span>
      <span class="text-lg">{getSideEmoji(companionSide)}</span>
      <span>{getSideDisplayName(companionSide)}</span>
    </div>
  {/if}
  
  <!-- Placement mode indicator -->
  {#if placementMode}
    <div class="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
      <span>🎯</span>
      <span>Click to place sticker</span>
    </div>
  {/if}
  
  <!-- Card canvas -->
  <div
    bind:this={canvasElement}
    class="card-canvas border-2 border-gray-300 relative mx-auto shadow-lg"
    class:placement-mode={placementMode}
    style="width: {shouldShowSpread ? cardSize.width * 2 : cardSize.width}px; height: {cardSize.height}px; background-color: {sideData.backgroundColor};"
    data-side={currentSide}
    onclick={handleCanvasClick}
    onmousemove={handleCanvasMouseMove}
    onmouseleave={handleCanvasMouseLeave}
    role="button"
    tabindex="0"
  >
    <!-- Spread Divider Line -->
    {#if shouldShowSpread}
      <div 
        class="absolute top-0 bottom-0 border-l-2 border-dashed border-gray-400 z-10"
        style="left: {cardSize.width}px;"
        title="Center fold of the card"
      ></div>
    {/if}
    
    <!-- Current Side Elements Container -->
    <div 
      class="absolute inset-0"
      style="width: {cardSize.width}px; left: {currentSide === 'inside-right' && shouldShowSpread ? cardSize.width + 'px' : '0px'};"
    >
      <!-- Text elements -->
      {#each textElements as textElement (textElement.id)}
        <DraggableText textElement={textElement} />
      {/each}
      
      <!-- Image elements -->
      {#each imageElements as imageElement (imageElement.id)}
        <DraggableImage imageElement={imageElement} />
      {/each}
      
      <!-- Sticker elements -->
      {#each stickerElements as stickerElement (stickerElement.id)}
        <DraggableSticker stickerElement={stickerElement} />
      {/each}
    </div>

    <!-- Companion Side Elements (for spread view preview) -->
    {#if shouldShowSpread && companionData}
      <div 
        class="absolute inset-0 pointer-events-none opacity-50"
        style="width: {cardSize.width}px; left: {currentSide === 'inside-left' ? cardSize.width + 'px' : '0px'};"
      >
        <!-- Companion Text Elements -->
        {#each companionTextElements as textElement (textElement.id)}
          <div 
            class="absolute select-none text-gray-600"
            style="
              left: {textElement.x}px;
              top: {textElement.y}px;
              font-size: {textElement.fontSize}px;
              color: {textElement.color}80;
              font-family: {textElement.fontFamily};
              font-weight: {textElement.fontWeight};
              text-align: {textElement.textAlign};
            "
          >
            {textElement.content}
          </div>
        {/each}

        <!-- Companion Image Elements -->
        {#each companionImageElements as imageElement (imageElement.id)}
          <div 
            class="absolute border border-dashed border-gray-400"
            style="
              left: {imageElement.x}px;
              top: {imageElement.y}px;
              width: {imageElement.width}px;
              height: {imageElement.height}px;
            "
          >
            <img 
              src={imageElement.src} 
              alt="Preview"
              class="w-full h-full object-cover opacity-70"
              draggable="false"
            />
          </div>
        {/each}

        <!-- Companion Sticker Elements -->
        {#each companionStickerElements as stickerElement (stickerElement.id)}
          <div 
            class="absolute opacity-70"
            style="
              left: {stickerElement.x}px;
              top: {stickerElement.y}px;
              width: {stickerElement.width}px;
              height: {stickerElement.height}px;
            "
          >
            <img 
              src={stickerElement.src} 
              alt="Sticker preview"
              class="w-full h-full object-contain"
              draggable="false"
            />
          </div>
        {/each}
      </div>
    {/if}
    
    <!-- Sticker placement preview -->
    {#if placementMode && selectedSticker && showPreview}
      <div 
        class="sticker-preview pointer-events-none"
        style="left: {mouseX - 40}px; top: {mouseY - 40}px;"
      >
        <img 
          src={selectedSticker.dataURL} 
          alt="Sticker preview"
          class="opacity-70"
          style="width: 80px; height: 80px;"
        />
      </div>
    {/if}
    
    <!-- Empty state message -->
    {#if textElements.length === 0 && imageElements.length === 0 && stickerElements.length === 0}
      <div class="absolute inset-0 flex items-center justify-center text-gray-400 pointer-events-none">
        <div class="text-center">
          <div class="text-6xl mb-4">
            {currentSide === 'front' ? '🎨' : '💌'}
          </div>
          <p class="text-lg">
            {currentSide === 'front' 
              ? 'Start designing your card front!' 
              : 'Add content to the inside of your card!'}
          </p>
          <p class="text-sm mt-2">
            {placementMode 
              ? 'Click to place your selected sticker!'
              : 'Use the toolbar above to add text, images, or stickers'}
          </p>
        </div>
      </div>
    {/if}
    
    <!-- Placement mode overlay -->
    {#if placementMode}
      <div class="placement-overlay pointer-events-none">
        <div class="placement-crosshair" style="left: {mouseX}px; top: {mouseY}px;"></div>
      </div>
    {/if}
  </div>
</div>

<style>
  .card-editor-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
  }
  
  .side-indicator {
    text-align: center;
    margin-bottom: 0.5rem;
  }
  
  .card-canvas {
    background-color: white;
    background-image: 
      linear-gradient(45deg, #f0f0f0 25%, transparent 25%), 
      linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), 
      linear-gradient(45deg, transparent 75%, #f0f0f0 75%), 
      linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
    background-size: 20px 20px;
    background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
    border-radius: 8px;
    transition: all 0.3s ease;
  }
  
  .card-canvas:hover {
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
  
  .card-canvas.placement-mode {
    cursor: crosshair;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
  }
  
  .sticker-preview {
    position: absolute;
    z-index: 1000;
    transform: translate(-50%, -50%);
    pointer-events: none;
  }
  
  .placement-overlay {
    position: absolute;
    inset: 0;
    z-index: 999;
  }
  
  .placement-crosshair {
    position: absolute;
    width: 2px;
    height: 2px;
    background: #3b82f6;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    box-shadow: 
      0 0 0 8px rgba(59, 130, 246, 0.1),
      0 0 0 16px rgba(59, 130, 246, 0.05);
  }
  
  .placement-crosshair::before,
  .placement-crosshair::after {
    content: '';
    position: absolute;
    background: #3b82f6;
    opacity: 0.6;
  }
  
  .placement-crosshair::before {
    width: 20px;
    height: 1px;
    left: -10px;
    top: -0.5px;
  }
  
  .placement-crosshair::after {
    width: 1px;
    height: 20px;
    left: -0.5px;
    top: -10px;
  }
</style> 