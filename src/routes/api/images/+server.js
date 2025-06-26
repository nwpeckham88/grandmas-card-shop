// Server route to securely handle Pexels API requests for image search
import { PEXELS_API_KEY } from '$env/static/private';
import { json } from '@sveltejs/kit';

export async function GET({ url }) {
  const query = url.searchParams.get('query');
  
  if (!query) {
    return json({ error: 'Query parameter is required' }, { status: 400 });
  }
  
  if (!PEXELS_API_KEY) {
    return json(
      { error: 'Image search is temporarily unavailable. Please try again later.' },
      { status: 503 }
    );
  }
  
  try {
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=12&orientation=all`,
      {
        headers: {
          'Authorization': PEXELS_API_KEY
        }
      }
    );
    
    if (!response.ok) {
      if (response.status === 429) {
        return json(
          { error: 'Search rate limit exceeded. Please try again in a moment.' },
          { status: 429 }
        );
      }
      throw new Error(`Pexels API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Ensure we return a consistent structure even if no results
    if (!data.photos || data.photos.length === 0) {
      return json({
        photos: [],
        total_results: 0,
        page: 1,
        per_page: 12,
        next_page: null
      });
    }
    
    return json(data);
  } catch (error) {
    console.error('Pexels API error:', error);
    return json(
      { error: 'Failed to search images. Please try again later.' },
      { status: 500 }
    );
  }
} 