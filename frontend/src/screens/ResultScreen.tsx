import React from 'react'
import { useParams } from 'react-router-dom'

const ResultScreen = () => {
  const { id } = useParams()
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold text-indigo-700">Umfrage-Ergebnis</h2>
      <p>Ergebnis für Umfrage mit der ID: {id}</p>
    </div>
  )
}

export default ResultScreen
