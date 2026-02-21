import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import HabitForm from "../components/HabitForm";
import HabitList from "../components/HabitList";

function Habits() {
  const navigate = useNavigate();
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [themeMode, setThemeMode] = useState(() => {
    const saved = localStorage.getItem("dashboard_theme");
    return saved === "dark" || saved === "light" ? saved : "light";
  });

  const isDark = themeMode === "dark";
  const palette = useMemo(
    () =>
      isDark
        ? {
            pageBg: "linear-gradient(135deg, #0b1020 0%, #1a1030 100%)",
            cardBg: "#0f172a",
            cardBorder: "rgba(255,255,255,0.10)",
            text: "rgba(255,255,255,0.92)",
            muted: "rgba(255,255,255,0.70)",
            surface: "rgba(255,255,255,0.04)",
            surface2: "rgba(255,255,255,0.06)",
          }
        : {
            pageBg: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            cardBg: "#ffffff",
            cardBorder: "rgba(2,6,23,0.08)",
            text: "#0f172a",
            muted: "#475569",
            surface: "#f8fafc",
            surface2: "rgba(2,6,23,0.04)",
          },
    [isDark]
  );

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

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth <= 900);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    localStorage.setItem("dashboard_theme", themeMode);
  }, [themeMode]);

  const containerStyle = {
    minHeight: "100vh",
    background: palette.pageBg,
    padding: "40px 20px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  };

  const headerStyle = {
    maxWidth: "1200px",
    margin: "0 auto 30px",
    display: "flex",
    justifyContent: "space-between",
    flexDirection: isMobile ? "column" : "row",
    alignItems: isMobile ? "flex-start" : "center",
    gap: isMobile ? "14px" : "0px",
  };

  const headerRightStyle = {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    width: isMobile ? "100%" : "auto",
    justifyContent: isMobile ? "flex-start" : "flex-end",
  };

  const titleStyle = {
    fontSize: "32px",
    fontWeight: "700",
    color: isDark ? palette.text : "white",
  };

  const dashboardButtonStyle = {
    padding: "12px 28px",
    background: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(255, 255, 255, 0.2)",
    color: isDark ? palette.text : "white",
    border: isDark ? "1.5px solid rgba(255, 255, 255, 0.14)" : "1.5px solid rgba(255, 255, 255, 0.3)",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
  };

  const themeButtonStyle = {
    padding: "12px 18px",
    background: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(255, 255, 255, 0.2)",
    color: isDark ? palette.text : "white",
    border: isDark ? "1.5px solid rgba(255, 255, 255, 0.14)" : "1.5px solid rgba(255, 255, 255, 0.3)",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
  };

  const mainCardStyle = {
    maxWidth: "1200px",
    margin: "0 auto",
    background: palette.cardBg,
    borderRadius: "20px",
    border: `1px solid ${palette.cardBorder}`,
    boxShadow: isDark ? "0 22px 70px rgba(0,0,0,0.55)" : "0 20px 60px rgba(0, 0, 0, 0.15)",
    padding: "40px",
  };

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <h1 style={titleStyle}>My Habits</h1>
        <div style={headerRightStyle}>
          <button
            style={themeButtonStyle}
            onClick={() => setThemeMode((m) => (m === "dark" ? "light" : "dark"))}
            onMouseEnter={(e) => (e.target.style.transform = "translateY(-1px)")}
            onMouseLeave={(e) => (e.target.style.transform = "translateY(0)")}
          >
            {isDark ? "Light" : "Dark"}
          </button>
          <button
            style={dashboardButtonStyle}
            onClick={() => navigate("/dashboard")}
            onMouseEnter={(e) => (e.target.style.transform = "translateY(-1px)")}
            onMouseLeave={(e) => (e.target.style.transform = "translateY(0)")}
          >
            ← Dashboard
          </button>
        </div>
      </div>

      {/* Main Card */}
      <div style={mainCardStyle}>
        <HabitForm refreshHabits={fetchHabits} isDark={isDark} palette={palette} />
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: palette.muted }}>
            Loading your habits...
          </div>
        ) : (
          <HabitList habits={habits} refreshHabits={fetchHabits} isDark={isDark} palette={palette} />
        )}
      </div>
    </div>
  );
}

export default Habits;  