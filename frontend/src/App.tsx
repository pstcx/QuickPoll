import { Route, Routes } from 'react-router-dom'
import './App.css'
import DashboardScreen from './screens/DashboardScreen'
import HomeScreen from './screens/HomeScreen'
import ManageScreen from './screens/ManageScreen'
import PollScreen from './screens/PollScreen'
import ResultScreen from './screens/ResultScreen'
import CreateScreen from './screens/CreateScreen'
import JoinScreen from './screens/JoinScreen'

function App() {
  return (
    <div className="bg-gray-100 min-h-screen p-8">
      <div className="mt-8">
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/create" element={<CreateScreen />} />
          <Route path="/my-polls" element={<DashboardScreen />} />
          <Route path="/my-polls/:id" element={<ManageScreen />} />
          <Route path="/my-polls/:id/result" element={<ResultScreen />} />
          <Route path="/join" element={<JoinScreen />} />
          <Route path="/poll/:id" element={<PollScreen />} />
        </Routes>
      </div>
    </div>
  )
}

export default App
