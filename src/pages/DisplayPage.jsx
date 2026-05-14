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
    <div
      className="vh-100 overflow-hidden"
      style={{
        background: "#f4f4f4",
      }}
    >
      <div className="container-fluid h-100 px-3 px-lg-4 py-3">
        {/* HEADER BAR */}
        <div className="d-flex align-items-center justify-content-between mb-4 px-3">
          <div className="d-flex align-items-center gap-4">
            <h1 className="mb-0 fw-black" style={{ fontSize: '2.5rem', letterSpacing: '-2px' }}>
              60-Second <span style={{ color: '#ff4d3d' }}>Challenge</span>
            </h1>
            <div className="d-flex align-items-center gap-2 bg-white px-3 py-2 rounded-pill shadow-sm">
              <div className="rounded-circle bg-danger animate-pulse" style={{ width: '10px', height: '10px' }}></div>
              <span className="small fw-bold text-uppercase tracking-wider">Live Updates</span>
            </div>
          </div>
          
          <div className="d-flex align-items-center gap-3">
            <div className="text-end">
              <div className="small text-muted fw-bold text-uppercase">Scan to Play</div>
              <div className="small text-secondary">Join the leaderboard</div>
            </div>
            <div className="bg-white p-2 rounded-3 shadow-sm">
              <QRCode value={window.location.origin + "/start/" + eventId} size={60} />
            </div>
          </div>
        </div>

        {/* MAIN SECTION */}
        <div
          className="row g-4"
          style={{
            height: "calc(100vh - 150px)",
          }}
        >
          {/* LEFT SIDE - Stats or Info (Optional) */}
          <div className="col-lg-4 d-none d-lg-flex flex-column gap-4">
             <div className="card border-0 rounded-5 p-4 flex-grow-1 shadow-sm" style={{ background: '#2b2b2b', color: '#fff' }}>
                <h3 className="h5 fw-bold mb-4 opacity-75 text-uppercase tracking-widest">Event Stats</h3>
                <div className="d-flex flex-column gap-4 justify-content-center h-100">
                   <div>
                      <div className="display-4 fw-black text-danger">{stats?.totalRegistered || 0}</div>
                      <div className="text-muted small fw-bold text-uppercase mt-1">Total Participants</div>
                   </div>
                   <div>
                      <div className="display-4 fw-black">{stats?.totalCompleted || 0}</div>
                      <div className="text-muted small fw-bold text-uppercase mt-1">Completed Challenges</div>
                   </div>
                   <div className="mt-auto">
                      <div className="p-3 rounded-4 bg-white bg-opacity-10">
                        <div className="small opacity-50 mb-1 text-uppercase fw-bold">Recent Player</div>
                        <div className="fw-bold">{recentPlayer?.name || 'Waiting...'}</div>
                        <div className="small text-danger">{recentPlayer?.company}</div>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          {/* RIGHT SIDE - LEADERBOARD */}
          <div className="col-12 col-lg-8 h-100">
            <div
              className="rounded-5 p-4 h-100 d-flex flex-column"
              style={{
                background: "#ffffff",
                boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
              }}
            >
              <div className="mb-4">
                <h2
                  className="mb-0"
                  style={{
                    fontSize: "2.5rem",
                    fontWeight: "700",
                    color: "#2b2b2b",
                    letterSpacing: "-1.5px",
                  }}
                >
                  Top Performers
                </h2>
              </div>

              <div className="flex-grow-1 overflow-hidden">
                <Leaderboard
                  players={top10?.slice(0, 10)}
                  darkMode={false}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
