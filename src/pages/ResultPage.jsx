import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { callFunction } from '../lib/supabase'
import { toast } from 'react-hot-toast'
import Leaderboard from '../components/Leaderboard'

export default function ResultPage() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    if (data) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            const eventId = data.eventCode || 'etcio2026'
            navigate(`/start/${eventId}`)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [data, navigate])

  useEffect(() => {
    async function fetchResult() {
      try {
        const result = await callFunction('get-result', { sessionId })
        setData(result)
      } catch (error) {
        toast.error('Failed to load result')
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchResult()
  }, [sessionId])

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading Results...</div>

  if (!data) return <div className="flex items-center justify-center min-h-screen text-red-500">Result not found.</div>

  const { user, result, leaderboard } = data

  return (
    <div className="bg-white min-vh-100 py-4 py-md-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-10 col-lg-8">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="card bg-dark text-white card-enterprise p-4 p-md-5 mb-4 mb-md-5 text-center shadow-lg border-0 rounded-5 position-relative overflow-hidden"
              style={{
                background: "linear-gradient(145deg, #1a1a1a 0%, #000000 100%)",
              }}
            >
              {/* Decorative Glow */}
              <div
                className="position-absolute top-0 start-50 translate-middle-x"
                style={{
                  width: '200px',
                  height: '2px',
                  background: 'linear-gradient(90deg, transparent, #ff4d3d, transparent)',
                  boxShadow: '0 0 20px #ff4d3d'
                }}
              />

              <h1 className="h6 fw-bold mb-4 text-uppercase tracking-widest text-secondary" style={{ letterSpacing: '4px' }}>Challenge Results</h1>

              <div className="mb-4">
                <div className="display-1 fw-black mb-0 text-white" style={{ letterSpacing: '-4px' }}>{result.totalScore}</div>
                <div className="small fw-bold text-danger text-uppercase tracking-wider">Total Points Earned</div>
              </div>

              <div className="row g-3 mb-5">
                <div className="col-6">
                  <div className="bg-white bg-opacity-10 p-4 rounded-4 border border-white border-opacity-10">
                    <div className="text-xs text-uppercase fw-bold mb-1 opacity-50" style={{ fontSize: '0.75rem', letterSpacing: '2px' }}>Current Rank</div>
                    <div className="h1 fw-bold mb-0 text-white">#{result.rank}</div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="bg-white bg-opacity-10 p-4 rounded-4 border border-white border-opacity-10">
                    <div className="text-xs text-uppercase fw-bold mb-1 opacity-50" style={{ fontSize: '0.75rem', letterSpacing: '2px' }}>Time Used</div>
                    <div className="h1 fw-bold mb-0 text-white">{Math.round(result.totalResponseTime)}s</div>
                  </div>
                </div>
              </div>

              <div className="h3 fw-bold mb-2">
                Great job, <span style={{ color: '#ff4d3d' }}>{user.name}</span>!
              </div>
              <div className="small opacity-50 mb-5">
                {user.designation} at {user.company}
              </div>

              <div
                className="py-3 px-4 rounded-pill d-inline-flex align-items-center gap-3"
                style={{ background: 'rgba(255,77,61,0.15)', border: '1px solid rgba(255,77,61,0.3)' }}
              >
                <div className="spinner-border spinner-border-sm text-danger" role="status"></div>
                <span className="small fw-bold text-uppercase tracking-wider">Redirecting in {countdown}s</span>
              </div>
            </motion.div>
            {/* Attractive Leaderboard Message */}
            <div className="mb-5">
              <div
                className="card border-0 shadow-lg rounded-5 text-center overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, #111827, #1f2937, #374151)",
                }}
              >
                <div className="card-body py-5 px-4 position-relative">

                  {/* Background Glow */}
                  <div
                    className="position-absolute top-50 start-50 translate-middle"
                    style={{
                      width: "250px",
                      height: "250px",
                      background: "rgba(255,255,255,0.05)",
                      borderRadius: "50%",
                      filter: "blur(20px)",
                    }}
                  ></div>

                  {/* Trophy Icon */}
                  <div
                    className="mx-auto mb-4 d-flex align-items-center justify-content-center"
                    style={{
                      width: "90px",
                      height: "90px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #facc15, #f59e0b)",
                      fontSize: "42px",
                      boxShadow: "0 12px 25px rgba(245,158,11,0.4)",
                    }}
                  >
                    🏆
                  </div>

                  {/* Main Text */}
                  <h2 className="fw-bold text-white mb-3">
                    Check Your Score on the Leaderboard
                  </h2>

                  {/* Sub Text */}
                  <p
                    className="text-light mx-auto mb-0"
                    style={{
                      maxWidth: "650px",
                      fontSize: "1.05rem",
                      lineHeight: "1.8",
                      opacity: 0.9,
                    }}
                  >
                    The competition is getting exciting!
                    View the leaderboard to see your current position, compare scores with other participants,
                    and find out who’s leading the challenge.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
