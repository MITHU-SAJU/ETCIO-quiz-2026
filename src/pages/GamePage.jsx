import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { callFunction, callRPC } from '../lib/supabase'
import { toast } from 'react-hot-toast'

export default function GamePage() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [questions, setQuestions] = useState(location.state?.questions || [])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [selectedOptions, setSelectedOptions] = useState([])
  const [error, setError] = useState(null)
  const timerRef = useRef(null)
  const synthRef = useRef(window.speechSynthesis)

  const speak = (text) => {
    if (!synthRef.current) return
    synthRef.current.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1.0
    utterance.pitch = 1.0
    synthRef.current.speak(utterance)
  }

  const fetchQuestions = async () => {
    if (questions.length > 0) {
      setLoading(false)
      startTimer()
      return
    }

    setLoading(true)
    try {
      const data = await callFunction('get-all-session-questions', { sessionId })
      if (data.completed) {
        navigate(`/result/${sessionId}`)
        return
      }
      setQuestions(data.questions)
      setCurrentIndex(data.currentIndex || 0)
      startTimer()
    } catch (error) {
      setError(error.message)
      toast.error('Failed to load questions')
    } finally {
      setLoading(false)
    }
  }

  const startTimer = () => {
    setTimeLeft(60)
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          autoSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const autoSubmit = () => {
    if (!submitting) {
      handleSubmit(null, 60)
    }
  }

  const handleToggleOption = (optionKey) => {
    if (submitting) return;

    setSelectedOptions(prev => {
      if (prev.includes(optionKey)) {
        return prev.filter(k => k !== optionKey);
      }
      // Removed the limit of 2 selections
      return [...prev, optionKey].sort();
    });
  }

  const handleSubmit = async (forceOptions, forceTime) => {
    const finalOptions = forceOptions !== undefined ? forceOptions : selectedOptions;
    if (submitting) return

    setSubmitting(true)
    if (timerRef.current) clearInterval(timerRef.current)

    const currentQuestion = questions[currentIndex]
    const responseTime = forceTime || (60 - timeLeft)

    try {
      const result = await callRPC('submit_answer', {
        p_session_id: sessionId,
        p_question_id: currentQuestion.id,
        p_selected_option: (finalOptions && finalOptions.length > 0) ? finalOptions.join(',') : null,
        p_response_time: responseTime
      })

      if (result.redirectToResult) {
        navigate(`/result/${sessionId}`)
      } else {
        setCurrentIndex(prev => prev + 1)
        setSelectedOptions([])
        setSubmitting(false)
        startTimer()
      }

    } catch (error) {
      toast.error('Submission failed')
      setSubmitting(false)
    }
  }

  useEffect(() => {
    fetchQuestions()
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (synthRef.current) synthRef.current.cancel()
    }
  }, [sessionId])

  const question = questions[currentIndex]

  useEffect(() => {
    if (question && !loading) {
      const timeout = setTimeout(() => {
        speak(`${question.title}. ${question.scenario}`);
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, loading, question]);

  if (loading && !question) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 bg-white">
        <div className="spinner-border text-danger mb-3" role="status" style={{ width: '3rem', height: '3rem' }}></div>
        <div className="text-muted fw-bold text-uppercase tracking-widest small">Loading Challenge...</div>
      </div>
    )
  }

  if (error || !question) {
    return (
      <div className="container min-vh-100 d-flex flex-column align-items-center justify-content-center text-center p-4">
        <div className="card card-enterprise p-5 shadow-sm border-0" style={{ maxWidth: '450px' }}>
          <div className="text-danger mb-4" style={{ fontSize: '4rem' }}>⚠️</div>
          <h2 className="h4 fw-bold text-dark mb-3">Something went wrong</h2>
          <p className="text-muted mb-4">{error || 'The quiz session could not be loaded or has expired.'}</p>
          <button onClick={() => navigate(-1)} className="btn btn-dark rounded-pill px-5 py-2 fw-bold">Go Back</button>
        </div>
      </div>
    )
  }

  const getOptionClass = (key) => {
    return selectedOption === key ? 'selected' : ''
  }

  return (
    <div
      className="min-vh-100 d-flex flex-column position-relative overflow-hidden"
      style={{ background: "#ffffff" }}
    >
      {/* KYNDRYL ACCENT - TOP BAR */}
      <div
        className="position-absolute top-0 start-0 w-100"
        style={{ height: "4px", background: "#ff4d3d", zIndex: 100 }}
      />

      {/* BACKGROUND DECORATION - SUBTLE GRID */}
      <div
        className="position-absolute inset-0 opacity-05"
        style={{
          backgroundImage: `radial-gradient(#ff4d3d 0.5px, transparent 0.5px)`,
          backgroundSize: "30px 30px",
          zIndex: 0
        }}
      />

      <div className="container py-4 py-lg-5 d-flex flex-column justify-content-between min-vh-100 position-relative" style={{ zIndex: 2, maxWidth: '1400px' }}>

        {/* TOP ROW: Title & Timer */}
        <div>
          <div className="row align-items-center mb-4 mb-lg-5">
            <div className="col-lg-8">
              <div className="d-flex align-items-center gap-3 mb-4">
                <div className="px-3 py-1 bg-light text-dark fw-bold text-uppercase tracking-widest border-start border-4 border-danger" style={{ fontSize: '0.7rem' }}>
                  CHALLENGE {currentIndex + 1} OF {questions.length}
                </div>
              </div>

              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-3"
                style={{
                  fontSize: "clamp(2rem, 4vw, 4rem)",
                  fontWeight: "200",
                  color: "rgb(255, 77, 61)",
                  letterSpacing: "-2px",
                  lineHeight: 1.1,
                }}
              >
                {question.title}
              </motion.h2>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-0 text-secondary ps-4 border-start border-1 border-success"
                style={{ fontSize: "clamp(1rem, 1.1vw, 1.15rem)", lineHeight: "1.7", maxWidth: "800px" }}
              >
                {question.scenario}
              </motion.div>
            </div>

            <div className="col-lg-4 d-flex justify-content-center justify-content-lg-end mt-4 mt-lg-0">
              <div className="position-relative d-flex align-items-center justify-content-center bg-white shadow-sm border border-light" style={{ width: "140px", height: "140px", borderRadius: "20px" }}>
                <svg width="120" height="120" viewBox="0 0 120 120" className="position-absolute">
                  <circle cx="60" cy="60" r="56" fill="none" stroke="#f8f8f8" strokeWidth="4" />
                  <circle cx="60" cy="60" r="56" fill="none" stroke="#ff4d3d" strokeWidth="4" strokeLinecap="square" strokeDasharray="351.8" strokeDashoffset={351.8 - (351.8 * timeLeft) / 60} transform="rotate(-90 60 60)" style={{ transition: "stroke-dashoffset 1s linear" }} />
                </svg>
                <div className="text-center">
                  <div style={{ fontSize: "2.8rem", fontWeight: "900", color: "#111", lineHeight: 1 }}>{timeLeft}</div>
                  <div className="text-uppercase tracking-widest text-danger fw-bold" style={{ fontSize: "0.55rem" }}>SECONDS</div>
                </div>
              </div>
            </div>
          </div>

          {/* PROGRESS BAR - KYNDRYL STYLE */}
          <div
            className="mb-5 position-relative"
            style={{
              height: "4px",
              background: "#f0f0f0",
            }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${((currentIndex + 1) / questions.length) * 100}%`,
              }}
              className="position-absolute top-0 start-0 h-100"
              style={{
                background: "rgb(255, 77, 61)",
              }}
            />
          </div>
        </div>

        {/* MIDDLE ROW: Options */}
        <div className="mb-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="d-grid d-grid-custom gap-4"
              style={{
                gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
              }}
            >
              {question.options.map((option, idx) => {
                const isSelected = selectedOptions.includes(option.option_key);
                const order = selectedOptions.indexOf(option.option_key) + 1;

                return (
                  <motion.button
                    key={option.id || idx}
                    whileHover={{ y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={submitting}
                    onClick={() => handleToggleOption(option.option_key)}
                    className="border-0 p-4 text-start position-relative d-flex flex-column justify-content-between transition-all"
                    style={{
                      aspectRatio: "1 / 1.1",
                      background: isSelected ? "#ff4d3d" : "#ffffff",
                      color: isSelected ? "#ffffff" : "#111111",
                      borderRadius: "0px", // Kyndryl often uses sharp or very slightly rounded edges
                      boxShadow: isSelected
                        ? "0 15px 35px rgba(255, 77, 61, 0.3)"
                        : "0 8px 20px rgba(0,0,0,0.04)",
                      border: isSelected ? "1px solid #ff4d3d" : "1px solid #eeeeee",
                      minHeight: "240px"
                    }}
                  >
                    {/* Corner Number */}
                    <div className={`fw-bold mb-4 ${isSelected ? 'text-white' : 'text-danger'}`} style={{ fontSize: "1.2rem", opacity: isSelected ? 1 : 0.4 }}>
                      {option.option_key}
                    </div>

                    {/* Option Text */}
                    <div className="fw-bold mb-3" style={{ fontSize: "1.1rem", lineHeight: "1.3", letterSpacing: "-0.2px" }}>
                      {option.option_text}
                    </div>

                    {/* Selection Indicator Pill */}
                    <div className="mt-auto d-flex align-items-center justify-content-between">
                      <div style={{ width: "30px", height: "2px", background: isSelected ? "#fff" : "#ff4d3d", opacity: 0.8 }} />
                      {isSelected && (
                        <div className="bg-white text-danger fw-black rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: "22px", height: "22px", fontSize: "0.65rem" }}>
                          {order}
                        </div>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* SUBMIT BUTTON ROW */}
        <div className="mt-5 text-center">
          <AnimatePresence>
            {selectedOptions.length > 0 && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ backgroundColor: "#111" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSubmit()}
                disabled={submitting}
                className="btn btn-danger py-3 px-5 border-0 shadow-lg d-inline-flex align-items-center gap-3"
                style={{
                  borderRadius: "0px",
                  fontWeight: "900",
                  letterSpacing: "2px",
                  fontSize: "1rem",
                  background: "#ff4d3d"
                }}
              >
                {submitting ? "PROCESSING..." : `CONFIRM ${selectedOptions.length > 1 ? 'DECISIONS' : 'DECISION'}`}
                <div style={{ width: "20px", height: "1px", background: "#fff" }} />
              </motion.button>
            )}
          </AnimatePresence>

          <div className="mt-4 text-muted opacity-50 text-uppercase tracking-widest fw-bold" style={{ fontSize: "0.65rem" }}>
            Identify your priorities and confirm to proceed
          </div>
        </div>
      </div>

      {/* MOBILE RESPONSIVE STYLE OVERRIDE */}
      <style>{`
        .d-grid-custom {
          grid-template-columns: repeat(5, 1fr);
        }
        @media (max-width: 1200px) {
          .d-grid-custom { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 768px) {
          .d-grid-custom { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .d-grid-custom { grid-template-columns: repeat(1, 1fr) !important; }
        }
        .transition-all { transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); }
      `}</style>
    </div>
  )
}
