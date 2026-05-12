import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase, callFunction } from '../lib/supabase'
import Leaderboard from '../components/Leaderboard'
import _QRCode from "react-qr-code";

const QRCode = _QRCode.default || _QRCode;

export default function DisplayPage() {
  const { eventId } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      const result = await callFunction('get-leaderboard', { eventCode: eventId })
      setData(result)
    } catch (error) {
      console.error('Failed to fetch leaderboard', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()

    // Subscribe to realtime updates on game_sessions
    const channel = supabase
      .channel('leaderboard-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_sessions',
        },
        () => {
          console.log('Leaderboard update detected')
          fetchData()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [eventId])

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center text-white">
      <div className="text-4xl font-bold animate-pulse">Initializing Display...</div>
    </div>
  )

  if (!data) return (
    <div className="min-h-screen bg-black flex items-center justify-center text-red-500">
      <div className="text-4xl font-bold">Event Not Found</div>
    </div>
  )

  const { top10, stats, recentPlayer } = data

  return (
    <div className="bg-black text-white min-vh-100 p-4 p-md-5 d-flex flex-column">
      {/* Top Banner */}
      <div className="row align-items-end mb-5 border-bottom border-5 border-white pb-4">
        <div className="col-12 col-lg-9">
          <h1 className="fw-black text-uppercase tracking-tighter mb-2" style={{ fontSize: 'calc(2rem + 3vw)', lineHeight: '1' }}>
            60-Second <span className="text-primary">CIO</span> Challenge
          </h1>
          <p className="h4 text-secondary fw-bold text-uppercase tracking-widest">Leadership under pressure</p>
        </div>
        <div className="col-12 col-lg-3 text-lg-end mt-4 mt-lg-0">
          <div className="display-4 fw-black mb-0 text-primary">{stats.totalCompleted}</div>
          <div className="h6 text-secondary fw-bold text-uppercase mb-0">Players Finished</div>
        </div>
      </div>

      <div className="row g-4 flex-grow-1">
        {/* Left: QR Code & Stats */}
        <div className="col-12 col-lg-4 d-flex flex-column gap-4">
          {/* QR Code Section */}
          <div className="bg-white rounded-5 p-4 text-center shadow-lg">
            <h3 className="h6 fw-bold text-dark text-uppercase mb-3">Scan to Join</h3>
            <div className="p-3 bg-white d-inline-block rounded-4 shadow-inner mb-3">
              <QRCode 
                value={`${window.location.origin}/start/${eventId}`} 
                size={200}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                viewBox={`0 0 256 256`}
              />
            </div>
            <p className="text-dark small fw-bold mb-0 opacity-75">
              {window.location.origin}/start/{eventId}
            </p>
          </div>

          <div className="bg-dark bg-opacity-50 border border-secondary border-opacity-25 rounded-5 p-4 p-md-5 flex-grow-1">
            <h3 className="h5 fw-bold text-secondary text-uppercase mb-5">Live Statistics</h3>
            <div className="row row-cols-1 g-5">
              <div className="col">
                <div className="display-5 fw-black text-white mb-1">{stats.highestScore}</div>
                <div className="small text-secondary text-uppercase fw-bold">Highest Score</div>
              </div>
              <div className="col">
                <div className="display-5 fw-black text-white mb-1">{stats.averageScore}</div>
                <div className="small text-secondary text-uppercase fw-bold">Average Score</div>
              </div>
              <div className="col">
                <div className="display-5 fw-black text-white mb-1">{stats.totalRegistered}</div>
                <div className="small text-secondary text-uppercase fw-bold">Total Participants</div>
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {recentPlayer && (
              <motion.div 
                key={recentPlayer.user_id}
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="bg-primary bg-gradient rounded-5 p-4 p-md-5 text-white shadow-lg"
              >
                <h3 className="h6 fw-bold text-white text-opacity-75 text-uppercase mb-4">Just Finished</h3>
                <div className="h2 fw-black mb-1 text-truncate">{recentPlayer.name}</div>
                <div className="h6 fw-medium text-white text-opacity-75 mb-4 text-truncate">{recentPlayer.company}</div>
                <div className="display-4 fw-black mt-3">{recentPlayer.total_score}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Top 10 Leaderboard */}
        <div className="col-12 col-lg-8">
          <div className="bg-white rounded-5 p-4 p-md-5 h-100 shadow-sm overflow-hidden">
            <h2 className="display-6 fw-black text-dark mb-5 border-start border-5 border-dark ps-4 text-uppercase">Top Performers</h2>
            <Leaderboard players={top10} darkMode={false} />
          </div>
        </div>
      </div>
    </div>
  )
}
