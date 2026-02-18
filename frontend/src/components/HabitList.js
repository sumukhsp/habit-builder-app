import React, { useState } from "react";
import API from "../api/api";

function HabitCard({ habit, onChanged }) {
  const [loading, setLoading] = useState(false);

  const colors = [
    "#FF9800",
    "#9C27B0",
    "#00BCD4",
    "#FF5722",
    "#2196F3",
    "#4CAF50",
    "#FFC107",
    "#E91E63",
  ];

  const getColor = (index) => colors[index % colors.length];
  const habitIndex = Math.floor(Math.random() * colors.length);
  const habitColor = getColor(habitIndex);

  const markComplete = async () => {
    setLoading(true);
    try {
      await API.post("/completion/complete", { habitId: habit._id });
      onChanged();
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to mark complete";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const deleteHabit = async () => {
    if (!window.confirm(`Delete "${habit.title}"? This action cannot be undone.`)) return;
    setLoading(true);
    try {
      await API.delete(`/habits/${habit._id}`);
      onChanged();
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to delete habit";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const cardStyle = {
    background: "white",
    border: `2px solid ${habitColor}`,
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
    transition: "all 0.3s ease",
    display: "flex",
    flexDirection: "column",
  };

  const cardHoverStyle = {
    ...cardStyle,
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
    transform: "translateY(-4px)",
  };

  const [isHover, setIsHover] = useState(false);

  const headerStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "12px",
  };

  const titleStyle = {
    fontSize: "16px",
    fontWeight: "700",
    color: "#333",
    flex: 1,
  };

  const badgeStyle = {
    background: habitColor,
    color: "white",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "600",
    textTransform: "uppercase",
    marginLeft: "10px",
  };

  const infoStyle = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    margin: "12px 0",
    fontSize: "13px",
    color: "#666",
  };

  const iconStyle = {
    width: "20px",
    height: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
  };

  const buttonContainerStyle = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px",
    marginTop: "16px",
  };

  const buttonStyle = (isPrimary) => ({
    padding: "10px 16px",
    background: isPrimary ? habitColor : "#f0f0f0",
    color: isPrimary ? "white" : "#333",
    border: "none",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
  });

  return (
    <div
      style={isHover ? cardHoverStyle : cardStyle}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
      <div style={headerStyle}>
        <div style={titleStyle}>{habit.title}</div>
        <div style={badgeStyle}>
          {habit.frequency === "daily" ? "📅 Daily" : "📆 Weekly"}
        </div>
      </div>

      <div style={infoStyle}>
        <div style={iconStyle}>🔥</div>
        <span>Streak: {habit.streak || 0} days</span>
      </div>

      <div style={buttonContainerStyle}>
        <button
          onClick={markComplete}
          disabled={loading}
          style={buttonStyle(true)}
          onMouseEnter={(e) => (e.target.opacity = "0.9")}
          onMouseLeave={(e) => (e.target.opacity = "1")}
        >
          ✓ Complete
        </button>

        <button
          onClick={deleteHabit}
          disabled={loading}
          style={buttonStyle(false)}
          onMouseEnter={(e) => (e.target.background = "#e0e0e0")}
          onMouseLeave={(e) => (e.target.background = "#f0f0f0")}
        >
          🗑 Delete
        </button>
      </div>
    </div>
  );
}

function HabitList({ habits, refreshHabits }) {
  const emptyStateStyle = {
    textAlign: "center",
    padding: "60px 20px",
    color: "#999",
  };

  const emptyIconStyle = {
    fontSize: "48px",
    marginBottom: "16px",
  };

  const emptyTitleStyle = {
    fontSize: "20px",
    fontWeight: "600",
    color: "#666",
    marginBottom: "8px",
  };

  const emptyDescStyle = {
    fontSize: "14px",
    color: "#999",
  };

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "20px",
  };

  if (!habits?.length) {
    return (
      <div style={emptyStateStyle}>
        <div style={emptyIconStyle}>📋</div>
        <div style={emptyTitleStyle}>No habits yet</div>
        <div style={emptyDescStyle}>
          Add your first habit above to get started on your journey!
        </div>
      </div>
    );
  }

  return (
    <div style={gridStyle}>
      {habits.map((habit) => (
        <HabitCard key={habit._id} habit={habit} onChanged={refreshHabits} />
      ))}
    </div>
  );
}

export default HabitList;