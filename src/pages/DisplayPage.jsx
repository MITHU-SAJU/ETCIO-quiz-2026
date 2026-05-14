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
          fetchData()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [eventId])

  if (loading) return (
    <div className="min-vh-100 bg-black d-flex align-items-center justify-content-center text-white">
      <div className="text-center">
        <div className="spinner-border text-danger mb-4" style={{ width: '4rem', height: '4rem' }}></div>
        <div className="h2 fw-bold text-uppercase tracking-widest">Initializing LED Wall...</div>
      </div>
    </div>
  )

  if (!data) return (
    <div className="min-vh-100 bg-black d-flex align-items-center justify-content-center text-danger">
      <div className="text-center">
        <h1 className="display-1 fw-bold">EVENT NOT FOUND</h1>
      </div>
    </div>
  )

  const { top10, stats, recentPlayer } = data

  return (
    <div
      className="min-vh-100 d-flex flex-column position-relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%)",
        color: "#fff"
      }}
    >
      {/* BACKGROUND GLOWS */}
      <div className="position-absolute top-0 start-0 w-100 h-100" style={{ pointerEvents: 'none' }}>
        <div className="position-absolute top-0 start-0 w-50 h-50 opacity-25" style={{ background: 'radial-gradient(circle at 0% 0%, #ff4d3d 0%, transparent 70%)' }}></div>
        <div className="position-absolute bottom-0 end-0 w-50 h-50 opacity-25" style={{ background: 'radial-gradient(circle at 100% 100%, #ff4d3d 0%, transparent 70%)' }}></div>
      </div>

      <div className="container-fluid h-100 px-4 px-lg-5 py-4 d-flex flex-column position-relative" style={{ zIndex: 10 }}>
        
        {/* HEADER */}
        <div className="row align-items-center mb-5">
          <div className="col-8">
            <div className="d-flex align-items-center gap-4">
              <h1 className="display-3 fw-900 mb-0 tracking-tighter">
                60-Second <span style={{ color: '#ff4d3d' }}>CHALLENGE</span>
              </h1>
              <div className="d-flex align-items-center gap-3 bg-white bg-opacity-10 px-4 py-2 rounded-pill border border-white border-opacity-10">
                <div className="rounded-circle bg-danger animate-pulse" style={{ width: '12px', height: '12px', boxShadow: '0 0 10px #ff4d3d' }}></div>
                <span className="h5 mb-0 fw-bold text-uppercase tracking-widest">LIVE SCOREBOARD</span>
              </div>
            </div>
          </div>
          
          <div className="col-4 d-flex justify-content-end align-items-center gap-4">
            <div className="text-end">
              <div className="h4 fw-900 text-uppercase tracking-widest mb-1">SCAN TO PLAY</div>
              <div className="h6 text-white text-opacity-50 mb-0">Join the leadership challenge</div>
            </div>
            <div className="bg-white p-3 rounded-4 shadow-xl border border-white border-opacity-20" style={{ boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
              <QRCode value={window.location.origin + "/start/" + eventId} size={100} />
            </div>
          </div>
        </div>

        {/* CONTENT GRID */}
        <div className="row g-5 flex-grow-1">
          
          {/* LEFT: STATS & RECENT */}
          <div className="col-xl-4 d-flex flex-column gap-4">
            
            {/* STATS CARD */}
            <div className="card border-0 rounded-5 p-5 flex-grow-1" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="h4 fw-bold text-uppercase tracking-widest text-secondary mb-5">Event Analytics</div>
              
              <div className="d-flex flex-column gap-5">
                <div className="stat-item">
                  <div className="display-2 fw-900 text-danger mb-0" style={{ lineHeight: 1 }}>{stats?.totalRegistered || 0}</div>
                  <div className="h5 text-uppercase tracking-widest text-white text-opacity-50">Leaders Registered</div>
                </div>
                
                <div className="stat-item">
                  <div className="display-2 fw-900 mb-0" style={{ lineHeight: 1 }}>{stats?.totalCompleted || 0}</div>
                  <div className="h5 text-uppercase tracking-widest text-white text-opacity-50">Challenges Finished</div>
                </div>

                {/* RECENT PLAYER */}
                <div className="mt-5">
                  <AnimatePresence mode="wait">
                    <motion.div 
                      key={recentPlayer?.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-4 rounded-4"
                      style={{ background: 'linear-gradient(135deg, #ff4d3d 0%, #ff1a1a 100%)', boxShadow: '0 20px 40px rgba(255,77,61,0.2)' }}
                    >
                      <div className="small fw-bold text-uppercase tracking-widest opacity-75 mb-2">Just Finished</div>
                      <div className="h3 fw-900 mb-1">{recentPlayer?.name || 'Ready for play'}</div>
                      <div className="h5 mb-0 opacity-90">{recentPlayer?.company || 'Waiting for first leader...'}</div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: THE RANKINGS */}
          <div className="col-xl-8 h-100">
            <div className="h-100 d-flex flex-column p-5 rounded-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="d-flex align-items-center justify-content-between mb-5">
                <h2 className="display-4 fw-900 mb-0 tracking-tighter">LEADERBOARD</h2>
                <div className="h5 text-secondary tracking-widest">TOP 10 PERFORMANCES</div>
              </div>

              <div className="flex-grow-1 overflow-hidden leaderboard-container">
                <Leaderboard 
                  players={top10?.slice(0, 10)} 
                  darkMode={true} 
                />
              </div>
            </div>
          </div>

        </div>

        {/* FOOTER TICKER */}
        <div className="mt-5 py-3 text-center border-top border-white border-opacity-10">
          <div className="h5 fw-bold text-uppercase tracking-widest text-white text-opacity-30">
            Kyndryl & ETCIO Present • The 60-Second Challenge • Who will lead the pack?
          </div>
        </div>

      </div>

      <style>{`
        .fw-900 { font-weight: 900; }
        .tracking-tighter { letter-spacing: -3px; }
        .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
        
        /* Custom styles for the Leaderboard component to ensure it scales for LED */
        .leaderboard-container table { font-size: 1.5rem !important; }
        .leaderboard-container .player-name { font-size: 1.8rem !important; font-weight: 800 !important; }
        .leaderboard-container .player-score { font-size: 2.2rem !important; color: #ff4d3d !important; font-weight: 900 !important; }
      `}</style>
    </div>
  )
}
