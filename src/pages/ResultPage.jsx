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
              className="card bg-dark text-white card-enterprise p-4 p-md-5 mb-5 text-center shadow-lg"
            >
              <h1 className="h6 fw-bold mb-2 text-uppercase tracking-widest text-secondary">Challenge Completed</h1>
              <div className="display-1 fw-black mb-4">{result.totalScore}</div>

              <div className="row g-3 mb-4">
                <div className="col-6">
                  <div className="bg-secondary bg-opacity-25 p-3 rounded-4">
                    <div className="text-xs text-uppercase fw-bold mb-1 opacity-50">Rank</div>
                    <div className="h2 fw-bold mb-0">#{result.rank}</div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="bg-secondary bg-opacity-25 p-3 rounded-4">
                    <div className="text-xs text-uppercase fw-bold mb-1 opacity-50">Time</div>
                    <div className="h2 fw-bold mb-0">{Math.round(result.totalResponseTime)}s</div>
                  </div>
                </div>
              </div>

              <div className="h5 fw-bold mb-1">
                Well done, <span className="text-primary">{user.name}</span>!
              </div>
              <div className="small opacity-50">
                {user.designation} at {user.company}
              </div>
            </motion.div>

            {/* Leaderboard Section */}
            <div className="mb-5">
              <h2 className="h4 fw-bold mb-4 text-dark border-start border-4 border-dark ps-3">Top 10 Leaderboard</h2>
              <div className="card card-enterprise shadow-sm overflow-hidden border-light">
                <Leaderboard players={leaderboard} currentUserId={user.id} />
              </div>
            </div>

            <div className="d-grid col-md-8 mx-auto">
              <button
                onClick={() => navigate(`/display/${user.event_id}`)}
                className="btn btn-outline-dark py-3 fw-bold rounded-4"
              >
                View Live LED Display
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
