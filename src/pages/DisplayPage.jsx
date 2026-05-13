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

        {/* MAIN SECTION */}
        <div
          className="row g-3"
          style={{
            height: "calc(100vh - 120px)",
          }}
        >

          {/* RIGHT SIDE */}
          <div className="col-12 h-100">

            <div
              className="rounded-5 p-4 h-100 d-flex flex-column"
              style={{
                background: "#ffffff",
                boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
              }}
            >

              {/* HEADER */}
              <div className="mb-4">

                <div
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: "700",
                    letterSpacing: "2px",
                    color: "#8a8a8a",
                    textTransform: "uppercase",
                    marginBottom: "10px",
                  }}
                >
                  Live Rankings
                </div>

                <h2
                  className="mb-0"
                  style={{
                    fontSize: "3rem",
                    fontWeight: "700",
                    color: "#2b2b2b",
                    letterSpacing: "-2px",
                    lineHeight: 1,
                  }}
                >
                  Top 10 Performers
                </h2>

              </div>

              {/* LEADERBOARD */}
              <div
                className="flex-grow-1 overflow-hidden"
              >
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
