
import React,{useState} from "react";
import axios from "axios";

function App() {
  const [destination, setDestination] = useState("");
  const [budget, setBudget] = useState("");
  const [days, setDays] = useState("");
  const [result, setResult] = useState("");

  const generatePlan = async () => {
    const response = await axios.post(
      "http://localhost:5000/api/ai/generate",
      {
        destination,
        budget,
        days
      }
    );

    setResult(response.data.itinerary);
  };

  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>AI Group Travel Planner</h1>

      <input
        placeholder="Destination"
        value={destination}
        onChange={(e) => setDestination(e.target.value)}
      />
      <br /><br />

      <input
        placeholder="Budget"
        value={budget}
        onChange={(e) => setBudget(e.target.value)}
      />
      <br /><br />

      <input
        placeholder="Days"
        value={days}
        onChange={(e) => setDays(e.target.value)}
      />
      <br /><br />

      <button onClick={generatePlan}>
        Generate AI Plan
      </button>

      <div style={{ marginTop: "30px", whiteSpace: "pre-wrap" }}>
        {result}
      </div>
    </div>
  );
}

export default App;
