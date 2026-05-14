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

  const question = questions[currentIndex]

  useEffect(() => {
    if (question && !loading && !feedbackVisible) {
      const timeout = setTimeout(() => {
        speak(`${question.title}. ${question.scenario}`);
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, loading, feedbackVisible, question]);

  useEffect(() => {
    if (feedbackVisible && selectedOption) {
      if (selectedOption === correctOption) {
        speak("Correct!");
      } else {
        speak("Incorrect. The correct answer was " + correctOption);
      }
    }
  }, [feedbackVisible, selectedOption, correctOption]);

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
      style={{ background: "#f4f4f4" }}
    >
      {/* BACKGROUND DECORATION */}
      <div
        className="position-absolute top-0 end-0 h-100 d-none d-lg-block opacity-10"
        style={{ width: "300px", zIndex: 0 }}
      >
        {[...Array(15)].map((_, i) => (
          <div key={i} style={{ position: "absolute", right: `${i * 25}px`, top: "-10%", width: "2px", height: "130%", background: "#ff4d3d", transform: "skewX(-22deg)" }} />
        ))}
      </div>

      <div className="container py-4 py-lg-5 d-flex flex-column justify-content-between min-vh-100 position-relative" style={{ zIndex: 2, maxWidth: '1400px' }}>
        
        {/* TOP ROW: Title & Timer */}
        <div>
          <div className="row align-items-center mb-4 mb-lg-5">
            <div className="col-lg-8">
              <div className="d-flex align-items-center gap-3 mb-4">
                <div className="px-4 py-2 rounded-pill bg-dark text-white fw-bold text-uppercase tracking-widest" style={{ fontSize: '0.75rem' }}>
                  Round {currentIndex + 1} / {questions.length}
                </div>
                <div style={{ width: "60px", height: "2px", background: "#ff4d3d" }} />
              </div>

              <motion.h2
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-3"
                style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)", color: "#ff4d3d", letterSpacing: "-2px", fontWeight: "300", lineHeight: 1.1 }}
              >
                {question.title}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-0 text-secondary"
                style={{ fontSize: "clamp(1rem, 1.1vw, 1.2rem)", lineHeight: "1.7", maxWidth: "850px" }}
              >
                {question.scenario}
              </motion.p>
            </div>

            <div className="col-lg-4 d-flex justify-content-center justify-content-lg-end mt-4 mt-lg-0">
              <div className="position-relative d-flex align-items-center justify-content-center shadow-lg rounded-circle bg-white" style={{ width: "160px", height: "160px" }}>
                <svg width="160" height="160" viewBox="0 0 160 160" className="position-absolute">
                  <circle cx="80" cy="80" r="72" fill="none" stroke="#eee" strokeWidth="6" />
                  <circle cx="80" cy="80" r="72" fill="none" stroke="#ff4d3d" strokeWidth="6" strokeLinecap="round" strokeDasharray="452" strokeDashoffset={452 - (452 * timeLeft) / 60} transform="rotate(-90 80 80)" style={{ transition: "stroke-dashoffset 1s linear" }} />
                </svg>
                <div className="text-center">
                  <div style={{ fontSize: "3rem", fontWeight: "800", color: "#ff4d3d", lineHeight: 1 }}>{timeLeft}</div>
                  <div className="text-uppercase tracking-widest text-muted mt-1" style={{ fontSize: "0.6rem", fontWeight: "700" }}>Secs</div>
                </div>
              </div>
            </div>
          </div>

          <div className="progress mb-5" style={{ height: '6px', borderRadius: '10px', background: '#e0e0e0' }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} className="progress-bar bg-danger" style={{ borderRadius: '10px' }} />
          </div>
        </div>

        {/* MIDDLE ROW: Options */}
        <div className="row g-4 mb-auto">
          <AnimatePresence mode="wait">
            <motion.div key={currentIndex} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="row g-3 g-lg-4 m-0 p-0">
              {question.options.map((option, idx) => (
                <div className="col-12 col-md-6" key={option.id || idx}>
                  <motion.button
                    whileHover={{ y: -5, scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={submitting || feedbackVisible}
                    onClick={() => { setSelectedOption(option.option_key); handleSubmit(option.option_key); }}
                    className={`w-100 h-100 text-start border-0 p-4 rounded-4 shadow-sm transition-all position-relative overflow-hidden ${getOptionClass(option.option_key)}`}
                    style={{
                      minHeight: '140px',
                      background: selectedOption === option.option_key ? '#2b2b2b' : '#fff',
                      color: selectedOption === option.option_key ? '#fff' : '#2b2b2b',
                      border: selectedOption === option.option_key ? '2px solid #ff4d3d' : '2px solid transparent'
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: '40px', height: '40px', background: selectedOption === option.option_key ? '#ff4d3d' : '#f0f0f0', color: selectedOption === option.option_key ? '#fff' : '#2b2b2b' }}>
                        {option.option_key}
                      </div>
                      {feedbackVisible && option.option_key === correctOption && <span className="badge bg-success rounded-pill px-3 py-2">CORRECT</span>}
                      {feedbackVisible && option.option_key === selectedOption && option.option_key !== correctOption && <span className="badge bg-danger rounded-pill px-3 py-2">WRONG</span>}
                    </div>
                    <div className="h5 mb-0 fw-500">{option.option_text}</div>
                  </motion.button>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* BOTTOM ROW: Footer */}
        <div className="text-center pt-4 opacity-50">
          <div className="text-uppercase tracking-widest small fw-bold">Think Fast • Decide Smart • Lead Boldly</div>
        </div>
      </div>
    </div>
  )
}
