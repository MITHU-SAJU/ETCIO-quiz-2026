import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { callFunction } from '../lib/supabase'
import { toast } from 'react-hot-toast'
import { Weight } from 'lucide-react'

export default function GamePage() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [questions, setQuestions] = useState(location.state?.questions || [])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [selectedOption, setSelectedOption] = useState(null)
  const [correctOption, setCorrectOption] = useState(null)
  const [error, setError] = useState(null)
  const [feedbackVisible, setFeedbackVisible] = useState(false)
  const timerRef = useRef(null)
  const synthRef = useRef(window.speechSynthesis)

  const speak = (text) => {
    if (!synthRef.current) return
    synthRef.current.cancel() // Stop any previous speech
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
      // Fallback: Fetch all questions if not passed in state
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
    if (!submitting && !feedbackVisible) {
      handleSubmit(null, 60)
    }
  }

  const handleSubmit = async (optionKey, forceTime) => {
    if (submitting || feedbackVisible) return
    setSubmitting(true)
    if (timerRef.current) clearInterval(timerRef.current)

    const currentQuestion = questions[currentIndex]
    const responseTime = forceTime || (60 - timeLeft)

    try {
      const result = await callFunction('submit-answer', {
        sessionId,
        questionId: currentQuestion.id,
        selectedOption: optionKey,
        responseTime: responseTime
      })

      setCorrectOption(result.correctOption)
      setFeedbackVisible(true)

      setTimeout(() => {
        if (result.redirectToResult) {
          navigate(`/result/${sessionId}`)
        } else {
          // Instant local transition
          setCurrentIndex(prev => prev + 1)
          setFeedbackVisible(false)
          setCorrectOption(null)
          setSelectedOption(null)
          setSubmitting(false)
          startTimer()
        }
      }, 1500)

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

  // Speak question when it changes
  useEffect(() => {
    if (question && !loading && !feedbackVisible) {
      // Small delay to ensure component is ready and user has interacted
      const timeout = setTimeout(() => {
        speak(`${question.title}. ${question.scenario}`);
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, loading, feedbackVisible]);

  // Speak feedback
  useEffect(() => {
    if (feedbackVisible && selectedOption) {
      if (selectedOption === correctOption) {
        speak("Correct!");
      } else {
        speak("Incorrect. The correct answer was " + correctOption);
      }
    }
  }, [feedbackVisible]);

  const question = questions[currentIndex]

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
    if (!feedbackVisible) return selectedOption === key ? 'selected' : ''
    if (key === correctOption) return 'correct'
    if (key === selectedOption && key !== correctOption) return 'wrong'
    return 'fade-out'
  }

  return (
    <div
      className="min-vh-100 d-flex flex-column position-relative overflow-hidden"
      style={{
        background: "#f4f4f4",
      }}
    >

      {/* BACKGROUND LINES */}
      <div
        className="position-absolute top-0 end-0 h-100 d-none d-lg-block"
        style={{
          width: "260px",
          opacity: 0.08,
          zIndex: 0,
        }}
      >
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              right: `${i * 22}px`,
              top: "-10%",
              width: "2px",
              height: "130%",
              background: "#ff4d3d",
              transform: "skewX(-22deg)",
            }}
          />
        ))}
      </div>

      <div className="container-fluid px-3 px-lg-5 py-3 py-lg-4 position-relative" style={{ zIndex: 2 }}>

        {/* HEADER */}
        <div className="row align-items-center mb-4 mb-lg-5">

          {/* LEFT */}
          <div className="col-lg-8 mb-4 mb-lg-0">

            {/* TOP BADGE */}
            <div className="d-flex align-items-center gap-3 mb-4">

              <div
                className="px-4 py-2 rounded-pill"
                style={{
                  background: "#2b2b2b",
                  color: "#fff",
                  fontSize: "0.78rem",
                  fontWeight: "700",
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                }}
              >
                Round {currentIndex + 1} / {questions.length}
              </div>

              <div
                style={{
                  width: "70px",
                  height: "2px",
                  background: "#ff4d3d",
                }}
              />
            </div>

            {/* TITLE */}
            <motion.h2
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-3"
              style={{
                fontSize: "clamp(2.5rem, 7vw, 6rem)",
                color: "rgb(255, 77, 61)",
                letterSpacing: "-2px",
                fontWeight: "300"
              }}>
              {question.title}
            </motion.h2>

            {/* DESCRIPTION */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-0"
              style={{
                color: "#6f6f6f",
                fontSize: "clamp(1rem, 1.2vw, 1.15rem)",
                lineHeight: "1.8",
                maxWidth: "900px",
                fontWeight: "400",
              }}
            >
              {question.scenario}
            </motion.p>

          </div>

          {/* TIMER */}
          <div className="col-lg-4 d-flex justify-content-center justify-content-lg-end">

            <div
              className="position-relative d-flex align-items-center justify-content-center"
              style={{
                width: "170px",
                height: "170px",
              }}
            >

              {/* SVG TIMER */}
              <svg width="170" height="170" viewBox="0 0 170 170">

                {/* OUTER LIGHT RING */}
                <circle
                  cx="85"
                  cy="85"
                  r="72"
                  fill="none"
                  stroke="rgba(255,77,61,0.12)"
                  strokeWidth="12"
                />

                {/* BACKGROUND TRACK */}
                <circle
                  cx="85"
                  cy="85"
                  r="68"
                  fill="none"
                  stroke="rgba(255,77,61,0.15)"
                  strokeWidth="8"
                />

                {/* ACTIVE PROGRESS */}
                <circle
                  cx="85"
                  cy="85"
                  r="68"
                  fill="none"
                  stroke="#ff4d3d"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray="427"
                  strokeDashoffset={427 - (427 * timeLeft) / 60}
                  transform="rotate(-90 85 85)"
                  style={{
                    transition: "stroke-dashoffset 1s linear",
                    filter: "drop-shadow(0 0 12px rgba(255,77,61,0.45))",
                  }}
                />

              </svg>

              {/* CENTER CONTENT */}
              <div
                className="position-absolute d-flex flex-column align-items-center justify-content-center rounded-circle"
                style={{
                  width: "118px",
                  height: "118px",
                  background: "#ffffff",
                  border: "2px solid rgba(255,77,61,0.12)",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
                }}
              >

                {/* TIME */}
                <div
                  style={{
                    fontSize: "3.2rem",
                    fontWeight: "700",
                    lineHeight: 1,
                    letterSpacing: "-3px",
                    color: "#ff4d3d",
                  }}
                >
                  {timeLeft}
                </div>

                {/* LABEL */}
                <div
                  style={{
                    fontSize: "0.7rem",
                    letterSpacing: "3px",
                    color: "#8c8c8c",
                    marginTop: "8px",
                    fontWeight: "700",
                    textTransform: "uppercase",
                  }}
                >
                  Seconds
                </div>

              </div>

            </div>

          </div>
        </div>

        {/* PROGRESS BAR */}
        <div className="mb-4 mb-lg-5">

          <div
            style={{
              height: "7px",
              background: "#d9d9d9",
              borderRadius: "20px",
              overflow: "hidden",
            }}
          >

            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${((currentIndex + 1) / questions.length) * 100}%`,
              }}
              transition={{
                duration: 0.4,
              }}
              style={{
                height: "100%",
                background: "#ff4d3d",
                borderRadius: "20px",
              }}
            />

          </div>

        </div>

        {/* OPTIONS */}
        <AnimatePresence mode="wait">

          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -25 }}
            transition={{ duration: 0.3 }}
            className="row g-3 g-lg-4"
          >

            {question.options.map((option, index) => (
              <div className="col-12 col-md-6" key={option.option_key}>

                <motion.button
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06 }}
                  disabled={submitting || feedbackVisible}
                  onClick={() => {
                    setSelectedOption(option.option_key)
                    handleSubmit(option.option_key)
                  }}
                  className={`w-100 border-0 text-start position-relative overflow-hidden ${getOptionClass(option.option_key)}`}
                  style={{
                    background:
                      selectedOption === option.option_key && !feedbackVisible
                        ? "#2b2b2b"
                        : "#ffffff",

                    color:
                      selectedOption === option.option_key && !feedbackVisible
                        ? "#ffffff"
                        : "#2b2b2b",

                    borderRadius: "28px",
                    padding: "1.8rem",
                    minHeight: "180px",
                    transition: "all 0.25s ease",
                    boxShadow: "0 10px 35px rgba(0,0,0,0.05)",
                    border:
                      selectedOption === option.option_key
                        ? "2px solid #ff4d3d"
                        : "2px solid transparent",
                  }}
                >

                  {/* TOP */}
                  <div className="d-flex align-items-center justify-content-between mb-4">

                    {/* OPTION KEY */}
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center"
                      style={{
                        width: "54px",
                        height: "54px",
                        background:
                          selectedOption === option.option_key && !feedbackVisible
                            ? "#ff4d3d"
                            : "#f4f4f4",

                        color:
                          selectedOption === option.option_key && !feedbackVisible
                            ? "#fff"
                            : "#2b2b2b",

                        fontWeight: "700",
                        fontSize: "1rem",
                        flexShrink: 0,
                      }}
                    >
                      {option.option_key}
                    </div>

                    {/* STATUS */}
                    {feedbackVisible &&
                      option.option_key === correctOption && (
                        <div
                          className="px-3 py-2 rounded-pill"
                          style={{
                            background: "#28a745",
                            color: "#fff",
                            fontSize: "0.7rem",
                            fontWeight: "700",
                            letterSpacing: "1px",
                          }}
                        >
                          CORRECT
                        </div>
                      )}

                    {feedbackVisible &&
                      option.option_key === selectedOption &&
                      option.option_key !== correctOption && (
                        <div
                          className="px-3 py-2 rounded-pill"
                          style={{
                            background: "#ff4d3d",
                            color: "#fff",
                            fontSize: "0.7rem",
                            fontWeight: "700",
                            letterSpacing: "1px",
                          }}
                        >
                          WRONG
                        </div>
                      )}

                  </div>

                  {/* OPTION TEXT */}
                  <div
                    style={{
                      fontSize: "1.08rem",
                      lineHeight: "1.8",
                      fontWeight: "500",
                      letterSpacing: "-0.2px",
                    }}
                  >
                    {option.option_text}
                  </div>

                  {/* HOVER BAR */}
                  <div
                    className="position-absolute bottom-0 start-0"
                    style={{
                      width: "100%",
                      height: "5px",
                      background:
                        selectedOption === option.option_key
                          ? "#ff4d3d"
                          : "#f1f1f1",
                    }}
                  />

                </motion.button>

              </div>
            ))}

          </motion.div>

        </AnimatePresence>

        {/* FOOTER */}
        <div className="text-center mt-5 pt-3">

          <div
            style={{
              fontSize: "0.8rem",
              letterSpacing: "3px",
              textTransform: "uppercase",
              color: "#9a9a9a",
              fontWeight: "700",
            }}
          >
            Think Fast • Decide Smart • Lead Boldly
          </div>

        </div>

      </div>
    </div >
  )
}
