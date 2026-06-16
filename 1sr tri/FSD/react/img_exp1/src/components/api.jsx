import axios from 'axios'

const searchImages = async (term) => {
  try {
    const response = await axios.get('https://api.unsplash.com/search/photos', {
      headers: {
        Authorization: 'Client-ID 3VbKLrt_Ja1GCsirVYW8nrzMjt82HwQ968XSRUG36uY'
      },
      params: {
        query: term,
        per_page: 12
      }
    })
    
    return response.data.results
  } catch (error) {
    console.error('Error fetching images:', error)
    // Fallback to a different API if Unsplash fails
    try {
      const fallbackResponse = await axios.get('https://pixabay.com/api/', {
        params: {
          key: '51556158-f94866db6affb21a739670116',
          q: term,
          image_type: 'photo',
          per_page: 12,
          safesearch: 'true'
        }
      })
      
      // Transform Pixabay data to match expected format
      return fallbackResponse.data.hits.map(hit => ({
        id: hit.id,
        urls: { small: hit.webformatURL },
        alt_description: hit.tags
      }))
    } catch (fallbackError) {
      console.error('Fallback API also failed:', fallbackError)
      return []
    }
  }
}

export default searchImages