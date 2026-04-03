import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [message, setMessage] = useState("Loading...");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/health/")
      .then((response) => response.json())
      .then((data) => {
        setMessage(data.message);
      })
      .catch(() => {
        setError("Could not connect to backend");
      });
  }, []);

  return (
    <main className="app">
      <div className="card">
        <p className="eyebrow">Group Design</p>
        <h1>React + Django Check</h1>
        <p className="status">{error || message}</p>
      </div>
    </main>
  );
}

export default App;
