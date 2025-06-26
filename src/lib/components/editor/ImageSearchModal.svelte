<!-- Image search modal component for finding web images -->
<script>
  import { addImageElement } from '$lib/stores/cardStore.js';
  
  /**
   * @typedef {Object} Props
   * @property {boolean} [isOpen]
   */

  /** @type {Props} */
  let { isOpen = $bindable(false) } = $props();
  
  let searchQuery = $state('');
  let searchResults = $state([]);
  let isSearching = $state(false);
  let searchError = $state('');
  
  async function handleSearch() {
    if (!searchQuery.trim()) return;
    
    isSearching = true;
    searchError = '';
    searchResults = [];
    
    try {
      const response = await fetch(`/api/images?query=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      
      if (response.ok) {
        searchResults = data.photos || [];
      } else {
        searchError = data.error || 'Failed to search images';
      }
    } catch (error) {
      searchError = 'Network error. Please try again.';
      console.error('Search error:', error);
    } finally {
      isSearching = false;
    }
  }
  
  function handleSelectImage(imageUrl) {
    addImageElement(imageUrl);
    closeModal();
  }
  
  function closeModal() {
    isOpen = false;
    searchQuery = '';
    searchResults = [];
    searchError = '';
  }
  
  function handleKeydown(event) {
    if (event.key === 'Enter') {
      handleSearch();
    } else if (event.key === 'Escape') {
      closeModal();
    }
  }
</script>

<!-- Modal backdrop -->
{#if isOpen}
  <div class="modal modal-open">
    <div class="modal-box w-11/12 max-w-5xl">
      <!-- Modal header -->
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold">Search Images</h2>
        <button 
          onclick={closeModal}
          class="btn btn-sm btn-circle btn-ghost"
        >
          ✕
        </button>
      </div>
      
      <!-- Search input -->
      <div class="flex gap-2 mb-4">
        <input
          bind:value={searchQuery}
          onkeydown={handleKeydown}
          type="text"
          placeholder="Search for images (e.g., 'flowers', 'birthday', 'celebration')"
          class="input input-bordered flex-1"
          disabled={isSearching}
        />
        <button
          onclick={handleSearch}
          class="btn btn-primary"
          disabled={isSearching || !searchQuery.trim()}
        >
          {#if isSearching}
            <span class="loading loading-spinner loading-sm"></span>
          {:else}
            Search
          {/if}
        </button>
      </div>
      
      <!-- Error message -->
      {#if searchError}
        <div class="alert alert-error mb-4">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>{searchError}</span>
        </div>
      {/if}
      
      <!-- Search results -->
      {#if searchResults.length > 0}
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
          {#each searchResults as photo}
            <div class="card card-compact bg-base-100 shadow-md hover:shadow-lg transition-shadow cursor-pointer">
              <figure>
                <img
                  src={photo.src.medium}
                  alt={photo.alt || 'Search result'}
                  class="w-full h-32 object-cover"
                  onclick={() => handleSelectImage(photo.src.large)}
                  loading="lazy"
                />
              </figure>
              <div class="card-body">
                <p class="text-xs text-base-content/70 truncate">
                  Photo by {photo.photographer}
                </p>
                <button
                  onclick={() => handleSelectImage(photo.src.large)}
                  class="btn btn-primary btn-xs"
                >
                  Add to Card
                </button>
              </div>
            </div>
          {/each}
        </div>
      {:else if !isSearching && searchQuery && !searchError}
        <div class="text-center py-8 text-base-content/60">
          <div class="text-4xl mb-2">🔍</div>
          <p>No images found for "{searchQuery}"</p>
          <p class="text-sm">Try different keywords</p>
        </div>
      {:else if !searchQuery && !isSearching}
        <div class="text-center py-8 text-base-content/60">
          <div class="text-4xl mb-2">📸</div>
          <p>Search for beautiful images to add to your card</p>
          <p class="text-sm">Powered by Pexels</p>
        </div>
      {/if}
      
      <!-- Loading state -->
      {#if isSearching}
        <div class="text-center py-8">
          <span class="loading loading-spinner loading-lg"></span>
          <p class="mt-4">Searching for images...</p>
        </div>
      {/if}
    </div>
    
    <!-- Click outside to close -->
    <div class="modal-backdrop" onclick={closeModal}></div>
  </div>
{/if} 