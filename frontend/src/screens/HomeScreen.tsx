import React from 'react'
import { useNavigate } from 'react-router-dom'

const HomeScreen = () => {
  const navigate = useNavigate()
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold text-blue-700 mb-6">Willkommen zu QuickPoll</h2>
      <div className="flex flex-col gap-4 max-w-xs">
        <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-400 to-teal-500 text-white rounded-lg shadow-md hover:scale-105 hover:from-green-500 hover:to-teal-600 transition transform" onClick={() => navigate('/my-polls')}>
          <span>📋</span> Meine Polls
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-400 to-red-500 text-white rounded-lg shadow-md hover:scale-105 hover:from-pink-500 hover:to-red-600 transition transform" onClick={() => navigate('/create')}>
          <span>➕</span> Poll erstellen
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg shadow-md hover:scale-105 hover:from-yellow-500 hover:to-orange-600 transition transform" onClick={() => navigate('/join')}>
          <span>🗳️</span> Poll beitreten
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-400 to-blue-500 text-white rounded-lg shadow-md hover:scale-105 hover:from-indigo-500 hover:to-blue-600 transition transform" onClick={() => navigate('/my-polls/123')}>
          <span>🛠️</span> Poll verwalten (Beispiel)
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-400 to-blue-500 text-white rounded-lg shadow-md hover:scale-105 hover:from-indigo-500 hover:to-blue-600 transition transform" onClick={() => navigate('/my-polls/123/result')}>
          <span>📊</span> Poll Ergebnis (Beispiel)
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-400 to-gray-600 text-white rounded-lg shadow-md hover:scale-105 hover:from-gray-500 hover:to-gray-700 transition transform" onClick={() => navigate('/poll/123')}>
          <span>🔎</span> Poll ansehen (Beispiel)
        </button>
      </div>
    </div>
  )
}

export default HomeScreen
