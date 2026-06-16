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
    <div> 
      <form onSubmit={onFormSubmit}>
      <input className="border-black border-solid border-2px mx-3 my-3 p-4" onChange={changeHandle} value={term}/>
      </form>
      
    </div>
  )
}