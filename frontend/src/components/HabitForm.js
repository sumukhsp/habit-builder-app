import React, { useState } from "react";
import API from "../api/api";

function HabitForm({ refreshHabits, isDark, palette }) {
  const [title, setTitle] = useState("");
  const [frequency, setFrequency] = useState("daily");
  const [hour12, setHour12] = useState(9);
  const [minute, setMinute] = useState(0);
  const [ampm, setAmpm] = useState("AM");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isDarkMode = Boolean(isDark);
  const pal =
    palette ||
    (isDarkMode
      ? {
          cardBg: "#0f172a",
          cardBorder: "rgba(255,255,255,0.10)",
          text: "rgba(255,255,255,0.92)",
          muted: "rgba(255,255,255,0.70)",
          surface: "rgba(255,255,255,0.04)",
        }
      : {
          cardBg: "#ffffff",
          cardBorder: "rgba(2,6,23,0.08)",
          text: "#0f172a",
          muted: "#475569",
          surface: "#f8fafc",
        });

  const recomputeReminderTime = (h12, m, ap) => {
    const h = Math.max(1, Math.min(12, parseInt(h12, 10) || 12));
    const min = Math.max(0, Math.min(59, parseInt(m, 10) || 0));
    let hh = h % 12;
    if (ap === "PM") hh += 12;
    const hhStr = String(hh).padStart(2, "0");
    const mmStr = String(min).padStart(2, "0");
    return `${hhStr}:${mmStr}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Please enter a habit name");
      return;
    }

    setLoading(true);
    try {
      const time24 = recomputeReminderTime(hour12, minute, ampm);
      await API.post("/habits", { title: title.trim(), frequency, reminderTime: time24 });
      setTitle("");
      setFrequency("daily");
      setHour12(9);
      setMinute(0);
      setAmpm("AM");
      refreshHabits();
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to create habit";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const containerStyle = {
    background: isDarkMode
      ? "linear-gradient(135deg, rgba(102, 126, 234, 0.10), rgba(118, 75, 162, 0.12))"
      : "linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))",
    border: `1.5px solid ${isDarkMode ? "rgba(255,255,255,0.10)" : "#e0e7ff"}`,
    borderRadius: "15px",
    padding: "25px",
    marginBottom: "30px",
  };

  const titleStyle = {
    fontSize: "16px",
    fontWeight: "600",
    color: pal.text,
    marginBottom: "20px",
  };

  const formStyle = {
    display: "grid",
    gridTemplateColumns: "1fr 200px 280px 150px",
    gap: "12px",
    alignItems: "end",
  };

  const inputStyle = {
    padding: "12px 16px",
    border: isDarkMode ? "1.5px solid rgba(255,255,255,0.10)" : "1.5px solid #e0e0e0",
    borderRadius: "10px",
    fontSize: "14px",
    fontFamily: "inherit",
    background: isDarkMode ? "rgba(255,255,255,0.04)" : "white",
    color: pal.text,
    transition: "all 0.3s ease",
  };

  const selectStyle = {
    padding: "12px 16px",
    border: isDarkMode ? "1.5px solid rgba(255,255,255,0.10)" : "1.5px solid #e0e0e0",
    borderRadius: "10px",
    fontSize: "14px",
    fontFamily: "inherit",
    background: isDarkMode ? "rgba(255,255,255,0.04)" : "white",
    color: pal.text,
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
          onBlur={(e) => (e.target.style.borderColor = isDarkMode ? "rgba(255,255,255,0.10)" : "#e0e0e0")}
          disabled={loading}
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
        </select>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
          <select
            value={hour12}
            onChange={(e) => setHour12(Number(e.target.value))}
            style={selectStyle}
            onFocus={(e) => (e.target.style.borderColor = "#667eea")}
            onBlur={(e) => (e.target.style.borderColor = isDarkMode ? "rgba(255,255,255,0.10)" : "#e0e0e0")}
            disabled={loading}
          >
            {Array.from({ length: 12 }).map((_, i) => {
              const v = i + 1;
              return (
                <option key={v} value={v}>
                  {String(v).padStart(2, "0")}
                </option>
              );
            })}
          </select>
          <select
            value={minute}
            onChange={(e) => setMinute(Number(e.target.value))}
            style={selectStyle}
            onFocus={(e) => (e.target.style.borderColor = "#667eea")}
            onBlur={(e) => (e.target.style.borderColor = isDarkMode ? "rgba(255,255,255,0.10)" : "#e0e0e0")}
            disabled={loading}
          >
            {Array.from({ length: 60 }).map((_, i) => (
              <option key={i} value={i}>
                {String(i).padStart(2, "0")}
              </option>
            ))}
          </select>
          <select
            value={ampm}
            onChange={(e) => setAmpm(e.target.value)}
            style={selectStyle}
            onFocus={(e) => (e.target.style.borderColor = "#667eea")}
            onBlur={(e) => (e.target.style.borderColor = isDarkMode ? "rgba(255,255,255,0.10)" : "#e0e0e0")}
            disabled={loading}
          >
            <option value="AM">AM</option>
            <option value="PM">PM</option>
          </select>
        </div>

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