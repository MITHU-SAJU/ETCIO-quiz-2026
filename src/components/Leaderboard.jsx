import { motion } from 'framer-motion'

export default function Leaderboard({
  players,
  currentUserId,
  darkMode = false
}) {

  if (players.length === 0) {
    return (
      <div className="p-5 text-center text-muted">
        No completed players yet.
      </div>
    )
  }

  return (
    <div className="w-100">

      {/* HEADER */}
      <div
        className={`row mx-0 py-3 border-bottom ${darkMode ? 'text-white' : 'text-dark'
          }`}
        style={{
          borderColor: "rgba(0,0,0,0.08)",
        }}
      >

        <div className="col-2 fw-bold text-uppercase small">
          Rank
        </div>

        <div className="col-7 fw-bold text-uppercase small">
          Leader
        </div>

        <div className="col-3 fw-bold text-uppercase small text-end">
          Score
        </div>

      </div>

      {/* ROWS */}
      <div>

        {players.map((player, index) => (

          <motion.div
            key={player.user_id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            className={`row mx-0 align-items-center py-3 ${player.user_id === currentUserId
                ? 'rounded-4'
                : ''
              }`}
            style={{
              background:
                player.user_id === currentUserId
                  ? 'rgba(255,77,61,0.08)'
                  : 'transparent',

              borderBottom: '1px solid rgba(0,0,0,0.05)',
              minHeight: '72px',
            }}
          >

            {/* RANK */}
            <div
              className="col-2 fw-bold"
              style={{
                fontSize: "1.2rem",
                color: index === 0 ? "#ff4d3d" : "#2b2b2b",
              }}
            >
              #{index + 1}
            </div>

            {/* PLAYER */}
            <div className="col-7 overflow-hidden">

              <div
                className="fw-bold text-truncate"
                style={{
                  fontSize: "1rem",
                  color: darkMode ? "#fff" : "#2b2b2b",
                }}
              >
                {player.name}
              </div>

              <div
                className="text-uppercase text-truncate"
                style={{
                  fontSize: "0.72rem",
                  letterSpacing: "1px",
                  color: "#8a8a8a",
                  fontWeight: "600",
                }}
              >
                {player.company}
              </div>

            </div>

            {/* SCORE */}
            <div
              className="col-3 text-end fw-bold"
              style={{
                fontSize: "1.8rem",
                color: "#ff4d3d",
                letterSpacing: "-1px",
              }}
            >
              {player.total_score}
            </div>

          </motion.div>

        ))}

      </div>

    </div>
  )
}