<!-- Grandma-friendly card editor with simplified layout -->
<script>
  import { browser } from '$app/environment';
  import CardCanvas from '$lib/components/editor/CardCanvas.svelte';
  import Toolbar from '$lib/components/editor/Toolbar.svelte';
  import {
    addTextElement,
    CARD_SIDES,
    cardHistory,
    cardState,
    clearSelection,
    copySelectedElements,
    deleteSelectedElements,
    pasteElements,
    redo,
    selectAllElements,
    switchToSide,
    undo
  } from '$lib/stores/cardStore.js';
  import { onMount } from 'svelte';

  // Reactive state
  $: currentSide = $cardState.currentSide;
  $: cardSize = $cardState.cardSize;
  $: sideData = $cardState[currentSide];
  $: history = $cardHistory;
  $: selectedElements = $cardState.selectedElements;
  $: totalElements = CARD_SIDES.reduce((total, side) => {
    const data = $cardState[side];
    return total + Object.keys(data.elements || {}).length;
  }, 0);

  // Calculate completion percentage
  $: completionPercentage = Math.min(100, Math.round((totalElements / 8) * 100));

  let showHelpModal = false;

  // Keyboard shortcuts
  function handleKeydown(event) {
    // Only handle shortcuts when not typing in inputs
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
        case '1':
        case '2':
        case '3':
        case '4':
          event.preventDefault();
          const sideIndex = parseInt(event.key) - 1;
          if (CARD_SIDES[sideIndex]) {
            switchToSide(CARD_SIDES[sideIndex]);
          }
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
        case '?':
          event.preventDefault();
          showHelpModal = true;
          break;
      }
    }
  }

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
    return {
      texts,
      images,
      stickers,
      total: texts + images + stickers
    };
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

