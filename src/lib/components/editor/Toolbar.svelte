<!-- Simple, grandma-friendly toolbar with large buttons and clear sections -->
<script>
  import {
    CARD_SIDES,
    FONT_FAMILIES,
    GREETING_PHRASES,
    addImageElement,
    addTextElement,
    alignElements,
    applyTemplate,
    bringToFront,
    cancelStickerPlacement,
    cardHistory,
    cardState,
    clearCard,
    copySelectedElements,
    deleteSelectedElements,
    pasteElements,
    redo,
    selectSticker,
    sendToBack,
    switchToSide,
    undo,
    updateElement
  } from '$lib/stores/cardStore.js';
  import { createEventDispatcher } from 'svelte';
  import ImageSearchModal from './ImageSearchModal.svelte';

  const dispatch = createEventDispatcher();

  // Reactive state
  $: currentSide = $cardState.currentSide;
  $: selectedElements = $cardState.selectedElements;
  $: hasSelection = selectedElements.length > 0;
  $: hasTextSelection = selectedElements.some(id => $cardState[currentSide].elements[id]?.type === 'text');
  $: canUndo = $cardHistory.past.length > 0;
  $: canRedo = $cardHistory.future.length > 0;
  $: placementMode = $cardState.placementMode;
  $: selectedSticker = $cardState.selectedSticker;

  // Sticker categories and options
  const stickerCategories = {
    hearts: ['❤️', '💕', '💖', '💗', '💝', '💘', '💓', '💞', '💟'],
    flowers: ['🌸', '🌺', '🌻', '🌷', '🌹', '🌼', '💐', '🌿', '🍀'],
    celebration: ['🎉', '🎊', '🎈', '🎁', '🎂', '🎀', '⭐', '✨', '🌟'],
    animals: ['🐱', '🐶', '🐰', '🐻', '🦋', '🐝', '🐞', '🐧', '🦉'],
    seasonal: ['❄️', '🎄', '🎃', '🍂', '🌞', '☀️', '🌙', '⛄', '🌈']
  };

  // UI state
  let showImageSearch = false;
  let showHelp = false;

  // Card side display names
  const sideDisplayNames = {
    'front': 'Front Cover',
    'inside-left': 'Inside Left',
    'inside-right': 'Inside Right',
    'back': 'Back Cover'
  };

  // Functions
  function handleAddText() {
    addTextElement('Click to edit text');
  }

  function handleImageSearch() {
    showImageSearch = true;
  }

  function handleStickerSelect(sticker) {
    selectSticker(sticker);
  }

  function handleUndo() {
    if (canUndo) undo();
  }

  function handleRedo() {
    if (canRedo) redo();
  }

  function handleCopy() {
    if (hasSelection) copySelectedElements();
  }

  function handlePaste() {
    pasteElements();
  }

  function handleDelete() {
    if (hasSelection) deleteSelectedElements();
  }

  function handleClearCard() {
    if (confirm('Are you sure you want to clear this side of the card?')) {
      clearCard(currentSide);
    }
  }

  function handleExportCard() {
    // Export functionality will be implemented
    alert('Export feature coming soon!');
  }

  function applyTextFormat(property, value) {
    if (hasTextSelection) {
      selectedElements.forEach(id => {
        const element = $cardState[currentSide].elements[id];
        if (element?.type === 'text') {
          updateElement(id, { [property]: value });
        }
      });
    }
  }

  function insertGreeting(phrase) {
    addTextElement(phrase);
  }

  function handleTemplateSelect(template) {
    if (confirm(`Apply ${template} template? This will clear the current card.`)) {
      applyTemplate(template);
    }
  }

  function handleSideSwitch(side) {
    switchToSide(side);
  }
</script>

