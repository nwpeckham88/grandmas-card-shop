<!-- Modern card editor with professional layout: top toolbar, side panels, centered canvas -->
<script>
  import { browser } from '$app/environment';
  import CardCanvas from '$lib/components/editor/CardCanvas.svelte';
  import ImageSearchModal from '$lib/components/editor/ImageSearchModal.svelte';
  import {
    CARD_SIDES,
    FONT_FAMILIES,
    GREETING_PHRASES,
    addImageElement,
    addTextElement,
    alignElements,
    bringToFront,
    cancelStickerPlacement,
    cardHistory,
    cardState,
    clearCard,
    clearSelection,
    copySelectedElements,
    deleteSelectedElements,
    pasteElements,
    redo,
    selectAllElements,
    selectSticker,
    sendToBack,
    setBackgroundColor,
    switchToSide,
    undo,
    updateElement
  } from '$lib/stores/cardStore.js';
  import { onMount } from 'svelte';

  // Reactive state
  let currentSide = $derived($cardState.currentSide);
  let cardSize = $derived($cardState.cardSize);
  let selectedElements = $derived($cardState.selectedElements);
  let hasSelection = $derived(selectedElements.length > 0);
  let hasTextSelection = $derived(selectedElements.some(id => $cardState[currentSide].elements[id]?.type === 'text'));
  let canUndo = $derived($cardHistory.past.length > 0);
  let canRedo = $derived($cardHistory.future.length > 0);
  let placementMode = $derived($cardState.placementMode);
  
  // New view mode state
  let viewMode = $state('spread'); // 'spread' or 'single'
  let showImageSearch = $state(false);
  let showHelpModal = $state(false);

  // Sticker categories
  const stickerCategories = {
    hearts: ['❤️', '💕', '💖', '💗', '💝', '💘', '💓', '💞', '💟'],
    flowers: ['🌸', '🌺', '🌻', '🌷', '🌹', '🌼', '💐', '🌿', '🍀'],
    celebration: ['🎉', '🎊', '🎈', '🎁', '🎂', '🎀', '⭐', '✨', '🌟'],
    animals: ['🐱', '🐶', '🐰', '🐻', '🦋', '🐝', '🐞', '🐧', '🦉'],
    seasonal: ['❄️', '🎄', '🎃', '🍂', '🌞', '☀️', '🌙', '⛄', '🌈']
  };

  // Helper functions
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

  function getSideStats(side) {
    const data = $cardState[side];
    const elements = data.elements || {};
    const texts = Object.values(elements).filter(el => el.type === 'text').length;
    const images = Object.values(elements).filter(el => el.type === 'image').length;
    const stickers = Object.values(elements).filter(el => el.type === 'sticker').length;
    return { texts, images, stickers, total: texts + images + stickers };
  }

  function isInsideSpread() {
    return currentSide === 'inside-left' || currentSide === 'inside-right';
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

  // Keyboard shortcuts
  function handleKeydown(event) {
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
      return;
    }

    const isCtrl = event.ctrlKey || event.metaKey;

    if (isCtrl) {
      switch (event.key.toLowerCase()) {
        case 'z':
          event.preventDefault();
          if (event.shiftKey) {
            redo();
          } else {
            undo();
          }
          break;
        case 'y':
          event.preventDefault();
          redo();
          break;
        case 't':
          event.preventDefault();
          addTextElement();
          break;
        case 'c':
          event.preventDefault();
          copySelectedElements();
          break;
        case 'v':
          event.preventDefault();
          pasteElements();
          break;
        case 'a':
          event.preventDefault();
          selectAllElements();
          break;
      }
    } else {
      switch (event.key) {
        case 'Delete':
        case 'Backspace':
          event.preventDefault();
          deleteSelectedElements();
          break;
        case 'Escape':
          event.preventDefault();
          clearSelection();
          break;
        case 'F1':
          event.preventDefault();
          showHelpModal = true;
          break;
      }
    }
  }

  onMount(() => {
    if (browser) {
      document.addEventListener('keydown', handleKeydown);
      return () => {
        document.removeEventListener('keydown', handleKeydown);
      };
    }
  });
</script>

<svelte:head>
  <title>Create Your Card - Grandma's Card Shop</title>
  <meta name="description" content="Create beautiful greeting cards with our easy-to-use editor" />
