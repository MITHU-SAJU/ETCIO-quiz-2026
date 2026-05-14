import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, UserPlus } from "lucide-react";
import { callFunction } from "../lib/supabase";
import { toast } from "react-hot-toast";
import KyndrylLogo from "../assets/kyndryl.png";

export default function LandingPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [cameraReady, setCameraReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cameraError, setCameraError] = useState("");

  // =========================
  // START CAMERA
  // =========================
  const startCamera = useCallback(async () => {
    try {
      setCameraError("");
      setCameraReady(false);

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await new Promise((resolve) => {
          videoRef.current.onloadedmetadata = async () => {
            try {
              await videoRef.current.play();
              resolve();
            } catch (e) {
              console.error(e);
            }
          };
        });
      }
      setCameraReady(true);
    } catch (err) {
      console.error("CAMERA ERROR:", err);
      setCameraError(err.name === "NotAllowedError" ? "Camera permission denied" : "Unable to access camera");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  // =========================
  // CAPTURE IMAGE
  // =========================
  const captureImage = async () => {
    if (loading) return;

    try {
      setLoading(true);
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (!video || !canvas || video.videoWidth === 0) {
        throw new Error("Camera not ready");
      }

      const ctx = canvas.getContext("2d");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = canvas.toDataURL("image/jpeg", 0.9);

      if (!eventId) {
        throw new Error("Missing Event ID.");
      }

      console.log("SENDING TO BACKEND:", { eventId, imageLength: imageData.length });

      const result = await callFunction("scan-id-card", {
        imageBase64: imageData,
        eventId,
      });

      console.log("SCAN RESULT:", result);

      if (result?.error) {
        throw new Error(result.error);
      }

      if (result?.userFound && result?.user) {
        toast.success(`Welcome ${result.user.name}`);
        const session = await callFunction("create-session", {
          eventCode: eventId,
          name: result.user.name,
          company: result.user.company,
          designation: result.user.designation,
          email: result.user.email,
        });

        if (session?.sessionId) {
          stopCamera();
          navigate(`/game/${session.sessionId}`, {
            state: { questions: session.questions || [] },
          });
          return;
        }
        throw new Error("Session creation failed");
      }

      toast(result?.message || "User not found. Please register manually.");
      navigate(`/register/${eventId}`, {
        state: { prefill: { name: result?.extractedName || "" } },
      });
    } catch (err) {
      console.error("SCAN ERROR:", err);
      toast.error(err.message || "Scanning failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-vh-100 d-flex flex-column align-items-center justify-content-center position-relative overflow-hidden"
      style={{
        background: "radial-gradient(circle at 50% 50%, #ffffff 0%, #f0f0f0 100%)",
      }}
    >
      {/* BACKGROUND DECORATION */}
      <div
        className="position-absolute top-0 start-0 w-100 h-100 opacity-25"
        style={{
          backgroundImage: "radial-gradient(#ff4d3d 0.5px, transparent 0.5px)",
          backgroundSize: "30px 30px",
          pointerEvents: "none",
        }}
      />

      <div className="container py-4 position-relative" style={{ zIndex: 10, maxWidth: '1200px' }}>
        <div className="row justify-content-center text-center">
          <div className="col-12 col-md-10 col-lg-8 col-xl-7">

            {/* LOGO */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4"
            >
              <img
                src={KyndrylLogo}
                alt="Kyndryl"
                style={{ width: "180px", height: "auto" }}
              />
            </motion.div>

            {/* HEADER */}
            <div className="mb-4 mb-lg-5">
              <h1
                style={{
                  fontSize: "clamp(2.5rem, 6vw, 5.5rem)",
                  fontWeight: "800",
                  letterSpacing: "-2px",
                  color: "#222",
                  lineHeight: 1,
                  marginBottom: "1rem"
                }}
              >
                60-Second <span style={{ color: "#ff4d3d" }}>Challenge</span>
              </h1>
              <p className="text-secondary mx-auto" style={{ maxWidth: '500px', fontSize: '1.1rem' }}>
                Position your employee ID card inside the frame to begin.
              </p>
            </div>

            {/* CAMERA KIOSK */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mx-auto position-relative rounded-5 shadow-lg overflow-hidden border border-white border-4"
              style={{
                width: "100%",
                aspectRatio: "4/3",
                maxWidth: "580px",
                background: "#000",
                boxShadow: "0 40px 100px rgba(0,0,0,0.1)"
              }}
            >
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-100 h-100"
                style={{ objectFit: "cover" }}
              />

              {/* SCANNING OVERLAY */}
              <div
                className="position-absolute top-50 start-50 translate-middle"
                style={{
                  width: "80%",
                  height: "85%",
                  border: "2px solid #ff4d3d",
                  borderRadius: "24px",
                  boxShadow: "0 0 0 9999px rgba(0,0,0,0.4)",
                  pointerEvents: "none",
                  zIndex: 5,
                }}
              >
                {/* SCANNING LINE ANIMATION */}
                {cameraReady && !loading && (
                  <motion.div
                    animate={{ top: ['0%', '100%', '0%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="position-absolute start-0 w-100"
                    style={{ height: '2px', background: '#ff4d3d', boxShadow: '0 0 15px #ff4d3d' }}
                  />
                )}
              </div>

              <AnimatePresence>
                {loading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center"
                    style={{ background: "rgba(0,0,0,0.8)", zIndex: 20 }}
                  >
                    <div className="spinner-border text-light mb-3" style={{ width: '3rem', height: '3rem' }} />
                    <div className="text-white fw-bold tracking-widest text-uppercase">Analyzing Card...</div>
                  </motion.div>
                )}
              </AnimatePresence>

              {cameraError && (
                <div className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center bg-dark text-white p-4">
                  <Camera size={48} className="mb-3 text-danger" />
                  <p>{cameraError}</p>
                  <button onClick={startCamera} className="btn btn-light rounded-pill px-4">Retry Camera</button>
                </div>
              )}
            </motion.div>

            {/* CONTROLS */}
            <div className="mt-4 mt-lg-5 d-flex flex-column flex-sm-row justify-content-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={captureImage}
                disabled={!cameraReady || loading}
                className="btn btn-lg rounded-pill px-5 py-3 shadow-lg"
                style={{
                  background: "linear-gradient(135deg, #ff4d3d 0%, #ff1a1a 100%)",
                  color: "#fff",
                  border: "none",
                  fontWeight: "700",
                  minWidth: "220px"
                }}
              >
                {loading ? "IDENTIFYING..." : "CAPTURE & START"}
              </motion.button>

              <button
                onClick={() => navigate(`/register/${eventId}`)}
                className="btn btn-lg btn-outline-dark rounded-pill px-4 py-3 border-2 fw-bold"
              >
                <UserPlus size={20} className="me-2" />
                Manual Registration
              </button>
            </div>

            <div className="mt-4 text-muted small opacity-75">
              • Hold card steady • Avoid reflections • Ensure name is clear
            </div>
          </div>
        </div>
      </div>

      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}