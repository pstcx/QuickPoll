import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import './App.css'
import DashboardScreen from './screens/DashboardScreen'
import HomeScreen from './screens/HomeScreen'
import ManageScreen from './screens/ManageScreen'
import PollScreen from './screens/PollScreen'
import ResultScreen from './screens/ResultScreen'
import CreateScreen from './screens/CreateScreen'
import JoinScreen from './screens/JoinScreen'
import Header from './lib/header'

function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const isHome = location.pathname === '/'

  return (
    <div className="bg-gray-100 min-h-screen w-screen">
      <Header
        title='Quick Poll'
        showBackButton={!isHome}
        onBack={() => navigate(-1)}
      />
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
  )
}

export default App
