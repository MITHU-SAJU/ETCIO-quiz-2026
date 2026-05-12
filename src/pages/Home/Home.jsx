import "./Home.css";
import { Container, Row, Col, Button } from "react-bootstrap";
import { FaClock, FaUsers, FaChartLine, FaArrowRight } from "react-icons/fa";

function Home() {
  return (
    <div className="home-wrapper">
      <Container>
        {/* Section Label */}
        <div className="section-label">
          <h6>1. LANDING PAGE</h6>
        </div>

        <Row className="align-items-center g-5">
          {/* RIGHT SIDE - CONTENT */}
          <Col lg={6} md={12} className="right-content-section">
            <div className="hero-text">
              <h1>
                60-SECOND <br />
                <span>CIO CHALLENGE</span>
              </h1>

              <p>
                Real-world crises. Tough decisions.
                <br />
                How would <span>YOU</span> lead?
              </p>
            </div>

            {/* Timer */}
            <div className="timer-wrapper">
              <div className="timer-glow"></div>
              <div className="timer-circle">
                <h2>60</h2>
                <span>SECONDS</span>
              </div>
            </div>

            {/* Features */}
            <Row className="feature-row g-4">
              <Col md={4} sm={6} xs={12}>
                <div className="feature-box">
                  <div className="icon-circle">
                    <FaClock />
                  </div>
                  <h5>60 Seconds</h5>
                  <p>Make the right decision fast</p>
                </div>
              </Col>

              <Col md={4} sm={6} xs={12}>
                <div className="feature-box">
                  <div className="icon-circle">
                    <FaUsers />
                  </div>
                  <h5>Live Competition</h5>
                  <p>Compete with industry leaders</p>
                </div>
              </Col>

              <Col md={4} sm={6} xs={12}>
                <div className="feature-box">
                  <div className="icon-circle">
                    <FaChartLine />
                  </div>
                  <h5>Real-time Results</h5>
                  <p>See how audience is responding</p>
                </div>
              </Col>
            </Row>

            {/* Buttons */}
            <div className="button-group">
              <Button className="join-btn">
                JOIN CHALLENGE
                <FaArrowRight className="ms-2" />
              </Button>

              <Button className="admin-btn">ADMIN DASHBOARD</Button>
            </div>
          </Col>
          {/* LEFT SIDE - IMAGE */}
          <Col lg={6} md={12} className="left-image-section">
            <div className="hero-image-wrapper">
              <img
                src="https://via.placeholder.com/800x900/1a1a2e/00ffcc?text=CIO+CHALLENGE"
                alt="60 Second CIO Challenge"
                className="hero-image"
              />
              {/* Optional overlay effect */}
              <div className="image-overlay"></div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Home;
