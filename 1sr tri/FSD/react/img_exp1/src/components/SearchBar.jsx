import { useState } from "react"

export default function SearchBar({onSubmit}) {
  const[term,setTerm] = useState('')
const onFormSubmit=(event) => {
  event.preventDefault()
  onSubmit(term)
}
const changeHandle=(event) => {
  setTerm(event.target.value)

}
  return (
    <div className="max-w-md mx-auto"> 
      <form onSubmit={onFormSubmit} className="flex gap-2">
        <input
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Search for images..."
          type="text"
        />
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Search
        </button>
      </form>
    </div>
  )
}