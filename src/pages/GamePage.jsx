import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { callFunction } from '../lib/supabase'
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
      speak(`${question.title}. ${question.scenario}`)
    }
  }, [currentIndex, loading])

  // Speak feedback
  useEffect(() => {
    if (feedbackVisible) {
      if (selectedOption === correctOption) {
        speak("Correct!")
      } else {
        speak("Incorrect.")
      }
    }
  }, [feedbackVisible])

  const question = questions[currentIndex]

  if (loading && !question) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100 bg-white">
        <div className="spinner-border text-dark" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  if (error || !question) {
    return (
      <div className="container min-vh-100 d-flex flex-column align-items-center justify-content-center text-center p-4">
        <div className="card card-enterprise p-5 shadow-sm border-0" style={{ maxWidth: '400px' }}>
          <h2 className="h4 fw-bold text-danger mb-3">Error</h2>
          <p className="text-muted mb-4 small">{error || 'Could not fetch game data.'}</p>
          <button onClick={() => window.location.reload()} className="btn btn-enterprise w-100">Retry</button>
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
      className="min-vh-100 d-flex align-items-center py-3 py-lg-4"
      style={{
        background: "#f4f4f4",
        overflow: "hidden",
      }}
    >
      <div className="container-fluid px-3 px-md-4 px-xl-5">
        <div className="row justify-content-center">
          <div className="col-12 col-xl-11">

            {/* TOP HEADER */}
            <div className="row align-items-center mb-4 mb-lg-5">

              {/* LEFT */}
              <div className="col-lg-8 mb-4 mb-lg-0">

                <div className="d-flex align-items-center gap-3 mb-3">

                  <div
                    className="px-3 py-2 rounded-pill"
                    style={{
                      background: "#2b2b2b",
                      color: "#fff",
                      fontSize: "0.82rem",
                      fontWeight: "700",
                      letterSpacing: "1.5px",
                      textTransform: "uppercase",
                    }}
                  >
                    Round {currentIndex + 1} / {questions.length}
                  </div>

                  <div
                    style={{
                      width: "60px",
                      height: "1px",
                      background: "#cfcfcf",
                    }}
                  />
                </div>

                <motion.h1
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-2 lh-1"
                  style={{
                    fontSize: "clamp(2.2rem, 4vw, 4.5rem)",
                    fontWeight: "700",
                    color: "#2d2d2d",
                    letterSpacing: "-3px",
                  }}
                >
                  {question.title}
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mb-0"
                  style={{
                    color: "#7c7c7c",
                    fontSize: "clamp(0.9rem, 1.2vw, 1.15rem)",
                    maxWidth: "900px",
                    lineHeight: "1.6",
                    fontWeight: "400",
                  }}
                >
                  {question.scenario}
                </motion.p>
              </div>

              {/* TIMER */}
              <div className="col-lg-4 d-flex justify-content-center justify-content-lg-end">

                <div
                  className="position-relative d-flex align-items-center justify-content-center mt-3 mt-lg-0"
                  style={{
                    width: "clamp(100px, 15vw, 120px)",
                    height: "clamp(100px, 15vw, 120px)",
                  }}
                >
                  <svg width="120" height="120" viewBox="0 0 120 120">

                    {/* Background Circle */}
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke="#dddddd"
                      strokeWidth="6"
                    />

                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke={timeLeft <= 10 ? "#ff4d3d" : "#2b2b2b"}
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray="314"
                      strokeDashoffset={314 - (314 * timeLeft) / 60}
                      transform="rotate(-90 60 60)"
                      style={{
                        transition: "stroke-dashoffset 1s linear",
                      }}
                    />
                  </svg>

                  <div className="position-absolute text-center">
                    <div
                      style={{
                        fontSize: "2.2rem",
                        fontWeight: "700",
                        color: timeLeft <= 10 ? "#ff4d3d" : "#2b2b2b",
                        lineHeight: 1,
                      }}
                    >
                      {timeLeft}
                    </div>

                    <div
                      style={{
                        fontSize: "0.72rem",
                        letterSpacing: "2px",
                        color: "#8c8c8c",
                        marginTop: "6px",
                      }}
                    >
                      SECONDS
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* PROGRESS */}
            <div className="mb-4 mb-lg-5">

              <div
                style={{
                  height: "6px",
                  background: "#dfdfdf",
                  overflow: "hidden",
                  borderRadius: "20px",
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

            {/* MAIN CONTENT */}
            <AnimatePresence mode="wait">

              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.35 }}
                className="row g-3 g-md-4"
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
                      className={`w-100 border-0 text-start h-100 option-card shadow-sm ${getOptionClass(option.option_key)}`}
                      style={{
                        background:
                          selectedOption === option.option_key && !feedbackVisible
                            ? "#2b2b2b"
                            : "#ffffff",

                        color:
                          selectedOption === option.option_key && !feedbackVisible
                            ? "#ffffff"
                            : "#2b2b2b",

                        borderRadius: "24px",
                        padding: "1.25rem 1.5rem",
                        minHeight: "120px",
                        height: "100%",
                        transition: "all 0.25s ease",
                      }}
                    >

                      {/* OPTION TOP */}
                      <div className="d-flex align-items-center justify-content-between mb-3">

                        <div
                          className="d-flex align-items-center justify-content-center rounded-circle"
                          style={{
                            width: "44px",
                            height: "44px",
                            background:
                              selectedOption === option.option_key && !feedbackVisible
                                ? "#ff4d3d"
                                : "#f3f3f3",

                            color:
                              selectedOption === option.option_key && !feedbackVisible
                                ? "#fff"
                                : "#2b2b2b",

                            fontWeight: "700",
                            fontSize: "0.9rem",
                            flexShrink: 0,
                          }}
                        >
                          {option.option_key}
                        </div>

                        {feedbackVisible && option.option_key === correctOption && (
                          <div className="text-white small fw-bold">CORRECT</div>
                        )}
                        {feedbackVisible && option.option_key === selectedOption && option.option_key !== correctOption && (
                          <div className="text-white small fw-bold">WRONG</div>
                        )}
                      </div>

                      {/* TEXT */}
                      <div
                        style={{
                          fontSize: "1rem",
                          lineHeight: "1.5",
                          fontWeight: "500",
                        }}
                      >
                        {option.option_text}
                      </div>

                    </motion.button>

                  </div>
                ))}

              </motion.div>

            </AnimatePresence>

            {/* FOOTER */}
            <div className="mt-5 pt-2 text-center">

              <div
                style={{
                  fontSize: "0.82rem",
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  color: "#8c8c8c",
                  fontWeight: "600",
                }}
              >
                Think Fast • Decide Smart • Lead Boldly
              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
