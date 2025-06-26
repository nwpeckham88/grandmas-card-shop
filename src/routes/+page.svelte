<!-- Welcome page for Grandma's Greeting Card Creator -->
<script>
  import { goto } from '$app/navigation';
  
  function startCreating() {
    goto('/create');
  }
</script>

<svelte:head>
  <title>Grandma's Greeting Card Creator</title>
  <meta name="description" content="Create beautiful personalized greeting cards with our easy drag-and-drop editor" />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100">
  <!-- Hero Section -->
  <div class="hero min-h-screen">
    <div class="hero-content text-center">
      <div class="max-w-4xl">
        <!-- Logo/Title -->
        <div class="mb-8">
          <div class="text-6xl mb-4">💌</div>
          <h1 class="text-5xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Grandma's Card Shop
          </h1>
          <p class="text-xl text-base-content/70 mt-4">
            Create beautiful, personalized greeting cards with love
          </p>
        </div>
        
        <!-- Features -->
        <div class="grid md:grid-cols-3 gap-6 mb-12">
          <div class="card bg-base-100 shadow-md">
            <div class="card-body items-center text-center">
              <div class="text-3xl mb-2">🖱️</div>
              <h3 class="card-title text-lg">Drag & Drop</h3>
              <p class="text-sm">Simply drag elements around to create your perfect card</p>
            </div>
          </div>
          
          <div class="card bg-base-100 shadow-md">
            <div class="card-body items-center text-center">
              <div class="text-3xl mb-2">📸</div>
              <h3 class="card-title text-lg">Beautiful Images</h3>
              <p class="text-sm">Search thousands of free images or upload your own</p>
            </div>
          </div>
          
          <div class="card bg-base-100 shadow-md">
            <div class="card-body items-center text-center">
              <div class="text-3xl mb-2">💾</div>
              <h3 class="card-title text-lg">Save & Print</h3>
              <p class="text-sm">Download your finished card as a high-quality image</p>
            </div>
          </div>
        </div>
        
        <!-- Call to Action -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            on:click={startCreating}
            class="btn btn-primary btn-lg"
          >
            <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Start Creating
          </button>
          
          <a href="/create" class="btn btn-outline btn-lg">
            <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Learn More
          </a>
        </div>
        
        <!-- Quick Tips -->
        <div class="mt-16">
          <h2 class="text-2xl font-bold mb-6">How It Works</h2>
          <div class="steps steps-vertical lg:steps-horizontal">
            <div class="step step-primary">
              <div class="text-left">
                <div class="font-bold">Choose Your Style</div>
                <div class="text-sm opacity-70">Start with a blank canvas</div>
              </div>
            </div>
            <div class="step step-primary">
              <div class="text-left">
                <div class="font-bold">Add Elements</div>
                <div class="text-sm opacity-70">Text, images, and stickers</div>
              </div>
            </div>
            <div class="step step-primary">
              <div class="text-left">
                <div class="font-bold">Customize</div>
                <div class="text-sm opacity-70">Drag, resize, and style</div>
              </div>
            </div>
            <div class="step step-primary">
              <div class="text-left">
                <div class="font-bold">Save & Share</div>
                <div class="text-sm opacity-70">Download your masterpiece</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Footer -->
  <footer class="footer footer-center p-4 bg-base-200 text-base-content">
    <div>
      <p>Made with ❤️ for creating memorable moments</p>
    </div>
  </footer>
</div> 