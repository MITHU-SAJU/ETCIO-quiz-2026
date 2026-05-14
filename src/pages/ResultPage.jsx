import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { callFunction } from "../lib/supabase";
import { toast } from "react-hot-toast";

export default function ResultPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [countdown, setCountdown] = useState(5);

  // 1. Timer Logic
  useEffect(() => {
    if (data && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [data, countdown]);

  // 2. Navigation Logic (Safe side-effect)
  useEffect(() => {
    if (countdown === 0 && data) {
      const eventId = data.eventCode || "etcio2026";
      navigate(`/start/${eventId}`);
    }
  }, [countdown, data, navigate]);

  // Fetch Results
  useEffect(() => {
    async function fetchResult() {
      try {
        const result = await callFunction("get-result", { sessionId });
        setData(result);
      } catch (error) {
        toast.error("Failed to load result");
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchResult();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-white">
        <div className="text-center">
          <div className="spinner-border text-danger mb-3" role="status" style={{ width: '3rem', height: '3rem' }}></div>
          <div className="h5 fw-bold text-uppercase tracking-widest">Calculating Score...</div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center text-danger">
        <div className="text-center">
          <div className="h4 fw-bold">Result not found.</div>
          <button onClick={() => navigate('/')} className="btn btn-outline-danger mt-3 rounded-pill">Return to Home</button>
        </div>
      </div>
    );
  }

  const { user, result } = data;

  return (
    <div className="result-page min-vh-100 position-relative overflow-hidden d-flex align-items-center py-4 py-lg-5">

      {/* CONFETTI */}
      <div className="confetti-container">
        {[...Array(60)].map((_, i) => (
          <div
            key={i}
            className="confetti"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `-${Math.random() * 5}s`,
              animationDuration: `${4 + Math.random() * 5}s`,
              width: `${6 + Math.random() * 10}px`,
              height: `${10 + Math.random() * 18}px`,
            }}
          />
        ))}
      </div>

      {/* BACKGROUND LINES */}
      <div className="kyndryl-lines d-none d-xl-block">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="line"
            style={{
              right: `${i * 24}px`,
            }}
          />
        ))}
      </div>

      <div className="container py-3 position-relative z-2" style={{ maxWidth: '1400px' }}>

        <div className="row g-4 align-items-stretch justify-content-center">

          {/* LEFT: Hurray & Score */}
          <div className="col-12 col-lg-5 col-xl-5">

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="result-left-card h-100 d-flex flex-column justify-content-between"
            >
              <div>
                <div className="result-tag">Challenge Completed</div>
                <motion.h1
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="hurray-text"
                >
                  HURRAY!
                </motion.h1>
                <h2 className="result-title">You've Finished</h2>
              </div>

              <div className="user-block my-4">
                <div className="user-name h3 fw-bold mb-1">{user.name}</div>
                <div className="user-info text-secondary">{user.designation} • {user.company}</div>
              </div>

              <div className="score-area text-center my-4">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
                  className="score-circle mx-auto"
                >
                  <div className="score-inner">
                    <div className="score-value">{result.totalScore}</div>
                    <div className="score-label">POINTS</div>
                  </div>
                </motion.div>
              </div>
              
              <div className="mt-4 text-center">
                <div 
                  className="py-2 px-4 rounded-pill d-inline-flex align-items-center gap-3 shadow-sm"
                  style={{ background: '#fff', border: '1px solid rgba(255,77,61,0.2)' }}
                >
                  <div className="spinner-border spinner-border-sm text-danger" role="status"></div>
                  <span className="small fw-bold text-uppercase tracking-wider text-danger" style={{ fontSize: '0.75rem' }}>
                    Next Player in {countdown}s
                  </span>
                </div>
              </div>

            </motion.div>

          </div>

          {/* RIGHT: Performance Stats */}
          <div className="col-12 col-lg-7 col-xl-6">

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="result-right-card h-100 d-flex flex-column"
            >
              <div className="d-flex align-items-center justify-content-between mb-5">
                <div>
                  <div className="leaderboard-tag">ANALYTICS</div>
                  <h2 className="leaderboard-title h1 fw-bold mb-0">Performance</h2>
                </div>
                <div className="trophy-box">🏆</div>
              </div>

              <div className="row g-4 mb-5">
                <div className="col-12 col-sm-6">
                  <div className="stat-card dark-card h-100">
                    <div className="stat-label">Current Rank</div>
                    <div className="stat-value">#{result.rank}</div>
                    <div className="stat-sub">Across all leaders</div>
                  </div>
                </div>
                <div className="col-12 col-sm-6">
                  <div className="stat-card h-100 border-2">
                    <div className="stat-label text-secondary">Time Taken</div>
                    <div className="stat-value text-danger">{Math.round(result.totalResponseTime)}s</div>
                    <div className="stat-sub">Response speed</div>
                  </div>
                </div>
              </div>

              <div className="leaderboard-message flex-grow-1 d-flex flex-column justify-content-center text-center p-4 rounded-4 bg-dark text-white position-relative overflow-hidden">
                <div className="message-icon h1 mb-3">✨</div>
                <h3 className="h4 fw-bold mb-3">Leadership Insight</h3>
                <p className="opacity-75 mb-0">Your decisions demonstrate high-impact leadership. Check the live leaderboard to see how you compare with other CIOs.</p>
              </div>
            </motion.div>

          </div>

        </div>

      </div>

      <style>{`
      .result-page { background: #f8f9fa; }
      .kyndryl-lines { position: absolute; inset: 0; opacity: 0.08; z-index: 0; }
      .line { position: absolute; top: -10%; width: 2px; height: 130%; background: #ff4d3d; transform: skewX(-22deg); }
      .confetti-container { position: absolute; inset: 0; overflow: hidden; pointer-events: none; z-index: 1; }
      .confetti { position: absolute; top: -60px; background: linear-gradient(135deg, #ff4d3d, #ff8a5e); border-radius: 3px; animation: fall linear infinite; opacity: 0.9; }
      @keyframes fall { to { transform: translateY(110vh) rotate(720deg); } }
      
      .result-left-card, .result-right-card {
        background: rgba(255,255,255,0.95);
        backdrop-filter: blur(10px);
        border-radius: 40px;
        padding: 50px;
        box-shadow: 0 25px 70px rgba(0,0,0,0.07);
        border: 1px solid rgba(0,0,0,0.03);
      }

      .result-tag, .leaderboard-tag { font-size: 0.8rem; font-weight: 800; letter-spacing: 3px; color: #ff4d3d; margin-bottom: 15px; text-transform: uppercase; }
      .hurray-text { font-size: clamp(3rem, 8vw, 6rem); font-weight: 900; letter-spacing: -3px; line-height: 0.9; color: #222; }
      .result-title { font-size: 2rem; color: #666; font-weight: 300; letter-spacing: -1px; }

      .score-circle {
        width: 240px;
        height: 240px;
        border-radius: 50%;
        background: linear-gradient(135deg, #ff4d3d 0%, #ff1a1a 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        box-shadow: 0 20px 50px rgba(255,77,61,0.3);
      }
      .score-value { font-size: 6rem; font-weight: 900; line-height: 1; letter-spacing: -5px; }
      .score-label { font-size: 0.8rem; font-weight: 700; letter-spacing: 4px; }

      .dark-card { background: #222; color: white; border: none; padding: 35px; border-radius: 30px; }
      .stat-card { padding: 35px; border-radius: 30px; border: 2px solid #eee; }
      .stat-label { font-size: 0.75rem; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 10px; }
      .stat-value { font-size: 4rem; font-weight: 900; line-height: 1; letter-spacing: -2px; }
      .stat-sub { font-size: 0.9rem; opacity: 0.6; margin-top: 5px; }

      .trophy-box { font-size: 3.5rem; background: #fff5f4; width: 100px; height: 100px; display: flex; align-items: center; justify-content: center; border-radius: 25px; border: 1px solid #ffebea; }

      @media (max-width: 991px) {
        .result-left-card, .result-right-card { padding: 35px; border-radius: 30px; }
        .score-circle { width: 180px; height: 180px; }
        .score-value { font-size: 4.5rem; }
      }
      `}</style>
    </div>
  );
}
