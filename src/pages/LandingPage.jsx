import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Html5Qrcode } from 'html5-qrcode'
import { createWorker } from 'tesseract.js'
import { supabase, callFunction } from '../lib/supabase'
import { toast } from 'react-hot-toast'
import KyndrylLogo from '../assets/Kyndryl.png'
import { Camera, RefreshCw, UserPlus, Zap, ScanText } from 'lucide-react'

export default function LandingPage() {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [cameraError, setCameraError] = useState(null)
  const [isInitializing, setIsInitializing] = useState(true)
  const [ocrStatus, setOcrStatus] = useState('')
  const scannerRef = useRef(null)
  const workerRef = useRef(null)
  const ocrTimerRef = useRef(null)
  const isProcessingRef = useRef(false)

  useEffect(() => {
    initOCR()
    startScanner()

    return () => {
      stopScanner()
      if (ocrTimerRef.current) clearInterval(ocrTimerRef.current)
      if (workerRef.current) workerRef.current.terminate()
    }
  }, [])

  const initOCR = async () => {
    try {
      const worker = await createWorker('eng')
      workerRef.current = worker
      console.log("OCR Worker initialized")
    } catch (err) {
      console.error("OCR Init Error:", err)
    }
  }

  const startScanner = async () => {
    setIsInitializing(true)
    setCameraError(null)
    
    setTimeout(async () => {
      try {
        const html5QrCode = new Html5Qrcode("reader")
        scannerRef.current = html5QrCode

        const config = { 
          fps: 15, 
          qrbox: { width: 280, height: 280 },
          aspectRatio: 1.0
        }

        await html5QrCode.start(
          { facingMode: "environment" },
          config,
          onScanSuccess
        )
        
        setIsInitializing(false)
        startOCRPolling()
      } catch (err) {
        console.error("Camera start error:", err)
        setCameraError(err.message || "Could not access camera")
        setIsInitializing(false)
      }
    }, 500)
  }

  const startOCRPolling = () => {
    if (ocrTimerRef.current) clearInterval(ocrTimerRef.current)
    
    ocrTimerRef.current = setInterval(async () => {
      if (isProcessingRef.current || !workerRef.current) return
      
      const video = document.querySelector('#reader video')
      if (!video || video.readyState !== 4) return

      isProcessingRef.current = true
      setOcrStatus('Scanning text...')

      try {
        // Create a canvas to capture the frame
        const canvas = document.createElement('canvas')
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const ctx = canvas.getContext('2d')
        ctx.drawImage(video, 0, 0)

        // Run OCR on the captured frame
        const { data: { text } } = await workerRef.current.recognize(canvas)
        console.log("OCR Result:", text)

        if (text && text.trim().length > 3) {
          await processOCRText(text)
        }
      } catch (err) {
        console.error("OCR Processing Error:", err)
      } finally {
        isProcessingRef.current = false
        setOcrStatus('')
      }
    }, 3000) // Poll every 3 seconds to avoid CPU hogging
  }

  const processOCRText = async (rawText) => {
    // Clean up text: split into lines, filter short/irrelevant bits
    const lines = rawText.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 3 && !['DEVELOPER', 'BLOOD', 'GROUP', 'EMP ID'].some(k => line.toUpperCase().includes(k)))

    for (const line of lines) {
      // Look for the name in the database
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .ilike('name', `%${line}%`)
        .maybeSingle()

      if (user) {
        console.log("User found via OCR:", user.name)
        onScanSuccess(JSON.stringify(user)) // Mock a successful scan
        return true
      }
    }
    return false
  }

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop()
        scannerRef.current = null
      } catch (err) {
        console.error("Failed to stop scanner", err)
      }
    }
  }

  const onScanSuccess = async (decodedText) => {
    if (loading) return // Prevent duplicate processing
    
    await stopScanner()
    if (ocrTimerRef.current) clearInterval(ocrTimerRef.current)
    setLoading(true)

    try {
      let userData = {}
      let searchField = 'email'
      let searchValue = ''

      try {
        userData = JSON.parse(decodedText)
        if (userData.email) {
          searchValue = userData.email
          searchField = 'email'
        } else if (userData.name) {
          searchValue = userData.name
          searchField = 'name'
        }
      } catch (e) {
        const text = decodedText.trim()
        if (text.includes('@')) {
          userData = { email: text }
          searchValue = text
          searchField = 'email'
        } else if (text.length > 2) {
          userData = { name: text }
          searchValue = text
          searchField = 'name'
        } else {
          throw new Error('Invalid ID card format.')
        }
      }

      if (!searchValue) throw new Error('No valid identification found.')

      let query = supabase.from('users').select('*')
      if (searchField === 'email') {
        query = query.eq('email', searchValue)
      } else {
        query = query.ilike('name', searchValue)
      }

      const { data: user, error } = await query.maybeSingle()

      if (user) {
        const result = await callFunction('create-session', {
          eventCode: eventId,
          name: user.name,
          company: user.company,
          designation: user.designation,
          email: user.email
        })

        if (result.sessionId) {
          toast.success(`Welcome, ${user.name}!`)
          navigate(`/game/${result.sessionId}`, {
            state: { questions: result.questions }
          })
        }
      } else {
        toast.success('Badge scanned! Please complete registration.')
        navigate(`/register/${eventId}`, { state: { prefill: userData } })
      }

    } catch (error) {
      console.error(error)
      toast.error(error.message || 'Failed to process ID card')
      startScanner()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center bg-white p-4 overflow-hidden position-relative">
      
      {/* Dynamic Background Element */}
      <div 
        className="position-absolute top-0 end-0 opacity-10 d-none d-lg-block"
        style={{ transform: 'translate(30%, -30%)', zIndex: 0 }}
      >
        <Zap size={600} color="#ff4d3d" strokeWidth={0.5} />
      </div>

      {/* Logo Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 position-relative"
        style={{ zIndex: 1 }}
      >
        <img src={KyndrylLogo} alt="Kyndryl" style={{ width: '160px' }} />
      </motion.div>

      {/* Hero Section */}
      <div className="text-center mb-4 position-relative" style={{ maxWidth: '600px', zIndex: 1 }}>
        <motion.h1 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="display-5 fw-black mb-2"
          style={{ 
            color: '#1a1a1a', 
            letterSpacing: '-1.5px',
            textTransform: 'uppercase'
          }}
        >
          60-Second <span style={{ color: '#ff4d3d' }}>Challenge</span>
        </motion.h1>
        <p className="text-muted fs-6 mb-0">
          Position your event badge within the frame to start
        </p>
      </div>

      {/* Scanner Container */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="position-relative mb-4"
        style={{ zIndex: 1 }}
      >
        <div 
          className="rounded-5 overflow-hidden shadow-2xl border border-5 border-white bg-dark position-relative"
          style={{ 
            width: '320px', 
            height: '320px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}
        >
          {/* Scanner Viewport */}
          <div id="reader" style={{ width: '100%', height: '100%', objectFit: 'cover' }}></div>
          
          {/* OCR Status Badge */}
          <AnimatePresence>
            {ocrStatus && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="position-absolute bottom-0 start-50 translate-middle-x mb-4 px-3 py-2 bg-danger text-white rounded-pill d-flex align-items-center gap-2 shadow-lg"
                style={{ zIndex: 20, whiteSpace: 'nowrap' }}
              >
                <ScanText size={14} className="animate-pulse" />
                <span className="small fw-bold tracking-widest text-uppercase" style={{ fontSize: '10px' }}>
                  Reading Card...
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading / Initializing Overlay */}
          <AnimatePresence>
            {(isInitializing || loading) && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="position-absolute top-0 start-0 w-100 height-100 d-flex align-items-center justify-content-center bg-dark text-white flex-column"
                style={{ zIndex: 10, height: '100%' }}
              >
                <div className="spinner-border text-danger mb-3" role="status"></div>
                <span className="small text-uppercase tracking-widest fw-bold">
                  {loading ? 'Processing Badge...' : 'Initializing Camera...'}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Camera Error Overlay */}
          {cameraError && (
            <div className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center bg-dark text-white p-4 text-center" style={{ zIndex: 11 }}>
              <Camera size={48} className="mb-3 text-danger opacity-50" />
              <p className="small mb-3 text-white-50">{cameraError}</p>
              <button 
                onClick={startScanner}
                className="btn btn-outline-light btn-sm rounded-pill px-4"
              >
                <RefreshCw size={14} className="me-2" /> Retry
              </button>
            </div>
          )}

          {/* Scanning Animation Frame */}
          {!isInitializing && !cameraError && !loading && (
            <>
              <div className="position-absolute top-0 start-0 w-100 h-100" style={{ pointerEvents: 'none', zIndex: 5 }}>
                {/* Corner Brackets */}
                <div className="position-absolute top-0 start-0 border-top border-start border-danger border-4" style={{ width: '40px', height: '40px', margin: '20px' }}></div>
                <div className="position-absolute top-0 end-0 border-top border-end border-danger border-4" style={{ width: '40px', height: '40px', margin: '20px' }}></div>
                <div className="position-absolute bottom-0 start-0 border-bottom border-start border-danger border-4" style={{ width: '40px', height: '40px', margin: '20px' }}></div>
                <div className="position-absolute bottom-0 end-0 border-bottom border-end border-danger border-4" style={{ width: '40px', height: '40px', margin: '20px' }}></div>
                
                {/* Scanning Line */}
                <motion.div 
                  animate={{ top: ['10%', '90%', '10%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="position-absolute start-0 w-100"
                  style={{ 
                    height: '2px', 
                    background: 'linear-gradient(90deg, transparent, #ff4d3d, transparent)',
                    boxShadow: '0 0 15px #ff4d3d',
                    zIndex: 6
                  }}
                />
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* Manual Action Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center position-relative"
        style={{ zIndex: 1 }}
      >
        <button 
          onClick={() => navigate(`/register/${eventId}`)}
          className="btn btn-link text-dark text-decoration-none fw-bold d-flex align-items-center justify-content-center"
          style={{ gap: '8px', opacity: 0.8 }}
        >
          <UserPlus size={18} />
          <span>No badge? Register manually</span>
        </button>
      </motion.div>

      {/* Footer Branding */}
      <div className="mt-auto py-4 position-relative" style={{ zIndex: 1 }}>
        <p className="text-uppercase small fw-bold text-muted mb-0" style={{ letterSpacing: '2px' }}>
          Powered by <span className="text-dark">ETCIO</span>
        </p>
      </div>

      {/* Decorative Background Text */}
      <div className="position-fixed bottom-0 start-0 p-4 opacity-10 d-none d-lg-block" style={{ zIndex: 0 }}>
        <h2 className="fw-black text-uppercase m-0" style={{ fontSize: '12rem', lineHeight: '0.8', letterSpacing: '-12px', color: '#000' }}>CIO</h2>
      </div>

      <style>{`
        #reader video {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
        }
        #reader img {
          display: none !important;
        }
        #reader__dashboard_section_csr button {
          display: none !important;
        }
        #reader__status_span {
          display: none !important;
        }
        .fw-black {
          font-weight: 900;
        }
        .shadow-2xl {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
        .tracking-widest {
          letter-spacing: 0.2em;
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
      `}</style>
    </div>
  )
}
