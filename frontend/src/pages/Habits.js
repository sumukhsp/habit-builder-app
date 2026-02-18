import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import HabitForm from "../components/HabitForm";
import HabitList from "../components/HabitList";

function Habits() {
  const navigate = useNavigate();
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHabits = async () => {
    setLoading(true);
    try {
      const res = await API.get("/habits");
      setHabits(res.data);
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to load habits";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  const containerStyle = {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    padding: "40px 20px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  };

  const headerStyle = {
    maxWidth: "1200px",
    margin: "0 auto 30px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  };

  const titleStyle = {
    fontSize: "32px",
    fontWeight: "700",
    color: "white",
  };

  const dashboardButtonStyle = {
    padding: "12px 28px",
    background: "rgba(255, 255, 255, 0.2)",
    color: "white",
    border: "1.5px solid rgba(255, 255, 255, 0.3)",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
  };

  const mainCardStyle = {
    maxWidth: "1200px",
    margin: "0 auto",
    background: "white",
    borderRadius: "20px",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
    padding: "40px",
  };

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <h1 style={titleStyle}>My Habits</h1>
        <button
          style={dashboardButtonStyle}
          onClick={() => navigate("/dashboard")}
          onMouseEnter={(e) => (e.target.style.background = "rgba(255, 255, 255, 0.3)")}
          onMouseLeave={(e) => (e.target.style.background = "rgba(255, 255, 255, 0.2)")}
        >
          ← Dashboard
        </button>
      </div>

      {/* Main Card */}
      <div style={mainCardStyle}>
        <HabitForm refreshHabits={fetchHabits} />
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>
            Loading your habits...
          </div>
        ) : (
          <HabitList habits={habits} refreshHabits={fetchHabits} />
        )}
      </div>
    </div>
  );
}

export default Habits;