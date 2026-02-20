import React, { useState } from "react";
import API from "../api/api";

function HabitForm({ refreshHabits }) {
  const [title, setTitle] = useState("");
  const [frequency, setFrequency] = useState("daily");
  const [reminderTime, setReminderTime] = useState("09:00");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Please enter a habit name");
      return;
    }

    setLoading(true);
    try {
      await API.post("/habits", { title: title.trim(), frequency, reminderTime });
      setTitle("");
      setFrequency("daily");
      setReminderTime("09:00");
      refreshHabits();
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to create habit";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const containerStyle = {
    background: "linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))",
    border: "1.5px solid #e0e7ff",
    borderRadius: "15px",
    padding: "25px",
    marginBottom: "30px",
  };

  const titleStyle = {
    fontSize: "16px",
    fontWeight: "600",
    color: "#333",
    marginBottom: "20px",
  };

  const formStyle = {
    display: "grid",
    gridTemplateColumns: "1fr 200px 150px 150px",
    gap: "12px",
    alignItems: "end",
  };

  const inputStyle = {
    padding: "12px 16px",
    border: "1.5px solid #e0e0e0",
    borderRadius: "10px",
    fontSize: "14px",
    fontFamily: "inherit",
    transition: "all 0.3s ease",
  };

  const selectStyle = {
    padding: "12px 16px",
    border: "1.5px solid #e0e0e0",
    borderRadius: "10px",
    fontSize: "14px",
    fontFamily: "inherit",
    background: "white",
    cursor: "pointer",
    transition: "all 0.3s ease",
  };

  const buttonStyle = {
    padding: "12px 24px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
  };

  const errorStyle = {
    padding: "10px 12px",
    background: "rgba(239, 68, 68, 0.1)",
    border: "1px solid #ef4444",
    borderRadius: "8px",
    color: "#dc2626",
    fontSize: "13px",
    marginBottom: "15px",
  };

  return (
    <div style={containerStyle}>
      <div style={titleStyle}>Add New Habit</div>

      {error && <div style={errorStyle}>{error}</div>}

      <form onSubmit={handleSubmit} style={formStyle}>
        <input
          type="text"
          placeholder="Enter habit name (e.g., Morning Run, Read)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={inputStyle}
          onFocus={(e) => (e.target.style.borderColor = "#667eea")}
          onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
          disabled={loading}
        />

        <select
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
          style={selectStyle}
          onFocus={(e) => (e.target.style.borderColor = "#667eea")}
          onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
          disabled={loading}
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
        </select>

        <input
          type="time"
          value={reminderTime}
          onChange={(e) => setReminderTime(e.target.value)}
          style={inputStyle}
          onFocus={(e) => (e.target.style.borderColor = "#667eea")}
          onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
          disabled={loading}
        />

        <button
          type="submit"
          disabled={loading}
          style={buttonStyle}
          onMouseEnter={(e) => {
            e.target.style.transform = "translateY(-2px)";
            e.target.style.boxShadow = "0 6px 20px rgba(102, 126, 234, 0.6)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "0 4px 15px rgba(102, 126, 234, 0.4)";
          }}
        >
          {loading ? "Adding..." : "+ Add Habit"}
        </button>
      </form>
    </div>
  );
}

export default HabitForm;