</svelte:head>

<div class="h-screen flex flex-col bg-gray-50">
  <!-- Top Toolbar -->
  <div class="bg-white shadow-lg border-b p-4 flex-shrink-0">
    <div class="flex items-center justify-between">
      <!-- Left: App Info & Navigation -->
      <div class="flex items-center gap-6">
        <a href="/" class="btn btn-ghost">← Home</a>
        <div class="h-8 border-l border-gray-300"></div>
        <h1 class="text-2xl font-bold text-gray-900">Card Editor</h1>
        
        <!-- Current Side Display -->
        <div class="flex items-center gap-3 px-4 py-2 bg-blue-100 rounded-xl">
          <span class="text-2xl">{getSideEmoji(currentSide)}</span>
          <div>
            <div class="font-bold text-blue-900">{getSideDisplayName(currentSide)}</div>
            <div class="text-sm text-blue-700">{cardSize.name}</div>
          </div>
        </div>
      </div>

      <!-- Center: Main Actions -->
      <div class="flex items-center gap-4">
        <!-- Undo/Redo -->
        <div class="flex gap-2">
          <button class="btn btn-primary" class:btn-disabled={!canUndo} onclick={undo} title="Undo (Ctrl+Z)">
            ↶ Undo
          </button>
          <button class="btn btn-primary" class:btn-disabled={!canRedo} onclick={redo} title="Redo (Ctrl+Y)">
            ↷ Redo
          </button>
        </div>

        <div class="divider divider-horizontal"></div>

        <!-- Add Content -->
        <div class="flex gap-2">
          <button class="btn btn-success" onclick={() => addTextElement('Click to edit')} title="Add Text (Ctrl+T)">
            📝 Add Text
          </button>
          <button class="btn btn-info" onclick={() => showImageSearch = true} title="Add Picture">
            🖼️ Add Picture
          </button>
        </div>

        <div class="divider divider-horizontal"></div>

        <!-- View Mode Toggle for Inside Spread -->
        {#if isInsideSpread()}
          <div class="flex gap-2">
            <button 
              class="btn" 
              class:btn-primary={viewMode === 'spread'}
              class:btn-outline={viewMode !== 'spread'}
              onclick={() => viewMode = 'spread'}
              title="View both inside pages"
            >
              📖 Spread View
            </button>
            <button 
              class="btn" 
              class:btn-primary={viewMode === 'single'}
              class:btn-outline={viewMode !== 'single'}
              onclick={() => viewMode = 'single'}
              title="View single page (larger)"
            >
              📄 Single Page
            </button>
          </div>
        {/if}
      </div>

      <!-- Right: Utility Actions -->
      <div class="flex items-center gap-4">
        <button class="btn btn-warning" onclick={() => clearCard(currentSide)} title="Clear this side">
          🗑️ Clear
        </button>
        <button class="btn btn-accent" onclick={() => alert('Export coming soon!')} title="Save card">
          💾 Save
        </button>
        <button class="btn btn-ghost" onclick={() => showHelpModal = true} title="Help (F1)">
          ❓ Help
        </button>
      </div>
    </div>
  </div>

  <!-- Main Content Area -->
  <div class="flex-1 flex overflow-hidden">
    <!-- Left Sidebar: Card Navigation & Quick Actions -->
    <div class="w-80 bg-white shadow-lg border-r p-4 overflow-y-auto">
      <!-- Card Sides Navigation -->
      <div class="mb-6">
        <h3 class="text-lg font-bold mb-3">Card Sides</h3>
        <div class="space-y-2">
          {#each CARD_SIDES as side}
            {@const stats = getSideStats(side)}
            <button 
              class="w-full p-3 rounded-lg border-2 text-left transition-all"
              class:border-purple-400={currentSide === side}
              class:bg-purple-50={currentSide === side}
              class:border-gray-200={currentSide !== side}
              onclick={() => switchToSide(side)}
            >
              <div class="flex items-center justify-between mb-1">
                <div class="flex items-center gap-2">
                  <span class="text-xl">{getSideEmoji(side)}</span>
                  <span class="font-medium">{getSideDisplayName(side)}</span>
                </div>
                <span class="text-sm font-bold text-purple-600">{stats.total}</span>
              </div>
              <div class="flex justify-between text-xs text-gray-600">
                <span>📝 {stats.texts}</span>
                <span>🖼️ {stats.images}</span>
                <span>⭐ {stats.stickers}</span>
              </div>
            </button>
          {/each}
        </div>
      </div>

      <!-- Quick Greetings -->
      <div class="mb-6">
        <h3 class="text-lg font-bold mb-3">Quick Messages</h3>
        <div class="space-y-2">
          {#each Object.entries(GREETING_PHRASES) as [category, phrases]}
            <div class="collapse collapse-arrow bg-base-200">
              <input type="checkbox" />
              <div class="collapse-title font-medium capitalize">{category}</div>
              <div class="collapse-content">
                <div class="space-y-1">
                  {#each phrases.slice(0, 3) as phrase}
                    <button 
                      class="btn btn-sm btn-block btn-outline text-left"
                      onclick={() => addTextElement(phrase)}
                    >
                      {phrase}
                    </button>
                  {/each}
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>

      <!-- Stickers -->
      <div>
        <h3 class="text-lg font-bold mb-3">Stickers</h3>
        <div class="space-y-3">
          {#each Object.entries(stickerCategories) as [category, stickers]}
            <div>
              <h4 class="font-medium text-sm text-gray-600 mb-2 capitalize">{category}</h4>
              <div class="grid grid-cols-5 gap-2">
                {#each stickers as sticker}
                  <button 
                    class="btn btn-sm text-2xl hover:scale-110 transition-transform"
                    onclick={() => selectSticker(sticker)}
                    title="Click to place {sticker}"
                  >
                    {sticker}
                  </button>
                {/each}
              </div>
            </div>
          {/each}
        </div>
      </div>

      {#if placementMode}
        <div class="mt-4 p-3 bg-blue-50 rounded-lg">
          <div class="text-sm font-medium text-blue-900 mb-2">
            🎯 Click on the card to place your sticker!
          </div>
          <button class="btn btn-sm btn-outline" onclick={cancelStickerPlacement}>
            Cancel
          </button>
        </div>
      {/if}
    </div>

    <!-- Center: Canvas Area -->
    <div class="flex-1 flex items-center justify-center p-8 overflow-auto">
      <div class="bg-white rounded-2xl shadow-xl p-8" class:scale-75={isInsideSpread() && viewMode === 'spread'}>
        <CardCanvas {viewMode} />
      </div>
    </div>

    <!-- Right Sidebar: Properties & Selection Tools -->
    <div class="w-80 bg-white shadow-lg border-l p-4 overflow-y-auto">
      {#if hasSelection}
        <!-- Selection Tools -->
        <div class="mb-6">
          <h3 class="text-lg font-bold mb-3 text-purple-600">Selected Items ({selectedElements.length})</h3>
          
          <!-- Basic Actions -->
          <div class="grid grid-cols-3 gap-2 mb-4">
            <button class="btn btn-sm" onclick={copySelectedElements} title="Copy (Ctrl+C)">
              📋 Copy
            </button>
            <button class="btn btn-sm" onclick={pasteElements} title="Paste (Ctrl+V)">
              📄 Paste
            </button>
            <button class="btn btn-sm btn-error" onclick={deleteSelectedElements} title="Delete">
              🗑️ Delete
            </button>
          </div>

          <!-- Alignment -->
          <div class="mb-4">
            <h4 class="font-medium mb-2">Alignment</h4>
            <div class="grid grid-cols-3 gap-1">
              <button class="btn btn-xs" onclick={() => alignElements('left')} title="Align Left">↤</button>
              <button class="btn btn-xs" onclick={() => alignElements('center-horizontal')} title="Center H">↔</button>
              <button class="btn btn-xs" onclick={() => alignElements('right')} title="Align Right">↦</button>
              <button class="btn btn-xs" onclick={() => alignElements('top')} title="Align Top">↥</button>
              <button class="btn btn-xs" onclick={() => alignElements('center-vertical')} title="Center V">↕</button>
              <button class="btn btn-xs" onclick={() => alignElements('bottom')} title="Align Bottom">↧</button>
            </div>
          </div>

          <!-- Layering -->
          <div class="mb-4">
            <h4 class="font-medium mb-2">Layering</h4>
            <div class="flex gap-2">
              <button class="btn btn-sm flex-1" onclick={() => selectedElements.forEach(id => bringToFront(id))}>
                ↑ Front
              </button>
              <button class="btn btn-sm flex-1" onclick={() => selectedElements.forEach(id => sendToBack(id))}>
                ↓ Back
              </button>
            </div>
          </div>

          <!-- Text Formatting (for text elements) -->
          {#if hasTextSelection}
            <div class="border-t pt-4">
              <h4 class="font-medium mb-3">Text Formatting</h4>
              
              <!-- Font Size -->
              <div class="mb-3">
                <label class="text-sm text-gray-600">Size</label>
                <input 
                  type="range" 
                  class="range range-sm range-primary" 
                  min="12" 
                  max="72" 
                  step="2"
                  oninput={(e) => applyTextFormat('fontSize', e.target.value + 'px')}
                >
              </div>

              <!-- Font Family -->
              <div class="mb-3">
                <label class="text-sm text-gray-600">Font</label>
                <select 
                  class="select select-sm select-bordered w-full"
                  onchange={(e) => applyTextFormat('fontFamily', e.target.value)}
                >
                  {#each FONT_FAMILIES as font}
                    <option value={font.value}>{font.name}</option>
                  {/each}
                </select>
              </div>

              <!-- Text Color -->
              <div class="mb-3">
                <label class="text-sm text-gray-600">Color</label>
                <input 
                  type="color" 
                  class="w-full h-10 rounded border"
                  onchange={(e) => applyTextFormat('color', e.target.value)}
                >
              </div>
            </div>
          {/if}
        </div>
      {:else}
        <!-- No Selection -->
        <div class="text-center text-gray-500 py-8">
          <div class="text-4xl mb-4">👆</div>
          <p class="text-lg">Select items on the card to see editing options here</p>
          <p class="text-sm mt-2">Click on text, pictures, or stickers to select them</p>
        </div>
      {/if}

      <!-- Background Color -->
      <div class="border-t pt-4">
        <h4 class="font-medium mb-3">Page Background</h4>
        <input 
          type="color" 
          class="w-full h-10 rounded border"
          value={$cardState[currentSide].backgroundColor}
          onchange={(e) => setBackgroundColor(e.target.value)}
        >
      </div>

      <!-- Keyboard Shortcuts -->
      <div class="border-t pt-4 mt-4">
        <h4 class="font-medium mb-3">Quick Keys</h4>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span>Undo</span>
            <kbd class="kbd kbd-sm">Ctrl+Z</kbd>
          </div>
          <div class="flex justify-between">
            <span>Add Text</span>
            <kbd class="kbd kbd-sm">Ctrl+T</kbd>
          </div>
          <div class="flex justify-between">
            <span>Copy</span>
            <kbd class="kbd kbd-sm">Ctrl+C</kbd>
          </div>
          <div class="flex justify-between">
            <span>Delete</span>
            <kbd class="kbd kbd-sm">Del</kbd>
          </div>
          <div class="flex justify-between">
            <span>Help</span>
            <kbd class="kbd kbd-sm">F1</kbd>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

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

<!-- Single Help Modal -->
{#if showHelpModal}
  <div class="modal modal-open">
    <div class="modal-box w-11/12 max-w-4xl max-h-[80vh] overflow-y-auto">
      <div class="flex justify-between items-center sticky top-0 bg-white pb-4 border-b mb-6">
        <h2 class="text-3xl font-bold text-gray-900">❓ Help & Guide</h2>
        <button class="btn btn-lg btn-circle btn-ghost" onclick={() => showHelpModal = false}>✕</button>
      </div>
      
      <div class="space-y-8">
        <!-- Getting Started -->
        <section>
          <h3 class="text-2xl font-bold text-gray-900 mb-4">🚀 Getting Started</h3>
          <div class="text-lg space-y-3">
            <div class="bg-green-50 p-4 rounded-lg">
              <h4 class="font-bold text-green-800 mb-2">Step 1: Choose Your Card Side</h4>
              <p class="text-green-700">Click on "Front Cover", "Inside Left", etc. in the left panel to choose which part of your card to work on.</p>
            </div>
            <div class="bg-blue-50 p-4 rounded-lg">
              <h4 class="font-bold text-blue-800 mb-2">Step 2: Add Your Content</h4>
              <p class="text-blue-700">Use the toolbar buttons to add text and pictures, or click stickers from the left panel.</p>
            </div>
            <div class="bg-purple-50 p-4 rounded-lg">
              <h4 class="font-bold text-purple-800 mb-2">Step 3: Move and Edit</h4>
              <p class="text-purple-700">Click and drag items to move them. Double-click text to edit it. Use the right panel for formatting.</p>
            </div>
          </div>
        </section>
        
        <!-- Mouse Controls -->
        <section>
          <h3 class="text-2xl font-bold text-gray-900 mb-4">🖱️ Mouse Controls</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="font-bold text-gray-800 mb-2">Single Click</h4>
              <p class="text-gray-700">Select an item (text, picture, or sticker)</p>
            </div>
            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="font-bold text-gray-800 mb-2">Double Click</h4>
              <p class="text-gray-700">Edit text directly</p>
            </div>
            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="font-bold text-gray-800 mb-2">Click and Drag</h4>
              <p class="text-gray-700">Move items around your card</p>
            </div>
            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="font-bold text-gray-800 mb-2">Corner Handles</h4>
              <p class="text-gray-700">Drag corners to resize pictures and stickers</p>
            </div>
          </div>
        </section>

        <!-- Keyboard Shortcuts -->
        <section>
          <h3 class="text-2xl font-bold text-gray-900 mb-4">⌨️ Keyboard Shortcuts</h3>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <div class="flex justify-between p-2 bg-gray-50 rounded">
                <span>Undo</span>
                <kbd class="kbd">Ctrl+Z</kbd>
              </div>
              <div class="flex justify-between p-2 bg-gray-50 rounded">
                <span>Redo</span>
                <kbd class="kbd">Ctrl+Y</kbd>
              </div>
              <div class="flex justify-between p-2 bg-gray-50 rounded">
                <span>Add Text</span>
                <kbd class="kbd">Ctrl+T</kbd>
              </div>
              <div class="flex justify-between p-2 bg-gray-50 rounded">
                <span>Copy</span>
                <kbd class="kbd">Ctrl+C</kbd>
              </div>
            </div>
            <div class="space-y-2">
              <div class="flex justify-between p-2 bg-gray-50 rounded">
                <span>Paste</span>
                <kbd class="kbd">Ctrl+V</kbd>
              </div>
              <div class="flex justify-between p-2 bg-gray-50 rounded">
                <span>Select All</span>
                <kbd class="kbd">Ctrl+A</kbd>
              </div>
              <div class="flex justify-between p-2 bg-gray-50 rounded">
                <span>Delete</span>
                <kbd class="kbd">Delete</kbd>
              </div>
              <div class="flex justify-between p-2 bg-gray-50 rounded">
                <span>Help</span>
                <kbd class="kbd">F1</kbd>
              </div>
            </div>
          </div>
        </section>

        <!-- New Features -->
        <section>
          <h3 class="text-2xl font-bold text-gray-900 mb-4">✨ Editor Features</h3>
          <div class="space-y-4">
            <div class="bg-indigo-50 p-4 rounded-lg">
              <h4 class="font-bold text-indigo-900 mb-2">📖 Inside Spread View</h4>
              <p class="text-indigo-800">When editing inside pages, you can toggle between "Spread View" (see both pages) and "Single Page" (larger editing area).</p>
            </div>
            <div class="bg-teal-50 p-4 rounded-lg">
              <h4 class="font-bold text-teal-900 mb-2">🎨 Three-Panel Layout</h4>
              <p class="text-teal-800">Left panel: Card navigation and content tools | Center: Your card canvas | Right panel: Selection and formatting tools</p>
            </div>
            <div class="bg-amber-50 p-4 rounded-lg">
              <h4 class="font-bold text-amber-900 mb-2">🎯 Smart Selection</h4>
              <p class="text-amber-800">Select multiple items with Ctrl+click, then use the right panel to align, layer, or format them all at once.</p>
            </div>
          </div>
        </section>
      </div>
      
      <div class="modal-action">
        <button class="btn btn-lg btn-primary" onclick={() => showHelpModal = false}>
          Got it! Let's Create
        </button>
      </div>
    </div>
  </div>
{/if} 