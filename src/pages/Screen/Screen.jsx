import "./Screen.css";

function Screen() {
  return (
    <div className="screen-container">
      <div className="timer-circle">
        <h1>60</h1>
      </div>

      <div className="screen-content">
        <h2>Ransomware Attack</h2>

        <p>
          A ransomware attack has encrypted 40% of your company’s production servers.
        </p>

        <div className="options-grid">
          <div className="option-card">A. Pay the ransom immediately</div>

          <div className="option-card">B. Shut down all systems</div>

          <div className="option-card">C. Activate disaster recovery plan</div>

          <div className="option-card">D. Inform media first</div>
        </div>
      </div>
    </div>
  );
}

export default Screen;
