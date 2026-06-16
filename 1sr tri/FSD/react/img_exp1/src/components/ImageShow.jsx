export default function ImageShow({ image }) {
  // Handle missing image data gracefully
  if (!image) {
    return (
      <div className="flex-shrink-0 w-64 border rounded-lg overflow-hidden shadow-md p-4 bg-gray-50">
        <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded">
          <span className="text-gray-500">No image available</span>
        </div>
      </div>
    )
  }

  const imageUrl = image.urls?.small || image.urls?.regular || image.url || image.webformatURL
  const altText = image.alt_description || image.description || image.tags || 'Image'

  return (
    <div className="flex-shrink-0 w-64 flex flex-col border rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white">
      <div className="flex-shrink-0">
        <img 
          src={imageUrl}
          alt={altText}
          className="w-full h-48 object-cover"
          onError={(e) => {
            e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="%23e5e7eb"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%236b7280">No Image</text></svg>'
          }}
        />
      </div>
      <div className="flex-1 p-3">
        <p className="text-sm text-gray-600 line-clamp-2">{altText}</p>
      </div>
    </div>
  )
}