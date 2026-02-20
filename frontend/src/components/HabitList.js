import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

function HabitCard({ habit, onChanged, isDark, palette }) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
          surface2: "rgba(255,255,255,0.06)",
        }
      : {
          cardBg: "#ffffff",
          cardBorder: "rgba(2,6,23,0.08)",
          text: "#0f172a",
          muted: "#475569",
          surface: "#f8fafc",
          surface2: "rgba(2,6,23,0.04)",
        });

  const formatTime12h = (t) => {
    if (!t) return "";
    const [hhRaw, mmRaw] = String(t).split(":");
    const hh = parseInt(hhRaw, 10);
    const mm = parseInt(mmRaw, 10);
    if (!Number.isFinite(hh) || !Number.isFinite(mm)) return String(t);
    const ampm = hh >= 12 ? "PM" : "AM";
    const hour12 = ((hh + 11) % 12) + 1;
    return `${hour12}:${String(mm).padStart(2, "0")} ${ampm}`;
  };

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
  const habitIndex = useMemo(() => {
    const s = String(habit?._id || habit?.title || "");
    let hash = 0;
    for (let i = 0; i < s.length; i++) {
      hash = (hash * 31 + s.charCodeAt(i)) % 100000;
    }
    return Math.abs(hash) % colors.length;
  }, [habit?._id, habit?.title, colors.length]);

  const habitColor = getColor(habitIndex);

  const pct = useMemo(() => {
    const longest = Number(habit?.longestStreak || 0);
    const current = Number(habit?.streak || 0);
    if (!Number.isFinite(current)) return 0;
    if (longest <= 0) return Math.min(Math.round((current / 7) * 100), 100);
    return Math.min(Math.round((current / Math.max(longest, 1)) * 100), 100);
  }, [habit?.streak, habit?.longestStreak]);

  const ProgressRing = ({ percent, color }) => {
    const size = 44;
    const stroke = 6;
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    const offset = c - (Math.max(0, Math.min(100, percent)) / 100) * c;

    return (
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ display: "block" }}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={isDarkMode ? "rgba(255,255,255,0.12)" : "rgba(2,6,23,0.08)"}
            strokeWidth={stroke}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={color}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "11px",
            fontWeight: 800,
            color: isDarkMode ? "rgba(255,255,255,0.86)" : "rgba(2,6,23,0.80)",
          }}
        >
          {percent}%
        </div>
      </div>
    );
  };

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
    background: pal.cardBg,
    border: `1px solid ${pal.cardBorder}`,
    borderRadius: "18px",
    padding: "16px",
    boxShadow: isDarkMode ? "0 18px 55px rgba(0,0,0,0.45)" : "0 10px 30px rgba(15,23,42,0.08)",
    transition: "transform 160ms ease, box-shadow 160ms ease",
    display: "grid",
    gridTemplateColumns: "6px 1fr auto",
    gap: "14px",
    alignItems: "center",
    cursor: "pointer",
  };

  const cardHoverStyle = {
    ...cardStyle,
    boxShadow: isDarkMode ? "0 22px 70px rgba(0,0,0,0.55)" : "0 16px 44px rgba(15,23,42,0.12)",
    transform: "translateY(-2px)",
  };

  const [isHover, setIsHover] = useState(false);

  const titleStyle = {
    fontSize: "16px",
    fontWeight: "850",
    color: pal.text,
    lineHeight: 1.2,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  };

  const metaStyle = {
    marginTop: "6px",
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    fontSize: "13px",
    color: pal.muted,
  };

  const buttonContainerStyle = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px",
    marginTop: "12px",
  };

  const buttonStyle = (isPrimary) => ({
    padding: "10px 12px",
    background: isPrimary ? habitColor : "rgba(2,6,23,0.05)",
    color: isPrimary ? "white" : isDarkMode ? "rgba(255,255,255,0.86)" : "rgba(2,6,23,0.80)",
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
      onClick={() => navigate(`/habits/${habit._id}`)}
    >
      <div style={{ background: habitColor, borderRadius: "999px", width: "6px", height: "100%" }} />

      <div style={{ minWidth: 0 }}>
        <div style={titleStyle}>{habit.title}</div>
        <div style={metaStyle}>
          <span>{habit.frequency === "daily" ? "Daily" : "Weekly"}</span>
          <span style={{ opacity: 0.55 }}>•</span>
          <span>🔥 {habit.streak || 0}</span>
          <span style={{ opacity: 0.55 }}>•</span>
          <span>🏆 {habit.longestStreak || 0}</span>
          <span style={{ opacity: 0.55 }}>•</span>
          <span>🔔 {formatTime12h(habit.reminderTime || "09:00")}</span>
        </div>

        <div style={buttonContainerStyle}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              markComplete();
            }}
            disabled={loading}
            style={buttonStyle(true)}
            onMouseEnter={(e) => (e.target.opacity = "0.92")}
            onMouseLeave={(e) => (e.target.opacity = "1")}
          >
            Complete
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteHabit();
            }}
            disabled={loading}
            style={buttonStyle(false)}
            onMouseEnter={(e) => (e.target.background = "rgba(2,6,23,0.08)")}
            onMouseLeave={(e) => (e.target.background = "rgba(2,6,23,0.05)")}
          >
            Delete
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
        <ProgressRing percent={pct} color={habitColor} />
        <div style={{ fontSize: "11px", fontWeight: 700, color: pal.muted }}>progress</div>
      </div>
    </div>
  );
}

function HabitList({ habits, refreshHabits, isDark, palette }) {
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
        <HabitCard key={habit._id} habit={habit} onChanged={refreshHabits} isDark={isDark} palette={palette} />
      ))}
    </div>
  );
}

export default HabitList;