<div class="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
  <!-- Simple Header -->
  <div class="bg-white shadow-sm border-b">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-20">
        <div class="flex items-center gap-6">
          <a href="/" class="btn btn-lg btn-ghost text-gray-600 hover:text-gray-900">
            ← Back to Home
          </a>
          <div class="h-8 border-l border-gray-300"></div>
          <h1 class="text-2xl font-bold text-gray-900">Card Editor</h1>
        </div>
        
        <div class="flex items-center gap-6">
          <!-- Help Button -->
          <button 
            class="btn btn-lg btn-primary" 
            on:click={() => showHelpModal = true}
          >
            ❓ Help
          </button>
          
          <!-- Current Side Display -->
          <div class="flex items-center gap-3 px-4 py-2 bg-blue-100 rounded-xl">
            <span class="text-2xl">{getSideEmoji(currentSide)}</span>
            <div>
              <div class="font-bold text-blue-900">{getSideDisplayName(currentSide)}</div>
              <div class="text-sm text-blue-700">{cardSize.name}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="grid grid-cols-1 xl:grid-cols-4 gap-8">
      
      <!-- Main Editor (Left Column) -->
      <div class="xl:col-span-3 space-y-8">
        <!-- Toolbar -->
        <Toolbar />
        
        <!-- Canvas -->
        <div class="bg-white rounded-2xl shadow-xl p-8">
          <CardCanvas />
        </div>
        
        <!-- Grandma-Friendly Tips -->
        <div class="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl p-6 border-l-8 border-yellow-500">
          <div class="flex items-start gap-4">
            <div class="text-4xl">💡</div>
            <div>
              <h3 class="text-xl font-bold text-gray-900 mb-3">Quick Tips for You:</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-lg text-gray-700">
                <div class="space-y-2">
                  <p>• Double-click text to edit it</p>
                  <p>• Drag things around to move them</p>
                  <p>• Use corner handles to resize pictures</p>
                </div>
                <div class="space-y-2">
                  <p>• Press Delete to remove selected items</p>
                  <p>• Use Undo if you make a mistake</p>
                  <p>• Click the Help button for more tips</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Sidebar (Right Column) -->
      <div class="space-y-6">
        
        <!-- Progress Card -->
        <div class="bg-white rounded-2xl shadow-lg p-6">
          <h3 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            📊 Your Progress
          </h3>
          
          <div class="mb-4">
            <div class="flex justify-between items-center mb-2">
              <span class="text-lg font-medium">Card Complete:</span>
              <span class="text-lg font-bold text-purple-600">{completionPercentage}%</span>
            </div>
            <div class="w-full h-4 bg-gray-200 rounded-full">
              <div 
                class="h-4 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full transition-all duration-500"
                style="width: {completionPercentage}%"
              ></div>
            </div>
          </div>
          
          <div class="text-center">
            <div class="text-3xl font-bold text-purple-600 mb-1">{totalElements}</div>
            <div class="text-gray-600">Total Items Added</div>
          </div>
        </div>

        <!-- Current Side Info -->
        <div class="bg-white rounded-2xl shadow-lg p-6">
          <h3 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            {getSideEmoji(currentSide)} {getSideDisplayName(currentSide)}
          </h3>
          
          <div class="space-y-4">
            <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span class="text-lg text-gray-700 flex items-center gap-2">
                📝 Text
              </span>
              <span class="text-xl font-bold">{getSideStats(currentSide).texts}</span>
            </div>
            <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span class="text-lg text-gray-700 flex items-center gap-2">
                🖼️ Pictures
              </span>
              <span class="text-xl font-bold">{getSideStats(currentSide).images}</span>
            </div>
            <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span class="text-lg text-gray-700 flex items-center gap-2">
                ⭐ Stickers
              </span>
              <span class="text-xl font-bold">{getSideStats(currentSide).stickers}</span>
            </div>
          </div>
        </div>

        <!-- All Sides Overview -->
        <div class="bg-white rounded-2xl shadow-lg p-6">
          <h3 class="text-xl font-bold text-gray-900 mb-4">All Card Sides</h3>
          
          <div class="space-y-3">
            {#each CARD_SIDES as side}
              {@const stats = getSideStats(side)}
              <div 
                class="p-4 rounded-lg border-2 transition-all cursor-pointer hover:shadow-md"
                class:border-purple-400={currentSide === side}
                class:bg-purple-50={currentSide === side}
                class:border-gray-200={currentSide !== side}
                class:bg-gray-50={currentSide !== side}
                on:click={() => switchToSide(side)}
                role="button"
                tabindex="0"
              >
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center gap-3">
                    <span class="text-2xl">{getSideEmoji(side)}</span>
                    <span class="font-bold">{getSideDisplayName(side)}</span>
                    {#if currentSide === side}
                      <span class="text-xs bg-purple-600 text-white px-2 py-1 rounded-full">Editing</span>
                    {/if}
                  </div>
                  <span class="text-lg font-bold text-purple-600">{stats.total}</span>
                </div>
                
                <div class="flex justify-between text-gray-600">
                  <span>📝 {stats.texts}</span>
                  <span>🖼️ {stats.images}</span>
                  <span>⭐ {stats.stickers}</span>
                </div>
              </div>
            {/each}
          </div>
        </div>

        <!-- Quick Shortcuts -->
        <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-6">
          <h3 class="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
            ⌨️ Quick Keys
          </h3>
          <div class="space-y-3 text-lg">
            <div class="flex justify-between items-center">
              <span class="text-blue-700">Undo</span>
              <kbd class="kbd kbd-lg">Ctrl+Z</kbd>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-blue-700">Add Text</span>
              <kbd class="kbd kbd-lg">Ctrl+T</kbd>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-blue-700">Copy</span>
              <kbd class="kbd kbd-lg">Ctrl+C</kbd>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-blue-700">Delete</span>
              <kbd class="kbd kbd-lg">Del</kbd>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-blue-700">Help</span>
              <kbd class="kbd kbd-lg">F1</kbd>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Simplified Help Modal -->
{#if showHelpModal}
  <div class="modal modal-open">
    <div class="modal-box w-11/12 max-w-4xl max-h-[80vh] overflow-y-auto">
      <div class="flex justify-between items-center sticky top-0 bg-white pb-4 border-b mb-6">
        <h2 class="text-3xl font-bold text-gray-900">❓ Help & Guide</h2>
        <button 
          class="btn btn-lg btn-circle btn-ghost"
          on:click={() => showHelpModal = false}
        >
          ✕
        </button>
      </div>
      
      <div class="space-y-8">
        <!-- Getting Started -->
        <section>
          <h3 class="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            🚀 Getting Started
          </h3>
          <div class="text-lg space-y-3">
            <div class="bg-green-50 p-4 rounded-lg">
              <h4 class="font-bold text-green-800 mb-2">Step 1: Choose Your Card Side</h4>
              <p class="text-green-700">Click on "Front Cover", "Inside Left", etc. to choose which part of your card to work on.</p>
            </div>
            <div class="bg-blue-50 p-4 rounded-lg">
              <h4 class="font-bold text-blue-800 mb-2">Step 2: Add Your Content</h4>
              <p class="text-blue-700">Use the big buttons to add text, pictures, or stickers to your card.</p>
            </div>
            <div class="bg-purple-50 p-4 rounded-lg">
              <h4 class="font-bold text-purple-800 mb-2">Step 3: Move and Edit</h4>
              <p class="text-purple-700">Click and drag items to move them. Double-click text to edit it.</p>
            </div>
            <div class="bg-yellow-50 p-4 rounded-lg">
              <h4 class="font-bold text-yellow-800 mb-2">Step 4: Save Your Card</h4>
              <p class="text-yellow-700">When you're happy with your card, use the save button to download it.</p>
            </div>
          </div>
        </section>
        
        <!-- Mouse Controls -->
        <section>
          <h3 class="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            🖱️ How to Use Your Mouse
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-lg">
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
              <p class="text-gray-700">Drag corners to make pictures bigger or smaller</p>
            </div>
          </div>
        </section>

        <!-- Keyboard Shortcuts -->
        <section>
          <h3 class="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            ⌨️ Keyboard Shortcuts
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-lg">
            <div class="space-y-3">
              <div class="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span>Undo (go back)</span>
                <kbd class="kbd">Ctrl+Z</kbd>
              </div>
              <div class="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span>Redo (go forward)</span>
                <kbd class="kbd">Ctrl+Y</kbd>
              </div>
              <div class="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span>Add Text</span>
                <kbd class="kbd">Ctrl+T</kbd>
              </div>
              <div class="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span>Copy</span>
                <kbd class="kbd">Ctrl+C</kbd>
              </div>
            </div>
            <div class="space-y-3">
              <div class="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span>Paste</span>
                <kbd class="kbd">Ctrl+V</kbd>
              </div>
              <div class="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span>Select All</span>
                <kbd class="kbd">Ctrl+A</kbd>
              </div>
              <div class="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span>Delete Selected</span>
                <kbd class="kbd">Delete</kbd>
              </div>
              <div class="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span>Help</span>
                <kbd class="kbd">F1</kbd>
              </div>
            </div>
          </div>
        </section>

        <!-- Tips for Success -->
        <section>
          <h3 class="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            💡 Tips for Making Great Cards
          </h3>
          <div class="space-y-4">
            <div class="bg-green-50 rounded-lg p-4">
              <h4 class="font-bold text-green-900 mb-2">🎨 Design Tips</h4>
              <ul class="text-lg text-green-800 space-y-1">
                <li>• Keep text large enough to read easily (size 24 or bigger)</li>
                <li>• Use colors that contrast well (dark text on light backgrounds)</li>
                <li>• Don't put too many things on one card - less is more!</li>
                <li>• Leave some empty space around your text and pictures</li>
              </ul>
            </div>
            
            <div class="bg-blue-50 rounded-lg p-4">
              <h4 class="font-bold text-blue-900 mb-2">📝 Text Tips</h4>
              <ul class="text-lg text-blue-800 space-y-1">
                <li>• Use the "Quick Messages" for common greetings</li>
                <li>• Make important words bold</li>
                <li>• Center your main message</li>
                <li>• Keep messages short and sweet</li>
              </ul>
            </div>
            
            <div class="bg-purple-50 rounded-lg p-4">
              <h4 class="font-bold text-purple-900 mb-2">🖼️ Picture Tips</h4>
              <ul class="text-lg text-purple-800 space-y-1">
                <li>• Choose high-quality, clear pictures</li>
                <li>• Make sure pictures fit your message</li>
                <li>• Don't make pictures too small</li>
                <li>• Try searching for "birthday flowers" or "celebration" online</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
      
      <div class="modal-action">
        <button class="btn btn-lg btn-primary" on:click={() => showHelpModal = false}>
          Got it! Let's Create
        </button>
      </div>
    </div>
  </div>
{/if} 