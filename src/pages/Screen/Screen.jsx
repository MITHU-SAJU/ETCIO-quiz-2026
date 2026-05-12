import "./Screen.css";

function Screen() {
  return (
    <div className="screen-container">
      <div className="timer-circle">
        <h1>60</h1>
      </div>

      <div className="screen-content">
        <h2>Ransomware Attack Detected</h2>

        <p>
          Your enterprise infrastructure is under attack. What is your first
          response?
        </p>

        <div className="options-grid">
          <div className="option-card">Shut Down Systems</div>

          <div className="option-card">Pay Ransom</div>

          <div className="option-card">Inform Stakeholders</div>

          <div className="option-card">Activate Backup</div>
        </div>
      </div>
    </div>
  );
}

export default Screen;
