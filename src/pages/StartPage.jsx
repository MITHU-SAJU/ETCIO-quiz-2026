import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase, callFunction } from '../lib/supabase'
import { toast } from 'react-hot-toast'

export default function StartPage() {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [eventData, setEventData] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    designation: '',
    email: ''
  })

  useEffect(() => {
    async function fetchEvent() {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('event_code', eventId)
        .eq('is_active', true)
        .single()

      if (error || !data) {
        toast.error('Event not found or inactive')
        return
      }
      setEventData(data)
    }
    if (eventId) fetchEvent()
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
        navigate(`/game/${result.sessionId}`)
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
    <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light p-3">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card card-enterprise shadow-lg p-4 p-md-5"
        style={{ maxWidth: '500px', width: '100%' }}
      >
        <div className="text-center mb-4">
          <h1 className="fw-black display-6 mb-1">
            60-Second <span className="text-primary">CIO</span> Challenge
          </h1>
          <p className="text-muted small text-uppercase fw-bold tracking-wider">
            {eventData?.title || 'CIO CHALLENGE'}
          </p>
          <hr className="w-25 mx-auto border-dark border-2 opacity-100" />
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-bold text-secondary small uppercase">Full Name *</label>
            <input
              required
              type="text"
              placeholder="Enter your name"
              className="form-control form-control-lg border-2 rounded-3 shadow-none"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold text-secondary small uppercase">Company *</label>
            <input
              required
              type="text"
              placeholder="Company name"
              className="form-control form-control-lg border-2 rounded-3 shadow-none"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold text-secondary small uppercase">Designation *</label>
            <input
              required
              type="text"
              placeholder="Your job title"
              className="form-control form-control-lg border-2 rounded-3 shadow-none"
              value={formData.designation}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
            />
          </div>

          <div className="mb-4">
            <label className="form-label fw-bold text-secondary small uppercase">Email (Optional)</label>
            <input
              type="email"
              placeholder="email@example.com"
              className="form-control form-control-lg border-2 rounded-3 shadow-none"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <button
            disabled={loading}
            type="submit"
            className="btn btn-enterprise w-100 py-3 shadow"
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            ) : null}
            {loading ? 'Initializing...' : 'START CHALLENGE'}
          </button>
        </form>

        <p className="mt-4 text-center text-muted x-small opacity-50">
          Powered by ETCIO & Enterprise Leaders Network
        </p>
      </motion.div>
    </div>
  )
}
