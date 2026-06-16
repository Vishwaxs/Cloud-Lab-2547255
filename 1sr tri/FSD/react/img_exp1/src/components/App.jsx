import { useState } from 'react'
import SearchBar from './SearchBar'
import ImageList from './ImageList'
import searchImages from './api'

function App() {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (term) => {
    if (!term.trim()) {
      setError('Please enter a search term')
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      const result = await searchImages(term)
      setImages(result)
    } catch (err) {
      setError('Failed to fetch images. Please try again.')
      setImages([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Image Search
        </h1>
        
        <SearchBar onSubmit={handleSubmit} />
        
        {error && (
          <div className="text-center mt-4">
            <p className="text-red-500 bg-red-50 border border-red-200 rounded p-3 inline-block">
              {error}
            </p>
          </div>
        )}
        
        {loading && (
          <div className="text-center mt-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Searching for images...</p>
          </div>
        )}
        
        {!loading && <ImageList images={images} />}
      </div>
    </div>
  )
}

export default App