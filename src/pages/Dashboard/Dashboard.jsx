import "./Dashboard.css";

function Dashboard() {
  return (
    <div className="dashboard-container">
      <h1>Admin Dashboard</h1>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h2>Total Participants</h2>
          <p>245</p>
        </div>

        <div className="dashboard-card">
          <h2>Live Responses</h2>
          <p>180</p>
        </div>

        <div className="dashboard-card">
          <h2>Current Scenario</h2>
          <p>Ransomware Attack</p>
        </div>

        <div className="dashboard-card">
          <h2>Timer</h2>
          <p>60s</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
