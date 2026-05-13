import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase, callFunction } from '../lib/supabase'
import { toast } from 'react-hot-toast'
import KyndrylLogo from '../assets/kyndryl.png'
import QRCodeModule from 'react-qr-code'
const QRCode = QRCodeModule.default || QRCodeModule
import Leaderboard from '../components/Leaderboard'

export default function StartPage() {
  const [top10, setTop10] = useState([])
  const { eventId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(false)
  const [eventData, setEventData] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    designation: '',
    email: ''
  })

  useEffect(() => {
    if (location.state?.prefill) {
      const { name, company, designation, email } = location.state.prefill
      setFormData(prev => ({
        ...prev,
        name: name || prev.name,
        company: company || prev.company,
        designation: designation || prev.designation,
        email: email || prev.email
      }))
    }
  }, [location.state])
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch Event Data
        const { data: eData, error: eError } = await supabase
          .from('events')
          .select('*')
          .eq('event_code', eventId)
          .eq('is_active', true)
          .single()

        if (eError || !eData) {
          toast.error('Event not found or inactive')
          return
        }
        setEventData(eData)

        // Fetch Leaderboard Data
        const lbData = await callFunction('get-leaderboard', {
          eventCode: eventId
        })
        setTop10(lbData.top10 || [])
      } catch (err) {
        console.error('Fetch error:', err)
      }
    }

    if (eventId) fetchData()
  }, [eventId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await callFunction('create-session', {
        eventCode: eventId,
        ...formData
      })

      if (result.sessionId) {
        navigate(`/game/${result.sessionId}`, {
          state: { questions: result.questions }
        })
      }
    } catch (error) {
      console.error(error)
      toast.error(error.message || 'Failed to start challenge')
    } finally {
      setLoading(false)
    }
  }

  if (!eventData && !loading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Event Not Found</h1>
          <p className="mt-2 text-gray-600">The event code you provided is invalid or the event has ended.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container-fluid min-vh-100 p-0 overflow-hidden">
      <div className="row g-0 min-vh-100">

        {/* LEFT SIDE */}
        <div
          className="col-lg-6 d-flex flex-column justify-content-center position-relative px-4 px-md-5 py-5 py-lg-0"
          style={{
            background: "#f5f5f5",
            overflow: "hidden",
            minHeight: "40vh",
          }}
        >

          {/* Logo */}
          <div className="mb-4 mb-lg-5 text-center text-lg-start">
            <img
              src={KyndrylLogo}
              alt="Kyndryl Logo"
              className="img-fluid"
              style={{
                width: "160px",
                maxWidth: "100%",
              }}
            />
          </div>



          {/* Main Title */}
          <div className="position-relative z-2 text-center text-lg-start">
            <h1
              className="fw-light lh-1 mb-3"
              style={{
                fontSize: "clamp(2.5rem, 7vw, 6rem)",
                color: "#ff4d3d",
                letterSpacing: "-2px",
              }}
            >
              60-Second
              <br />
              CIO Challenge
            </h1>
          </div>

          {/* QR + LEADERBOARD SECTION */}
          <div className="row mt-5 g-4 align-items-stretch d-none d-lg-flex">

            {/* LEFT SIDE - QR */}
            <div className="col-lg-4">

              <div
                className="h-100 d-flex flex-column justify-content-center align-items-start"
                style={{
                  minHeight: "100%",
                }}
              >

                {/* TEXT */}
                <p
                  className="mb-4 text-center"
                  style={{
                    fontSize: "1.8rem",
                    color: "#ff4d3d",
                    letterSpacing: "-1px",
                    lineHeight: "1.1",
                    fontWeight: "600",
                  }}
                >
                  Scan to Play

                </p>

                {/* QR CARD */}
                <div
                  className="bg-white rounded-4 shadow-sm"
                  style={{
                    padding: "18px",
                  }}
                >
                  <QRCode
                    value={window.location.href}
                    size={200}
                    style={{
                      height: "auto",
                      maxWidth: "100%",
                      width: "100%",
                    }}
                    viewBox={`0 0 256 256`}
                  />
                </div>

              </div>

            </div>

            {/* RIGHT SIDE - LEADERBOARD */}
            <div className="col-lg-8">

              <div
                className="h-100"
                style={{
                  border: "2px solid #ff4d3d",
                  borderRadius: "28px",
                  padding: "28px",
                  background: "rgba(255,255,255,0.75)",
                  backdropFilter: "blur(10px)",
                }}
              >

                {/* HEADER */}
                <div className="d-flex align-items-center justify-content-between mb-4">

                  <div>

                    <div
                      style={{
                        fontSize: "0.75rem",
                        letterSpacing: "2px",
                        textTransform: "uppercase",
                        color: "#8a8a8a",
                        fontWeight: "700",
                        marginBottom: "6px",
                      }}
                    >
                      Live Rankings
                    </div>

                    <h3
                      className="mb-0"
                      style={{
                        fontSize: "2rem",
                        fontWeight: "700",
                        color: "#2b2b2b",
                        letterSpacing: "-1px",
                      }}
                    >
                      Top Performers
                    </h3>

                  </div>

                  {/* BUTTON */}
                  <button
                    type="button"
                    className="btn px-4 py-2 rounded-pill"
                    style={{
                      background: "#ff4d3d",
                      color: "#fff",
                      border: "none",
                      fontWeight: "600",
                      fontSize: "0.9rem",
                      letterSpacing: "0.5px",
                      whiteSpace: "nowrap",
                      zIndex: 100,
                      position: "relative",
                    }}
                    onClick={() => navigate(`/display/${eventId}`)}
                  >
                    View All
                  </button>

                </div>

                {/* PLAYERS */}
                <div className="d-flex flex-column gap-3">

                  {top10?.slice(0, 3).map((player, index) => (
                    <div
                      key={player.user_id}
                      className="d-flex align-items-center justify-content-between bg-white rounded-4 px-4 py-3 shadow-sm"
                      style={{
                        minHeight: "88px",
                      }}
                    >

                      {/* LEFT */}
                      <div className="d-flex align-items-center gap-3 overflow-hidden">

                        {/* RANK */}
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center"
                          style={{
                            width: "52px",
                            height: "52px",
                            background:
                              index === 0
                                ? "#ff4d3d"
                                : "#2b2b2b",

                            color: "#fff",
                            fontWeight: "700",
                            fontSize: "1rem",
                            flexShrink: 0,
                          }}
                        >
                          #{index + 1}
                        </div>

                        {/* DETAILS */}
                        <div className="overflow-hidden">

                          <div
                            className="fw-bold text-truncate"
                            style={{
                              maxWidth: "240px",
                              color: "#2b2b2b",
                              fontSize: "1rem",
                            }}
                          >
                            {player.name}
                          </div>

                          <div
                            className="text-truncate"
                            style={{
                              fontSize: "0.88rem",
                              color: "#8a8a8a",
                              maxWidth: "240px",
                            }}
                          >
                            {player.company}
                          </div>

                        </div>

                      </div>

                      {/* SCORE */}
                      <div
                        style={{
                          fontSize: "1.8rem",
                          fontWeight: "700",
                          color: "#ff4d3d",
                          letterSpacing: "-1px",
                          flexShrink: 0,
                        }}
                      >
                        {player.total_score}
                      </div>

                    </div>
                  ))}

                </div>

              </div>

            </div>

          </div>

          {/* Decorative Pattern */}
          <div
            className="position-absolute top-0 end-0 h-100 d-none d-lg-block"
            style={{
              width: "220px",
              opacity: 0.5,
              pointerEvents: "none",
              zIndex: 1,
            }}
          >
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  right: `${i * 22}px`,
                  top: "-10%",
                  width: "1px",
                  height: "130%",
                  background: "#ff4d3d",
                  transform: "skewX(-25deg)",
                }}
              />
            ))}
          </div>
        </div>

        {/* RIGHT SIDE FORM */}
        <div
          className="col-lg-6 d-flex align-items-center justify-content-center"
          style={{
            background: "#ffffff",
          }}
        >
          <div
            className="w-100 d-flex flex-column justify-content-center px-4 px-md-5 py-5"
            style={{
              maxWidth: "720px",
              minHeight: "60vh",
            }}
          >
            
            {/* Back Button */}
            <div className="mb-4">
              <button 
                onClick={() => navigate(`/start/${eventId}`)}
                className="btn btn-link text-muted p-0 text-decoration-none small fw-bold"
              >
                ← BACK TO SCANNER
              </button>
            </div>

            {/* Main Heading */}
            <div className="mb-4">
              <h1
                className="mb-2 lh-1"
                style={{
                  fontSize: "clamp(2.8rem, 5vw, 5rem)",
                  fontWeight: "700",
                  color: "#2b2b2b",
                  letterSpacing: "-3px",
                }}
              >
                Welcome
              </h1>

              <h2
                className="lh-1"
                style={{
                  fontSize: "clamp(2rem, 4vw, 4rem)",
                  fontWeight: "300",
                  color: "#ff4d3d",
                  letterSpacing: "-2px",
                }}
              >
                Start Your Challenge
              </h2>
            </div>

            {/* Description */}
            <p
              className="mb-5"
              style={{
                color: "#7a7a7a",
                fontSize: "1.05rem",
                lineHeight: "1.8",
                maxWidth: "550px",
              }}
            >
              Enter your professional details below to participate in the
              60-Second CIO Challenge experience.
            </p>

            {/* FORM */}
            <form onSubmit={handleSubmit}>

              <div className="row g-4">

                {/* Full Name */}
                <div className="col-12">
                  <label
                    className="form-label mb-2"
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: "700",
                      letterSpacing: "1px",
                      color: "#444",
                      textTransform: "uppercase",
                    }}
                  >
                    Full Name
                  </label>

                  <input
                    required
                    type="text"
                    placeholder="Enter your full name"
                    className="form-control border-0 border-bottom rounded-0 shadow-none px-0"
                    style={{
                      height: "58px",
                      fontSize: "1.15rem",
                      background: "transparent",
                      borderBottom: "2px solid #dcdcdc",
                    }}
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        name: e.target.value,
                      })
                    }
                  />
                </div>

                {/* Company */}
                <div className="col-12 col-md-6">
                  <label
                    className="form-label mb-2"
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: "700",
                      letterSpacing: "1px",
                      color: "#444",
                      textTransform: "uppercase",
                    }}
                  >
                    Company
                  </label>

                  <input
                    required
                    type="text"
                    placeholder="Company name"
                    className="form-control border-0 border-bottom rounded-0 shadow-none px-0"
                    style={{
                      height: "58px",
                      fontSize: "1.1rem",
                      background: "transparent",
                      borderBottom: "2px solid #dcdcdc",
                    }}
                    value={formData.company}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        company: e.target.value,
                      })
                    }
                  />
                </div>

                {/* Designation */}
                <div className="col-12 col-md-6">
                  <label
                    className="form-label mb-2"
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: "700",
                      letterSpacing: "1px",
                      color: "#444",
                      textTransform: "uppercase",
                    }}
                  >
                    Designation
                  </label>

                  <input
                    required
                    type="text"
                    placeholder="Your designation"
                    className="form-control border-0 border-bottom rounded-0 shadow-none px-0"
                    style={{
                      height: "58px",
                      fontSize: "1.1rem",
                      background: "transparent",
                      borderBottom: "2px solid #dcdcdc",
                    }}
                    value={formData.designation}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        designation: e.target.value,
                      })
                    }
                  />
                </div>

                {/* Email */}
                <div className="col-12">
                  <label
                    className="form-label mb-2"
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: "700",
                      letterSpacing: "1px",
                      color: "#444",
                      textTransform: "uppercase",
                    }}
                  >
                    Email Address
                  </label>

                  <input
                    type="email"
                    placeholder="Enter email address"
                    className="form-control border-0 border-bottom rounded-0 shadow-none px-0"
                    style={{
                      height: "58px",
                      fontSize: "1.1rem",
                      background: "transparent",
                      borderBottom: "2px solid #dcdcdc",
                    }}
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        email: e.target.value,
                      })
                    }
                  />
                </div>

                {/* Button */}
                <div className="col-12 pt-4">
                  <button
                    disabled={loading}
                    type="submit"
                    className="btn rounded-pill px-5 py-3 fw-bold"
                    style={{
                      background: "#ff4d3d",
                      color: "#fff",
                      border: "none",
                      minWidth: "220px",
                      fontSize: "1rem",
                      letterSpacing: "1px",
                      transition: "all 0.3s ease",
                    }}
                  >
                    {loading
                      ? "PREPARING..."
                      : "START CHALLENGE"}
                  </button>
                </div>

              </div>
            </form>

            {/* Footer */}
            <div className="mt-5 pt-3">
              <p
                className="mb-0"
                style={{
                  fontSize: "0.9rem",
                  color: "#8a8a8a",
                  lineHeight: "1.8",
                }}
              >
                Powered by <strong>ETCIO</strong> &{" "}
                <strong>Enterprise Leaders Network</strong>
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
