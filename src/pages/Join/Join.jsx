import "./Join.css";
import { useParams } from "react-router-dom";
import { useState } from "react";

function Join() {
  const { eventCode } = useParams();

  const [name, setName] = useState("");
  const [company, setCompany] = useState("");

  const handleJoin = () => {
    alert(`Joined ${eventCode}`);
  };

  return (
    <div className="join-container">
      <div className="join-card">
        <h1>Join Challenge</h1>

        <p>Event Code: {eventCode}</p>

        <input
          type="text"
          placeholder="Enter Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="text"
          placeholder="Company Name"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />

        <button onClick={handleJoin}>Enter Challenge</button>
      </div>
    </div>
  );
}

export default Join;
