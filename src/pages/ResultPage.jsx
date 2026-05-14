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
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-danger mb-3" role="status"></div>
          <div className="h5 fw-bold">Loading Results...</div>
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
    <div className="result-page min-vh-100 position-relative overflow-hidden py-4 py-lg-5">

      {/* CONFETTI */}
      <div className="confetti-container">
        {[...Array(80)].map((_, i) => (
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
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="line"
            style={{
              right: `${i * 24}px`,
            }}
          />
        ))}
      </div>

      <div className="container-fluid px-3 px-lg-5 position-relative z-2">

        <div className="row g-4 align-items-stretch">

          {/* LEFT */}
          <div className="col-12 col-xl-5">

            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="result-left-card h-100"
            >

              <div className="result-tag">
                Challenge Completed
              </div>

              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="hurray-text"
              >
                HURRAY!
              </motion.h1>

              <h2 className="result-title">
                You Finished The Challenge
              </h2>

              <div className="user-block">
                <div className="user-name">{user.name}</div>

                <div className="user-info">
                  {user.designation} • {user.company}
                </div>
              </div>

              {/* SCORE */}
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 120,
                  delay: 0.3,
                }}
                className="score-circle mx-auto"
              >

                <motion.div
                  animate={{
                    rotate: [0, 4, -4, 0],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 3,
                  }}
                  className="score-inner"
                >

                  <div className="score-value">
                    {result.totalScore}
                  </div>

                  <div className="score-label">
                    TOTAL SCORE
                  </div>

                </motion.div>

              </motion.div>

              {/* REDIRECT BADGE */}
              <div className="mt-5 text-center">
                <div 
                  className="py-2 px-4 rounded-pill d-inline-flex align-items-center gap-3"
                  style={{ 
                    background: 'rgba(255,77,61,0.08)', 
                    border: '1px solid rgba(255,77,61,0.2)',
                    backdropFilter: 'blur(5px)'
                  }}
                >
                  <div className="spinner-border spinner-border-sm text-danger" role="status" style={{ width: '1rem', height: '1rem' }}></div>
                  <span className="small fw-bold text-uppercase tracking-wider" style={{ color: '#ff4d3d', fontSize: '0.7rem' }}>
                    Next Player in {countdown}s
                  </span>
                </div>
              </div>

            </motion.div>

          </div>

          {/* RIGHT */}
          <div className="col-12 col-xl-7">

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.5,
                delay: 0.2,
              }}
              className="result-right-card h-100 d-flex flex-column"
            >

              {/* HEADER */}
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">

                <div>
                  <div className="leaderboard-tag">
                    PERFORMANCE ANALYTICS
                  </div>

                  <h2 className="leaderboard-title">
                    Your Performance
                  </h2>
                </div>

                <motion.div
                  animate={{
                    y: [0, -8, 0],
                    rotate: [0, 8, -8, 0],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2.5,
                  }}
                  className="trophy-box"
                >
                  🏆
                </motion.div>

              </div>

              {/* STATS */}
              <div className="row g-4 mb-4">

                <div className="col-12 col-md-6">

                  <motion.div
                    whileHover={{
                      y: -6,
                      scale: 1.02,
                    }}
                    className="stat-card dark-card"
                  >

                    <div className="stat-label">
                      Current Rank
                    </div>

                    <div className="stat-value light">
                      #{result.rank}
                    </div>

                    <div className="stat-sub">
                      Among all participants
                    </div>

                  </motion.div>

                </div>

                <div className="col-12 col-md-6">

                  <motion.div
                    whileHover={{
                      y: -6,
                      scale: 1.02,
                    }}
                    className="stat-card"
                  >

                    <div className="stat-label">
                      Time Used
                    </div>

                    <div className="stat-value orange">
                      {Math.round(result.totalResponseTime)}s
                    </div>

                    <div className="stat-sub">
                      Average response time
                    </div>

                  </motion.div>

                </div>

              </div>

              {/* MESSAGE */}
              <div className="leaderboard-message flex-grow-1 d-flex flex-column justify-content-center">

                <div className="message-icon">
                  ✨
                </div>

                <h3>
                  Premium Leadership Experience
                </h3>

                <p>
                  Your decisions shaped the outcome. Compare your score with
                  other leaders and discover where you stand in the live
                  rankings.
                </p>

              </div>



            </motion.div>

          </div>

        </div>

      </div>

      <style>{`
      
      .result-page {
        background: #f6f6f6;
      }

      /* BACKGROUND LINES */
      .kyndryl-lines {
        position: absolute;
        inset: 0;
        opacity: 0.08;
        z-index: 0;
      }

      .line {
        position: absolute;
        top: -10%;
        width: 2px;
        height: 130%;
        background: #ff4d3d;
        transform: skewX(-22deg);
      }

      /* CONFETTI */
      .confetti-container {
        position: absolute;
        inset: 0;
        overflow: hidden;
        pointer-events: none;
        z-index: 1;
      }

      .confetti {
        position: absolute;
        top: -60px;
        background: linear-gradient(
          135deg,
          #ff4d3d,
          #ff8a5e
        );
        border-radius: 3px;
        animation: fall linear infinite;
        opacity: 0.9;
      }

      @keyframes fall {
        to {
          transform: translateY(110vh) rotate(720deg);
        }
      }

      /* LEFT CARD */
      .result-left-card {
        background: rgba(255,255,255,0.92);

        backdrop-filter: blur(12px);

        border-radius: 34px;

        padding: 42px;

        border: 1px solid rgba(255,77,61,0.08);

        box-shadow:
          0 20px 60px rgba(0,0,0,0.06),
          0 6px 18px rgba(255,77,61,0.08);

        animation: floatingCard 5s ease-in-out infinite;
      }

      @keyframes floatingCard {
        0% {
          transform: translateY(0px);
        }

        50% {
          transform: translateY(-6px);
        }

        100% {
          transform: translateY(0px);
        }
      }

      .result-tag {
        font-size: 0.78rem;
        font-weight: 700;
        letter-spacing: 3px;
        text-transform: uppercase;
        color: #999;
        margin-bottom: 18px;
      }

      .hurray-text {
        font-size: clamp(2.5rem, 7vw, 6rem);

        color: rgb(255, 77, 61);

        letter-spacing: -2px;

        font-weight: 300;

        line-height: 0.9;

        text-transform: uppercase;

        background: linear-gradient(
          135deg,
          #ff4d3d 0%,
          #ff6b57 45%,
          #ff9d84 100%
        );

        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;

        text-shadow:
          0 10px 30px rgba(255,77,61,0.15);
      }

      .result-title {
        font-size: clamp(1.8rem, 4vw, 3.2rem);

        font-weight: 700;

        color: #222;

        letter-spacing: -2px;

        line-height: 1.05;

        margin-top: 10px;

        margin-bottom: 35px;
      }

      .user-block {
        text-align: center;
        margin-bottom: 30px;
      }

      .user-name {
        font-size: 1.5rem;
        font-weight: 700;
        color: #222;
      }

      .user-info {
        color: #777;
        margin-top: 6px;
      }

      /* SCORE */
      .score-circle {
        width: 250px;
        height: 250px;

        border-radius: 50%;

        background: linear-gradient(
          135deg,
          #ff4d3d 0%,
          #ff6b57 45%,
          #ff9d84 100%
        );

        display: flex;
        align-items: center;
        justify-content: center;

        position: relative;

        box-shadow:
          0 25px 60px rgba(255,77,61,0.35),
          inset 0 4px 12px rgba(255,255,255,0.2);
      }

      .score-circle::after {
        content: '';

        position: absolute;

        inset: 12px;

        border-radius: 50%;

        border: 1px solid rgba(255,255,255,0.3);
      }

      .score-inner {
        text-align: center;
        color: white;
      }

      .score-value {
        font-size: 5rem;
        font-weight: 900;
        line-height: 1;
        letter-spacing: -5px;
      }

      .score-label {
        margin-top: 10px;

        font-size: 0.82rem;

        letter-spacing: 3px;

        font-weight: 700;

        text-transform: uppercase;
      }

      /* RIGHT CARD */
      .result-right-card {
        background: rgba(255,255,255,0.92);

        backdrop-filter: blur(12px);

        border-radius: 34px;

        padding: 42px;

        border: 1px solid rgba(255,77,61,0.08);

        box-shadow:
          0 20px 60px rgba(0,0,0,0.06),
          0 6px 18px rgba(255,77,61,0.08);
      }

      .leaderboard-tag {
        font-size: 0.78rem;

        font-weight: 700;

        letter-spacing: 3px;

        text-transform: uppercase;

        color: #999;
      }

      .leaderboard-title {
        font-size: clamp(2rem, 5vw, 4rem);

        font-weight: 800;

        color: #222;

        letter-spacing: -3px;

        line-height: 1;
      }

      .trophy-box {
        width: 90px;
        height: 90px;

        border-radius: 26px;

        background: linear-gradient(
          135deg,
          #ff4d3d,
          #ff8a5e
        );

        display: flex;
        align-items: center;
        justify-content: center;

        font-size: 3rem;

        box-shadow:
          0 15px 40px rgba(255,77,61,0.3);
      }

      /* STAT CARD */
      .stat-card {
        background: #fff;

        border-radius: 28px;

        padding: 30px;

        border: 2px solid rgba(255,77,61,0.12);

        transition: all 0.3s ease;
      }

      .dark-card {
        background: linear-gradient(
          145deg,
          #ff4d3d 0%,
          #ff6b57 45%,
          #ff8b73 100%
        );

        border: none;

        color: white;

        position: relative;

        overflow: hidden;

        box-shadow:
          0 20px 45px rgba(255,77,61,0.25);
      }

      .dark-card::before {
        content: '';

        position: absolute;

        top: -40%;
        right: -10%;

        width: 220px;
        height: 220px;

        border-radius: 50%;

        background: rgba(255,255,255,0.08);
      }

      .stat-label {
        font-size: 0.78rem;

        font-weight: 700;

        letter-spacing: 2px;

        text-transform: uppercase;

        color: #888;

        margin-bottom: 12px;
      }

      .dark-card .stat-label {
        color: rgba(255,255,255,0.75);
      }

      .stat-value {
        font-size: 3.8rem;

        font-weight: 800;

        letter-spacing: -3px;

        line-height: 1;
      }

      .stat-value.orange {
        color: #ff4d3d;
      }

      .stat-value.light {
        color: white;
      }

      .stat-sub {
        margin-top: 10px;


        font-size: 0.92rem;

        color: #888;
      }

      .dark-card .stat-sub {
        color: rgba(255,255,255,0.7);
      }

      /* MESSAGE */
      .leaderboard-message {
        background: linear-gradient(
          145deg,
          #1e1e1e,
          #292929
        );

        border-radius: 30px;

        padding: 40px;

        text-align: center;

        color: white;

        position: relative;

        overflow: hidden;

        border: 1px solid rgba(255,77,61,0.12);
      }

      .leaderboard-message::before {
        content: '';

        position: absolute;

        width: 300px;
        height: 300px;

        border-radius: 50%;

        background: rgba(255,255,255,0.05);

        filter: blur(60px);

        top: 50%;
        left: 50%;

        transform: translate(-50%, -50%);
      }

      .message-icon {
        font-size: 3.5rem;
        margin-bottom: 18px;
      }

      .leaderboard-message h3 {
        font-size: 2rem;
        font-weight: 700;
        margin-bottom: 16px;
      }

      .leaderboard-message p {
        color: rgba(255,255,255,0.78);
        line-height: 1.85;
        margin-bottom: 0;
      }

      /* RESPONSIVE */
      @media (max-width: 992px) {

        .result-left-card,
        .result-right-card {
          padding: 30px;
          border-radius: 28px;
        }

        .score-circle {
          width: 210px;
          height: 210px;
        }

        .score-value {
          font-size: 4rem;
        }
      }

      @media (max-width: 576px) {

        .result-left-card,
        .result-right-card {
          padding: 22px;
        }

        .score-circle {
          width: 180px;
          height: 180px;
        }

        .score-value {
          font-size: 3.4rem;
        }

        .leaderboard-message {
          padding: 28px;
        }

        .leaderboard-message h3 {
          font-size: 1.5rem;
        }
      }

      `}</style>

    </div>
  );
}
