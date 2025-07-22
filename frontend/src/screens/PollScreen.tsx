import React from 'react'
import { useParams } from 'react-router-dom'

const PollScreen = () => {
  const { id } = useParams()
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold text-blue-700">Umfrage</h2>
      <p>Du bist in der Umfrage mit der ID: {id}</p>
    </div>
  )
}

export default PollScreen
