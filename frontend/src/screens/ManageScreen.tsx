import React from 'react'
import { useParams } from 'react-router-dom'

const ManageScreen = () => {
  const { id } = useParams()
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold text-orange-700">Umfrage verwalten</h2>
      <p>Du verwaltest die Umfrage mit der ID: {id}</p>
    </div>
  )
}

export default ManageScreen
