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
        {/* Root Redirect to Display */}
        <Route path="/" element={<Navigate to="/display/etcio2026" replace />} />

        {/* QR Start Page (Phone scans this) */}
        <Route path="/start/:eventId" element={<StartPage />} />

        {/* Game Page */}
        <Route path="/game/:sessionId" element={<GamePage />} />

        {/* Result Page */}
        <Route path="/result/:sessionId" element={<ResultPage />} />

        {/* LED Display Page (Big Screen) */}
        <Route path="/display/:eventId" element={<DisplayPage />} />

        {/* Fallback to Display */}
        <Route path="*" element={<Navigate to="/display/etcio2026" replace />} />
      </Routes>
    </Router>
  )
}

export default App