<!-- Grandma-Friendly Toolbar -->
<div class="bg-base-100 border-b-4 border-base-300 p-4">
  <!-- Top Section: Main Actions -->
  <div class="flex flex-wrap gap-4 items-center justify-center mb-6">
    <!-- Undo/Redo -->
    <div class="flex gap-2">
      <button 
        class="btn btn-primary btn-grandma tooltip tooltip-bottom" 
        class:btn-disabled={!canUndo}
        on:click={handleUndo}
        data-tip="Undo (Ctrl+Z)"
      >
        <span class="text-xl">↶</span>
        <span class="text-grandma">Undo</span>
      </button>
      <button 
        class="btn btn-primary btn-grandma tooltip tooltip-bottom" 
        class:btn-disabled={!canRedo}
        on:click={handleRedo}
        data-tip="Redo (Ctrl+Y)"
      >
        <span class="text-xl">↷</span>
        <span class="text-grandma">Redo</span>
      </button>
    </div>

    <!-- Divider -->
    <div class="divider divider-horizontal"></div>

    <!-- Add Content -->
    <div class="flex gap-2">
      <button 
        class="btn btn-success btn-grandma-xl tooltip tooltip-bottom" 
        on:click={handleAddText}
        data-tip="Add Text (Ctrl+T)"
      >
        <span class="text-2xl">📝</span>
        <span class="text-grandma-lg">Add Text</span>
      </button>
      <button 
        class="btn btn-info btn-grandma-xl tooltip tooltip-bottom" 
        on:click={handleImageSearch}
        data-tip="Add Picture"
      >
        <span class="text-2xl">🖼️</span>
        <span class="text-grandma-lg">Add Picture</span>
      </button>
    </div>

    <!-- Divider -->
    <div class="divider divider-horizontal"></div>

    <!-- Card Actions -->
    <div class="flex gap-2">
      <button 
        class="btn btn-warning btn-grandma tooltip tooltip-bottom" 
        on:click={handleClearCard}
        data-tip="Clear this side"
      >
        <span class="text-xl">🗑️</span>
        <span class="text-grandma">Clear</span>
      </button>
      <button 
        class="btn btn-accent btn-grandma tooltip tooltip-bottom" 
        on:click={handleExportCard}
        data-tip="Save card as image"
      >
        <span class="text-xl">💾</span>
        <span class="text-grandma">Save</span>
      </button>
    </div>
  </div>

  <!-- Quick Greeting Phrases -->
  <div class="mb-6">
    <h3 class="text-grandma-lg font-bold mb-3 text-center">Quick Greetings</h3>
    <div class="flex flex-wrap gap-2 justify-center">
      {#each Object.entries(GREETING_PHRASES) as [category, phrases]}
        <div class="dropdown dropdown-hover">
          <div tabindex="0" role="button" class="btn btn-outline btn-grandma">
            <span class="text-grandma capitalize">{category}</span>
            <span class="text-lg">▼</span>
          </div>
          <ul tabindex="0" class="dropdown-content menu bg-base-100 rounded-box z-50 w-64 p-2 shadow-xl border-2">
            {#each phrases as phrase}
              <li>
                <button 
                  class="text-grandma p-3 hover:bg-primary hover:text-primary-content rounded-lg"
                  on:click={() => insertGreeting(phrase)}
                >
                  {phrase}
                </button>
              </li>
            {/each}
          </ul>
        </div>
      {/each}
    </div>
  </div>

  <!-- Stickers Section -->
  <div class="mb-6">
    <h3 class="text-grandma-lg font-bold mb-3 text-center">Add Stickers</h3>
    <div class="flex flex-wrap gap-2 justify-center">
      {#each Object.entries(stickerCategories) as [category, stickers]}
        <div class="dropdown dropdown-hover">
          <div tabindex="0" role="button" class="btn btn-outline btn-grandma">
            <span class="text-2xl">{stickers[0]}</span>
            <span class="text-grandma capitalize">{category}</span>
          </div>
          <div tabindex="0" class="dropdown-content bg-base-100 rounded-box z-50 p-4 shadow-xl border-2">
            <div class="grid grid-cols-3 gap-3 w-48">
              {#each stickers as sticker}
                <button 
                  class="btn btn-ghost btn-square btn-lg text-3xl hover:bg-primary hover:scale-110 transition-all"
                  class:bg-primary={selectedSticker === sticker}
                  class:text-primary-content={selectedSticker === sticker}
                  on:click={() => handleStickerSelect(sticker)}
                  title="Click to select, then click on card to place"
                >
                  {sticker}
                </button>
              {/each}
            </div>
          </div>
        </div>
      {/each}
    </div>
    
    {#if placementMode}
      <div class="alert alert-info mt-3">
        <span class="text-2xl">👆</span>
        <div class="text-grandma">
          <strong>Click on the card to place your sticker!</strong>
          <br>Press Escape to cancel
        </div>
        <button class="btn btn-sm btn-ghost" on:click={cancelStickerPlacement}>Cancel</button>
      </div>
    {/if}
  </div>

  <!-- Card Navigation -->
  <div class="mb-6">
    <h3 class="text-grandma-lg font-bold mb-3 text-center">Card Sides</h3>
    <div class="flex flex-wrap gap-2 justify-center">
      {#each CARD_SIDES as side}
        <button 
          class="btn btn-grandma"
          class:btn-primary={currentSide === side}
          class:btn-outline={currentSide !== side}
          on:click={() => handleSideSwitch(side)}
        >
          <span class="text-grandma">{sideDisplayNames[side]}</span>
        </button>
      {/each}
    </div>
  </div>

  <!-- Selection Tools (only show when items are selected) -->
  {#if hasSelection}
    <div class="mb-6 p-4 bg-primary/10 rounded-box border-2 border-primary/20">
      <h3 class="text-grandma-lg font-bold mb-3 text-center text-primary">Selected Items</h3>
      
      <!-- Copy/Paste/Delete -->
      <div class="flex gap-2 justify-center mb-4">
        <button class="btn btn-primary btn-grandma" on:click={handleCopy}>
          <span class="text-xl">📋</span>
          <span class="text-grandma">Copy</span>
        </button>
        <button class="btn btn-primary btn-grandma" on:click={handlePaste}>
          <span class="text-xl">📄</span>
          <span class="text-grandma">Paste</span>
        </button>
        <button class="btn btn-error btn-grandma" on:click={handleDelete}>
          <span class="text-xl">🗑️</span>
          <span class="text-grandma">Delete</span>
        </button>
      </div>

      <!-- Alignment Tools -->
      <div class="flex gap-2 justify-center mb-4">
        <button class="btn btn-outline btn-sm" on:click={() => alignElements('left')}>↤ Left</button>
        <button class="btn btn-outline btn-sm" on:click={() => alignElements('center')}>↕ Center</button>
        <button class="btn btn-outline btn-sm" on:click={() => alignElements('right')}>↦ Right</button>
        <button class="btn btn-outline btn-sm" on:click={() => alignElements('top')}>↥ Top</button>
        <button class="btn btn-outline btn-sm" on:click={() => alignElements('bottom')}>↧ Bottom</button>
      </div>

      <!-- Layer Tools -->
      <div class="flex gap-2 justify-center">
        <button class="btn btn-outline btn-sm" on:click={bringToFront}>↑ Front</button>
        <button class="btn btn-outline btn-sm" on:click={sendToBack}>↓ Back</button>
      </div>

      <!-- Text Formatting (only for text elements) -->
      {#if hasTextSelection}
        <div class="mt-4 p-3 bg-base-100 rounded-lg">
          <h4 class="text-grandma font-bold mb-2">Text Formatting</h4>
          
          <!-- Font Size -->
          <div class="flex gap-2 items-center mb-2">
            <span class="text-grandma">Size:</span>
            <input 
              type="range" 
              class="range range-primary range-sm flex-1" 
              min="12" 
              max="72" 
              step="2"
              on:input={(e) => applyTextFormat('fontSize', e.target.value + 'px')}
            >
          </div>

          <!-- Font Family -->
          <div class="flex gap-2 items-center mb-2">
            <span class="text-grandma">Font:</span>
            <select 
              class="select select-primary select-sm flex-1"
              on:change={(e) => applyTextFormat('fontFamily', e.target.value)}
            >
              {#each FONT_FAMILIES as font}
                <option value={font.value}>{font.name}</option>
              {/each}
            </select>
          </div>

          <!-- Text Color -->
          <div class="flex gap-2 items-center">
            <span class="text-grandma">Color:</span>
            <input 
              type="color" 
              class="w-16 h-8 rounded border-2"
              on:change={(e) => applyTextFormat('color', e.target.value)}
            >
          </div>
        </div>
      {/if}
    </div>
  {/if}

  <!-- Help Button -->
  <div class="text-center">
    <button 
      class="btn btn-ghost btn-grandma tooltip tooltip-top" 
      on:click={() => showHelp = true}
      data-tip="Get help (F1)"
    >
      <span class="text-xl">❓</span>
      <span class="text-grandma">Help</span>
    </button>
  </div>
</div>

<!-- Help Modal -->
{#if showHelp}
  <div class="modal modal-open">
    <div class="modal-box max-w-4xl">
      <h3 class="text-grandma-xl font-bold mb-4">How to Use Grandma's Card Creator</h3>
      
      <div class="space-y-4 text-grandma">
        <div class="card bg-base-200">
          <div class="card-body">
            <h4 class="card-title text-grandma-lg">Adding Content</h4>
            <ul class="list-disc list-inside space-y-1">
              <li>Click "Add Text" to add words to your card</li>
              <li>Click "Add Picture" to search for photos</li>
              <li>Choose stickers from the categories above</li>
              <li>Use "Quick Greetings" for common messages</li>
            </ul>
          </div>
        </div>

        <div class="card bg-base-200">
          <div class="card-body">
            <h4 class="card-title text-grandma-lg">Moving Things Around</h4>
            <ul class="list-disc list-inside space-y-1">
              <li>Click and drag any item to move it</li>
              <li>Click on an item to select it (blue outline)</li>
              <li>Hold Ctrl and click to select multiple items</li>
              <li>Use the corner handles to resize pictures and stickers</li>
            </ul>
          </div>
        </div>

        <div class="card bg-base-200">
          <div class="card-body">
            <h4 class="card-title text-grandma-lg">Keyboard Shortcuts</h4>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p><kbd class="kbd">Ctrl</kbd> + <kbd class="kbd">Z</kbd> Undo</p>
                <p><kbd class="kbd">Ctrl</kbd> + <kbd class="kbd">Y</kbd> Redo</p>
                <p><kbd class="kbd">Ctrl</kbd> + <kbd class="kbd">C</kbd> Copy</p>
                <p><kbd class="kbd">Ctrl</kbd> + <kbd class="kbd">V</kbd> Paste</p>
              </div>
              <div>
                <p><kbd class="kbd">Delete</kbd> Remove selected</p>
                <p><kbd class="kbd">Ctrl</kbd> + <kbd class="kbd">T</kbd> Add text</p>
                <p><kbd class="kbd">F1</kbd> Show this help</p>
                <p><kbd class="kbd">Escape</kbd> Cancel sticker</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-action">
        <button class="btn btn-primary btn-grandma" on:click={() => showHelp = false}>
          <span class="text-grandma">Got it!</span>
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- Image Search Modal -->
{#if showImageSearch}
  <ImageSearchModal 
    on:close={() => showImageSearch = false}
    on:select={(event) => {
      addImageElement(event.detail.url);
      showImageSearch = false;
    }}
  />
{/if} 