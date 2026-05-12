import { motion } from 'framer-motion'

export default function Leaderboard({ players, currentUserId, darkMode = false }) {
  if (players.length === 0) {
    return <div className="p-10 text-center text-gray-400">No completed players yet.</div>
  }

  return (
    <div className={`table-responsive ${darkMode ? 'text-white' : 'text-dark'}`}>
      <table className={`table table-hover mb-0 ${darkMode ? 'table-dark' : 'table-light'}`}>
        <thead className="small text-uppercase text-secondary opacity-75">
          <tr>
            <th className="px-4 py-3 border-0">Rank</th>
            <th className="px-4 py-3 border-0">Leader</th>
            <th className="px-4 py-3 border-0 text-end">Score</th>
          </tr>
        </thead>
        <tbody className="border-0">
          {players.map((player, index) => (
            <motion.tr 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              key={player.user_id} 
              className={player.user_id === currentUserId ? 'table-primary' : ''}
              style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}
            >
              <td className="px-4 py-4 align-middle fw-bold fs-5">#{index + 1}</td>
              <td className="px-4 py-4 align-middle">
                <div className="fw-bold">{player.name}</div>
                <div className={`small text-uppercase fw-semibold opacity-50`}>{player.company}</div>
              </td>
              <td className="px-4 py-4 align-middle text-end fw-black fs-4">{player.total_score}</td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
