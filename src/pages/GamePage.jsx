import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { callFunction } from '../lib/supabase'
import { toast } from 'react-hot-toast'
import ProgressBar from '../components/ProgressBar'

export default function GamePage() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [question, setQuestion] = useState(null)
  const [timeLeft, setTimeLeft] = useState(60)
  const [selectedOption, setSelectedOption] = useState(null)
  const [error, setError] = useState(null)
  const timerRef = useRef(null)

  const fetchQuestion = async () => {
    setLoading(true)
    try {
      const data = await callFunction('get-current-question', { sessionId })
      if (data.completed) {
        navigate(`/result/${sessionId}`)
        return
      }
      setQuestion(data)
      setTimeLeft(data.timeLimit || 60)
      setSelectedOption(null)
      setSubmitting(false) // Reset submitting state for new question
      startTimer()
    } catch (error) {
      setError(error.message)
      toast.error('Failed to load question')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const startTimer = () => {
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

  const handleSubmit = async (optionKey, forceTime) => {
    if (submitting) return
    setSubmitting(true)
    if (timerRef.current) clearInterval(timerRef.current)

    const finalOption = optionKey || selectedOption
    const responseTime = forceTime || (60 - timeLeft)

    try {
      const result = await callFunction('submit-answer', {
        sessionId,
        questionId: question.id,
        selectedOption: finalOption,
        responseTime: responseTime
      })

      if (result.redirectToResult) {
        navigate(`/result/${sessionId}`)
      } else {
        fetchQuestion()
      }
    } catch (error) {
      toast.error('Submission failed')
      console.error(error)
      setSubmitting(false)
    }
  }

  useEffect(() => {
    fetchQuestion()
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [sessionId])

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100">
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
          <h2 className="h4 fw-bold text-danger mb-3">Error Loading Question</h2>
          <p className="text-muted mb-4 small">{error || 'Could not fetch game data. Please check your connection or deploy the functions.'}</p>
          <button 
            onClick={fetchQuestion}
            className="btn btn-enterprise w-100 py-3"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const progress = (question.questionNumber / question.totalQuestions) * 100

  return (
    <div className="bg-light min-vh-100 py-4 py-md-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-8">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h2 className="h6 text-muted fw-bold text-uppercase mb-1">
                  Round {question.questionNumber} of {question.totalQuestions}
                </h2>
                <p className="fw-bold text-dark mb-0">{question.category}</p>
              </div>
              <div 
                className={`rounded-circle border border-4 d-flex align-items-center justify-content-center fw-bold fs-4 ${timeLeft < 10 ? 'border-danger text-danger' : 'border-dark'}`}
                style={{ width: '60px', height: '60px' }}
              >
                {timeLeft}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <ProgressBar current={question.questionNumber} total={question.totalQuestions} />
            </div>

            {/* Question Card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={question.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="card card-enterprise p-4 p-md-5 mb-4"
              >
                <h1 className="h3 fw-bold mb-3 text-dark">
                  {question.title}
                </h1>
                <p className="lead text-muted mb-4 fs-5">
                  {question.scenario}
                </p>

                <div className="d-grid gap-3">
                  {question.options.map((option) => (
                    <button
                      key={option.option_key}
                      disabled={submitting}
                      onClick={() => {
                        setSelectedOption(option.option_key)
                        handleSubmit(option.option_key)
                      }}
                      className={`btn btn-lg text-start p-3 d-flex align-items-center transition-all border-2 rounded-4 ${
                        selectedOption === option.option_key 
                          ? 'btn-dark' 
                          : 'btn-outline-secondary border-light-subtle bg-white'
                      }`}
                      style={{ fontSize: '1rem', fontWeight: '500' }}
                    >
                      <span 
                        className={`badge rounded-3 me-3 d-flex align-items-center justify-content-center ${selectedOption === option.option_key ? 'bg-light text-dark' : 'bg-dark text-white'}`}
                        style={{ width: '32px', height: '32px', fontSize: '0.9rem' }}
                      >
                        {option.option_key}
                      </span>
                      {option.option_text}
                    </button>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="text-center text-muted small opacity-50">
              Decision required immediately. Think like a CIO.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
