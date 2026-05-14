import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, RefreshCw, UserPlus } from "lucide-react";
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

      // Stop old stream
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

      if (err.name === "NotAllowedError") {
        setCameraError("Camera permission denied");
      } else if (err.name === "NotFoundError") {
        setCameraError("No camera found");
      } else {
        setCameraError("Unable to access camera");
      }
    }
  }, []);

  // =========================
  // STOP CAMERA
  // =========================
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    startCamera();

    return () => {
      stopCamera();
    };
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

      if (!video || !canvas) {
        throw new Error("Camera not ready");
      }

      if (video.videoWidth === 0 || video.videoHeight === 0) {
        throw new Error("Video not ready");
      }

      const ctx = canvas.getContext("2d");

      // Set canvas size (we use a slightly higher quality for Google Vision)
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw image
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert image to base64
      const imageData = canvas.toDataURL("image/jpeg", 0.9);

      if (!eventId) {
        throw new Error("Missing Event ID. Please ensure you are on the correct URL (e.g., /start/event-name)");
      }

      console.log("SENDING TO BACKEND:", { eventId, imageLength: imageData.length });

      // =========================
      // CALL BACKEND (Google Vision OCR)
      // =========================
      const result = await callFunction("scan-id-card", {
        imageBase64: imageData,
        eventId,
      });

      console.log("SCAN RESULT:", result);

      if (result?.error) {
        throw new Error(result.error);
      }

      // =========================
      // USER FOUND
      // =========================
      if (result?.userFound && result?.user) {
        toast.success(`Welcome ${result.user.name}`);

        const session = await callFunction("create-session", {
          eventCode: eventId,
          name: result.user.name,
          company: result.user.company,
          designation: result.user.designation,
          email: result.user.email,
        });

        console.log("SESSION:", session);

        if (session?.sessionId) {
          stopCamera();

          navigate(`/game/${session.sessionId}`, {
            state: {
              questions: session.questions || [],
            },
          });

          return;
        }

        throw new Error("Session creation failed");
      }

      // =========================
      // USER NOT FOUND
      // =========================
      toast(result?.message || "User not found. Please register manually.");

      navigate(`/register/${eventId}`, {
        state: {
          prefill: {
            name: result?.extractedName || "",
          },
        },
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
      className="min-vh-100 d-flex flex-column align-items-center justify-content-center position-relative overflow-hidden px-3"
      style={{
        background:
          "radial-gradient(circle at 50% 50%, #ffffff 0%, #f0f0f0 100%)",
      }}
    >
      {/* BACKGROUND */}
      <div
        className="position-absolute top-0 start-0 w-100 h-100 opacity-25"
        style={{
          backgroundImage:
            "radial-gradient(#ff4d3d 0.5px, transparent 0.5px)",
          backgroundSize: "30px 30px",
          pointerEvents: "none",
        }}
      />

      {/* LOGO */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 position-relative"
        style={{ zIndex: 20 }}
      >
        <img
          src={KyndrylLogo}
          alt="Kyndryl"
          style={{
            width: "170px",
          }}
        />
      </motion.div>

      {/* TITLE */}
      <div
        className="text-center mb-4 position-relative"
        style={{
          maxWidth: "700px",
          zIndex: 20,
        }}
      >
        <h1
          style={{
            fontSize: "clamp(2.5rem,5vw,5rem)",
            fontWeight: "700",
            letterSpacing: "-3px",
            color: "#2b2b2b",
            lineHeight: 1,
          }}
        >
          60-Second
          <span style={{ color: "#ff4d3d" }}> Challenge</span>
        </h1>

        <p
          style={{
            color: "#7a7a7a",
            fontSize: "1rem",
            marginTop: "20px",
            lineHeight: 1.8,
          }}
        >
          Hold your employee ID card inside the frame and capture the image.
        </p>
      </div>

      {/* CAMERA */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="position-relative overflow-hidden rounded-5 shadow-lg"
        style={{
          width: "100%",
          maxWidth: "520px",
          aspectRatio: "4/3",
          background: "#000",
          zIndex: 10,
        }}
      >
        {/* VIDEO */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-100 h-100"
          style={{
            objectFit: "cover",
          }}
        />

        {/* FRAME */}
        <div
          className="position-absolute top-50 start-50 translate-middle"
          style={{
            width: "80%",
            height: "55%",
            border: "3px solid #ff4d3d",
            borderRadius: "24px",
            boxShadow: "0 0 0 9999px rgba(0,0,0,0.35)",
            pointerEvents: "none",
            zIndex: 5,
          }}
        />

        {/* LOADING */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center"
              style={{
                background: "rgba(0,0,0,0.7)",
                zIndex: 20,
                pointerEvents: loading ? "all" : "none",
              }}
            >
              <div className="spinner-border text-light mb-3" />

              <div
                className="text-white fw-bold text-uppercase mb-2"
                style={{
                  letterSpacing: "2px",
                  fontSize: "0.8rem",
                }}
              >
                SCANNING TEXT...
              </div>

              <div className="text-white-50 small">
                Looking for your name
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CAMERA ERROR */}
        {cameraError && (
          <div
            className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center text-center p-4"
            style={{
              background: "#111",
              zIndex: 30,
            }}
          >
            <Camera size={50} color="#ff4d3d" />

            <p className="text-white mt-3 mb-4">
              {cameraError}
            </p>

            <button
              onClick={startCamera}
              className="btn btn-light rounded-pill px-4"
            >
              <RefreshCw size={16} className="me-2" />
              Retry
            </button>
          </div>
        )}
      </motion.div>

      {/* BUTTONS */}
      <div
        className="d-flex flex-column flex-sm-row gap-3 mt-4 position-relative"
        style={{ zIndex: 50 }}
      >
        {/* CAPTURE BUTTON */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={captureImage}
          disabled={!cameraReady || loading}
          className="btn rounded-pill px-5 py-3 shadow-lg"
          style={{
            background:
              "linear-gradient(135deg, #ff4d3d 0%, #ff1a1a 100%)",
            color: "#fff",
            border: "none",
            fontWeight: "700",
            letterSpacing: "1px",
            minWidth: "240px",
            cursor:
              !cameraReady || loading
                ? "not-allowed"
                : "pointer",
          }}
        >
          {loading ? "SCANNING..." : "CAPTURE ID CARD"}
        </motion.button>

        {/* REGISTER BUTTON */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate(`/register/${eventId}`)}
          className="btn btn-outline-dark rounded-pill px-4 py-3"
          style={{
            borderWidth: "2px",
            fontWeight: "600",
            background: "#fff",
            cursor: "pointer",
          }}
        >
          <UserPlus size={18} className="me-2" />
          Manual Registration
        </motion.button>
      </div>

      {/* GUIDE */}
      <div
        className="text-center mt-4 position-relative"
        style={{
          color: "#8a8a8a",
          fontSize: "0.9rem",
          lineHeight: 1.8,
          zIndex: 20,
        }}
      >
        • Hold card steady
        <br />
        • Avoid reflections and glare
        <br />
        • Ensure name is clearly visible
      </div>

      {/* HIDDEN CANVAS */}
      <canvas
        ref={canvasRef}
        style={{
          display: "none",
        }}
      />
    </div>
  );
}