import { motion } from 'framer-motion'

export default function ProgressBar({ current, total }) {
  const progress = (current / total) * 100
  return (
    <div className="progress rounded-pill" style={{ height: '8px' }}>
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.5 }}
        className="progress-bar bg-dark"
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin="0"
        aria-valuemax="100"
      />
    </div>
  )
}
