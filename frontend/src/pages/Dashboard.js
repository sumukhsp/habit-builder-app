import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import CalendarHeatmap from "../components/CalendarHeatmap";

export default function Dashboard() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("User");
  const [habits, setHabits] = useState([]);
  const [completions, setCompletions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dailyGoalPercentage, setDailyGoalPercentage] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [themeMode, setThemeMode] = useState(() => {
    const saved = localStorage.getItem("dashboard_theme");
    return saved === "dark" || saved === "light" ? saved : "light";
  });

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth <= 900);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    localStorage.setItem("dashboard_theme", themeMode);
  }, [themeMode]);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [habitsRes, statsRes] = await Promise.all([
        API.get("/habits"),
        API.get("/dashboard/stats"),
      ]);

      setHabits(habitsRes.data);
      setUserName(statsRes.data.userName || "User");

      // Calculate daily goal percentage
      const today = new Date().toISOString().split("T")[0];
      const todayCompletions =
        statsRes.data.completions?.filter((c) => c.date?.split("T")[0] === today) || [];

      const uniqueHabitIdsCompletedToday = new Set(
        todayCompletions.map((c) => String(c.habitId))
      );

      const percentage =
        habitsRes.data.length > 0
          ? Math.min(
              Math.round(
                (uniqueHabitIdsCompletedToday.size / habitsRes.data.length) * 100
              ),
              100
            )
          : 0;

      setDailyGoalPercentage(percentage);
      setCompletions(statsRes.data.completions || []);
    } catch (err) {
      console.error("Failed to load dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Request notification permission and schedule reminders
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const scheduleReminders = () => {
      habits.forEach((habit) => {
        if (!habit.reminderTime) return;
        const [hour, minute] = habit.reminderTime.split(":").map(Number);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0, 0);
        let target = today;
        if (target <= now) {
          // If time passed today, schedule for next occurrence
          if (habit.frequency === "daily") {
            target.setDate(target.getDate() + 1);
          } else if (habit.frequency === "weekly") {
            target.setDate(target.getDate() + ((7 - now.getDay() + 1) % 7 || 7));
          }
        }
        const msUntil = target.getTime() - now.getTime();
        const timeoutId = setTimeout(() => {
          if (Notification.permission === "granted") {
            new Notification(`Habit Reminder: ${habit.title}`, {
              body: habit.frequency === "daily" ? "Time to complete your daily habit!" : "Time to complete your weekly habit!",
              icon: "/favicon.ico",
            });
          }
          // Reschedule for next occurrence after notification
          scheduleReminders();
        }, msUntil);
        // Store timeoutId for cleanup if needed
        habit._reminderTimeoutId = timeoutId;
      });
    };
    scheduleReminders();
    // Cleanup on unmount or habits change
    return () => {
      habits.forEach((habit) => {
        if (habit._reminderTimeoutId) clearTimeout(habit._reminderTimeoutId);
      });
    };
  }, [habits]);

  const getWeekDays = () => {
    const days = [];
    const current = new Date(selectedDate);
    // Start week on Monday to match dayLabels (Mon..Sun)
    const dayIndexMonStart = (current.getDay() + 6) % 7; // Mon=0 ... Sun=6
    const first = current.getDate() - dayIndexMonStart;

    for (let i = 0; i < 7; i++) {
      const date = new Date(current.setDate(first + i));
      days.push(new Date(date));
    }
    return days;
  };

  const getHabitColorMap = () => {
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
    const colorMap = {};
    habits.forEach((habit, index) => {
      colorMap[habit._id] = colors[index % colors.length];
    });
    return colorMap;
  };

  const isHabitCompletedOnDate = (habitId, date) => {
    const dateStr = date.toISOString().split("T")[0];
    return completions.some(
      (c) =>
        String(c.habitId) === String(habitId) &&
        c.date.split("T")[0] === dateStr
    );
  };

  const handleMarkComplete = async (habitId, e) => {
    if (e) e.preventDefault();
    try {
      await API.post("/completion/complete", {
        habitId,
      });
      fetchData();
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to log completion";
      alert(errorMessage);
    }
  };

  const colorMap = getHabitColorMap();
  const weekDays = getWeekDays();
  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const motivationalMessage = useMemo(() => {
    const hour = new Date().getHours();
    const timeGreeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

    if (!habits.length) {
      return `${timeGreeting} — start small. Add one habit and build momentum.`;
    }

    if (dailyGoalPercentage >= 100) {
      return `${timeGreeting} — goal crushed. Keep the streak alive tomorrow.`;
    }

    if (dailyGoalPercentage >= 60) {
      return `${timeGreeting} — you’re close. One more completion can change your day.`;
    }

    return `${timeGreeting} — consistency beats intensity. Mark one habit complete.`;
  }, [dailyGoalPercentage, habits.length]);

  const bestCurrentStreak = useMemo(() => {
    if (!habits.length) return 0;
    return Math.max(...habits.map((h) => Number(h.streak || 0)));
  }, [habits]);

  const consistencyScore = useMemo(() => {
    if (!habits.length) return 0;

    const daysBack = 28;
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const start = new Date(end);
    start.setDate(start.getDate() - (daysBack - 1));
    start.setHours(0, 0, 0, 0);

    const uniquePairs = new Set(
      completions
        .filter((c) => {
          const compDate = new Date(c.date);
          return compDate >= start && compDate <= end;
        })
        .map((c) => `${String(c.habitId)}|${String(c.date).split("T")[0]}`)
    );

    const totalPossible = habits.length * daysBack;
    return Math.min(Math.round((uniquePairs.size / totalPossible) * 100), 100);
  }, [completions, habits]);

  const dailyIntensityMap = useMemo(() => {
    // Map date -> number of unique habits completed on that day
    const map = {};
    const sets = {};
    (completions || []).forEach((c) => {
      const day = String(c.date).split("T")[0];
      if (!sets[day]) sets[day] = new Set();
      sets[day].add(String(c.habitId));
    });
    Object.keys(sets).forEach((k) => {
      map[k] = sets[k].size;
    });
    return map;
  }, [completions]);

  const weeklyProgressPercentage = (() => {
    if (!habits.length) return 0;

    const weekStart = new Date(weekDays[0]);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekDays[6]);
    weekEnd.setHours(23, 59, 59, 999);

    const uniqueHabitDayPairs = new Set(
      completions
        .filter((c) => {
          const compDate = new Date(c.date);
          return compDate >= weekStart && compDate <= weekEnd;
        })
        .map((c) => `${String(c.habitId)}|${String(c.date).split("T")[0]}`)
    );

    const totalPossible = habits.length * 7;
    return Math.min(Math.round((uniqueHabitDayPairs.size / totalPossible) * 100), 100);
  })();

  const isDark = themeMode === "dark";
  const palette = isDark
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
      };

  const getWeeklyCompletionCountForHabit = (habitId) => {
    return weekDays.reduce(
      (acc, d) => acc + (isHabitCompletedOnDate(habitId, d) ? 1 : 0),
      0
    );
  };

  const ProgressRing = ({ percent, color }) => {
    const size = 44;
    const stroke = 6;
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    const offset = c - (Math.max(0, Math.min(100, percent)) / 100) * c;
    return (
      <svg width={size} height={size} style={{ display: "block" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={palette.surface2}
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
    );
  };

  const containerStyle = {
    minHeight: "100vh",
    background: palette.pageBg,
    padding: "30px 20px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  };

  const headerStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
    color: isDark ? palette.text : "white",
  };

  const greetingStyle = {
    fontSize: "24px",
    fontWeight: "600",
  };

  const subGreetingStyle = {
    marginTop: "8px",
    fontSize: "14px",
    lineHeight: "1.7",
    color: isDark ? palette.muted : "rgba(255,255,255,0.92)",
    maxWidth: "720px",
  };

  const navButtonStyle = {
    padding: "10px 20px",
    background: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(255, 255, 255, 0.2)",
    color: isDark ? palette.text : "white",
    border: isDark ? "1px solid rgba(255, 255, 255, 0.14)" : "1px solid rgba(255, 255, 255, 0.3)",
    borderRadius: "8px",
    cursor: "pointer",
    marginLeft: "10px",
    transition: "all 0.3s ease",
  };

  const cardStyle = {
    background: palette.cardBg,
    borderRadius: "20px",
    boxShadow: isDark ? "0 22px 70px rgba(0, 0, 0, 0.55)" : "0 20px 60px rgba(0, 0, 0, 0.15)",
    padding: isMobile ? "22px" : "40px",
    maxWidth: "1400px",
    margin: "0 auto",
    border: `1px solid ${palette.cardBorder}`,
  };

  const topSectionStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
    paddingBottom: "20px",
    borderBottom: isDark ? "1px solid rgba(255,255,255,0.10)" : "1px solid #eee",
  };

  const datePickerStyle = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "14px",
    color: palette.muted,
  };

  const dateSmallStyle = {
    fontSize: "12px",
    fontWeight: "500",
  };

  const mainGridStyle = {
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : "1.2fr 0.8fr",
    gap: "30px",
  };

  const leftSectionStyle = {
    background: palette.surface,
    borderRadius: "15px",
    padding: "25px",
    border: `1px solid ${palette.cardBorder}`,
  };

  const rightSectionStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  };

  const addHabitButtonStyle = {
    padding: "12px 20px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
  };

  const habitListStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  };

  const habitRowStyle = {
    display: "grid",
    gridTemplateColumns: "6px 1fr auto",
    gap: "14px",
    padding: "14px",
    borderRadius: "14px",
    background: isDark ? "rgba(255,255,255,0.03)" : "#ffffff",
    border: isDark ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(2,6,23,0.06)",
    boxShadow: isDark ? "0 16px 46px rgba(0,0,0,0.35)" : "0 10px 30px rgba(15,23,42,0.08)",
    alignItems: "center",
  };

  const habitTitleStyle = {
    fontSize: "14px",
    fontWeight: "750",
    color: palette.text,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  };

  const habitMetaStyle = {
    marginTop: "4px",
    fontSize: "12px",
    color: palette.muted,
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
  };

  const weekChecksStyle = {
    marginTop: "10px",
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: "8px",
    maxWidth: "260px",
  };

  const checkCellStyle = (active, color) => ({
    height: "24px",
    borderRadius: "999px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: "800",
    background: active ? color : palette.surface2,
    color: active ? "white" : isDark ? "rgba(255,255,255,0.55)" : "rgba(2,6,23,0.45)",
    border: active
      ? "1px solid rgba(255,255,255,0.18)"
      : isDark
        ? "1px solid rgba(255,255,255,0.10)"
        : "1px solid rgba(2,6,23,0.06)",
  });

  const dayHeaderStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: "8px",
    marginBottom: "10px",
    maxWidth: "260px",
  };

  const dayLabelStyle = {
    textAlign: "center",
    fontWeight: "600",
    fontSize: "12px",
    color: palette.muted,
    padding: "0 0 8px 0",
  };

  const statisticsStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  };

  const metricsGridStyle = {
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr 1fr" : "1fr 1fr",
    gap: "12px",
  };

  const statBoxStyle = {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    padding: "20px",
    borderRadius: "12px",
    textAlign: "center",
    boxShadow: "0 14px 34px rgba(102, 126, 234, 0.35)",
  };

  const statNumberStyle = {
    fontSize: "32px",
    fontWeight: "700",
    marginBottom: "5px",
  };

  const statSubNumberStyle = {
    fontSize: "12px",
    opacity: 0.9,
    marginTop: "2px",
  };

  const statLabelStyle = {
    fontSize: "13px",
    opacity: 0.9,
  };

  const completeButtonStyle = {
    padding: "8px 12px",
    background: "#667eea",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <p style={{ textAlign: "center", color: palette.muted }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div>
          <div style={greetingStyle}>👋 Hey there, {userName.split(" ")[0]}</div>
          <div style={subGreetingStyle}>{motivationalMessage}</div>
        </div>
        <div>
          <button
            style={navButtonStyle}
            onClick={() => setThemeMode((m) => (m === "dark" ? "light" : "dark"))}
            onMouseEnter={(e) =>
              (e.target.style.background =
                isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(255, 255, 255, 0.3)")
            }
            onMouseLeave={(e) =>
              (e.target.style.background =
                isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(255, 255, 255, 0.2)")
            }
          >
            {isDark ? "Light" : "Dark"}
          </button>
          <button
            style={navButtonStyle}
            onClick={() => navigate("/habits")}
            onMouseEnter={(e) => (e.target.style.background = "rgba(255, 255, 255, 0.3)")}
            onMouseLeave={(e) => (e.target.style.background = "rgba(255, 255, 255, 0.2)")}
          >
            + Add Habit
          </button>
          <button
            style={navButtonStyle}
            onClick={logout}
            onMouseEnter={(e) => (e.target.style.background = "rgba(255, 255, 255, 0.3)")}
            onMouseLeave={(e) => (e.target.style.background = "rgba(255, 255, 255, 0.2)")}
          >
            Logout
          </button>
        </div>
      </div>

      <div style={cardStyle}>
        {/* Top Section */}
        <div style={topSectionStyle}>
          <div>
            <div style={dateSmallStyle}>
              {weekDays[0].toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}{" "}
              -{" "}
              {weekDays[6].toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </div>
            <div style={{ fontSize: "18px", fontWeight: "600", color: palette.text }}>
              Week Overview
            </div>
          </div>
          <div style={datePickerStyle}>
            <button
              onClick={() =>
                setSelectedDate(
                  new Date(selectedDate.getTime() - 7 * 24 * 60 * 60 * 1000)
                )
              }
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: "20px" }}
            >
              ←
            </button>
            <span>
              {selectedDate.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </span>
            <button
              onClick={() =>
                setSelectedDate(
                  new Date(selectedDate.getTime() + 7 * 24 * 60 * 60 * 1000)
                )
              }
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: "20px" }}
            >
              →
            </button>
          </div>
        </div>

        {/* Main Grid */}
        <div style={mainGridStyle}>
          {/* Left Section - Habit Grid */}
          <div style={leftSectionStyle}>
            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "13px", color: palette.muted, marginBottom: "3px" }}>
                Weekly Progress
              </div>
              <div style={{ fontSize: "22px", fontWeight: "700", color: "#667eea" }}>
                {weeklyProgressPercentage}
                %
              </div>
            </div>

            {/* Day Headers */}
            <div style={dayHeaderStyle}>
              {dayLabels.map((label) => (
                <div key={label} style={dayLabelStyle}>
                  {label}
                </div>
              ))}
            </div>

            {/* Habits List */}
            <div style={habitListStyle}>
              {habits.length > 0 ? (
                habits.map((habit) => {
                  const accent = colorMap[habit._id];
                  const count = getWeeklyCompletionCountForHabit(habit._id);
                  const pct = Math.round((count / 7) * 100);

                  return (
                    <div
                      key={habit._id}
                      style={{ ...habitRowStyle, cursor: "pointer" }}
                      onClick={() => navigate(`/habits/${habit._id}`)}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                    >
                      <div style={{ background: accent, borderRadius: "999px", width: "6px", height: "100%" }} />

                      <div style={{ minWidth: 0 }}>
                        <div style={habitTitleStyle}>{habit.title}</div>
                        <div style={habitMetaStyle}>
                          <span>{habit.frequency === "daily" ? "Daily" : "Weekly"}</span>
                          <span style={{ opacity: 0.7 }}>•</span>
                          <span>🔥 {habit.streak || 0}</span>
                          <span style={{ opacity: 0.7 }}>•</span>
                          <span>🔔 {habit.reminderTime || "09:00"}</span>
                        </div>

                        <div style={weekChecksStyle}>
                          {weekDays.map((day) => {
                            const done = isHabitCompletedOnDate(habit._id, day);
                            return (
                              <div
                                key={`${habit._id}-${day.toISOString()}`}
                                title={day.toLocaleDateString()}
                                style={checkCellStyle(done, accent)}
                              >
                                {done ? "✓" : ""}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div title={`${count}/7 this week`}>
                          <ProgressRing percent={pct} color={accent} />
                        </div>
                        <button
                          type="button"
                          style={completeButtonStyle}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkComplete(habit._id, e);
                          }}
                          onMouseEnter={(e) => (e.target.opacity = "0.9")}
                          onMouseLeave={(e) => (e.target.opacity = "1")}
                        >
                          Complete
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p style={{ color: palette.muted, textAlign: "center", marginTop: "20px" }}>
                  No habits yet. Add one to get started!
                </p>
              )}
            </div>
          </div>

          {/* Right Section - Habit Cards */}
          <div style={rightSectionStyle}>
            <button
              style={addHabitButtonStyle}
              onClick={() => navigate("/habits")}
              onMouseEnter={(e) => (e.target.transform = "translateY(-2px)")}
              onMouseLeave={(e) => (e.target.transform = "translateY(0)")}
            >
              + Add Habit
            </button>

            {/* Statistics */}
            <div style={statisticsStyle}>
              <div style={metricsGridStyle}>
                <div style={statBoxStyle}>
                  <div style={statNumberStyle}>{dailyGoalPercentage}%</div>
                  <div style={statLabelStyle}>daily goal achieved</div>
                </div>
                <div style={statBoxStyle}>
                  <div style={statNumberStyle}>{habits.length}</div>
                  <div style={statLabelStyle}>active habits</div>
                </div>
                <div style={statBoxStyle}>
                  <div style={statNumberStyle}>{bestCurrentStreak}</div>
                  <div style={statLabelStyle}>best streak</div>
                  <div style={statSubNumberStyle}>current days</div>
                </div>
                <div style={statBoxStyle}>
                  <div style={statNumberStyle}>{consistencyScore}%</div>
                  <div style={statLabelStyle}>consistency score</div>
                  <div style={statSubNumberStyle}>last 28 days</div>
                </div>
              </div>

              <div
                style={{
                  background: palette.cardBg,
                  borderRadius: "14px",
                  padding: "14px",
                  border: `1px solid ${palette.cardBorder}`,
                  boxShadow: isDark
                    ? "0 18px 55px rgba(0,0,0,0.45)"
                    : "0 12px 30px rgba(15, 23, 42, 0.08)",
                }}
              >
                <CalendarHeatmap
                  title="Monthly activity"
                  dateToCount={dailyIntensityMap}
                  isDark={isDark}
                  palette={palette}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}