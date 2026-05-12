import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import StartPage from './pages/StartPage'
import GamePage from './pages/GamePage'
import ResultPage from './pages/ResultPage'
import DisplayPage from './pages/DisplayPage'

function App() {
  return (
    <Router>
      <Toaster position="top-center" />
      <Routes>
        {/* QR Start Page */}
        <Route path="/start/:eventId" element={<StartPage />} />
        
        {/* Game Page */}
        <Route path="/game/:sessionId" element={<GamePage />} />
        
        {/* Result Page */}
        <Route path="/result/:sessionId" element={<ResultPage />} />
        
        {/* LED Display Page */}
        <Route path="/display/:eventId" element={<DisplayPage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/start/etcio2026" replace />} />
      </Routes>
    </Router>
  )
}

export default App
