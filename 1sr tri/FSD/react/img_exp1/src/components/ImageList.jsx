import ImageShow from './ImageShow'

export default function ImageList({images}) {
  // Handle empty or undefined images array
  if (!images || images.length === 0) {
    return (
      <div className="flex justify-center items-center p-8 min-h-64">
        <p className="text-gray-500 text-lg">No images to display. Try searching for "cars"!</p>
      </div>
    )
  }

  const renderedImages = images.map((image, index) => {
    // Use index as fallback if image.id doesn't exist
    const key = image.id || image.webformatURL || index
    return <ImageShow key={key} image={image} />
  })
  
  return (
    <div className="p-6">
      <div className="flex overflow-x-auto gap-4 pb-4">
        {renderedImages}
      </div>
    </div>
  )
}