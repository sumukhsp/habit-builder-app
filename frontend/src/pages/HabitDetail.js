import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../api/api";
import CalendarHeatmap from "../components/CalendarHeatmap";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  Filler
);

export default function HabitDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [habit, setHabit] = useState(null);
  const [completions, setCompletions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [themeMode, setThemeMode] = useState(() => {
    const saved = localStorage.getItem("dashboard_theme");
    return saved === "dark" || saved === "light" ? saved : "light";
  });

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

  useEffect(() => {
    localStorage.setItem("dashboard_theme", themeMode);
  }, [themeMode]);

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth <= 900);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const [habitRes, completionsRes] = await Promise.all([
          API.get(`/habits/${id}`),
          API.get(`/completion/habit/${id}`),
        ]);

        setHabit(habitRes.data);
        setCompletions(completionsRes.data || []);
      } catch (e) {
        const msg = e?.response?.data?.message || "Failed to load habit";
        alert(msg);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [id]);

  const completionDatesSet = useMemo(() => {
    const s = new Set();
    (completions || []).forEach((c) => {
      if (!c?.date) return;
      s.add(String(c.date).split("T")[0]);
    });
    return s;
  }, [completions]);

  const getLastNDays = (n) => {
    const days = [];
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      days.push(d);
    }
    return days;
  };

  const weeklySeries = useMemo(() => {
    const days = getLastNDays(7);
    const labels = days.map((d) =>
      d.toLocaleDateString("en-US", { weekday: "short" })
    );
    const counts = days.map((d) =>
      completionDatesSet.has(d.toISOString().split("T")[0]) ? 1 : 0
    );
    return { labels, counts };
  }, [completionDatesSet]);

  const monthlySeries = useMemo(() => {
    const months = [];
    const labels = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(d);
      labels.push(
        d.toLocaleDateString("en-US", {
          month: "short",
        })
      );
    }

    const counts = months.map((m) => {
      const start = new Date(m.getFullYear(), m.getMonth(), 1);
      const end = new Date(m.getFullYear(), m.getMonth() + 1, 1);
      const uniqDays = new Set();
      (completions || []).forEach((c) => {
        const dt = new Date(c.date);
        if (dt >= start && dt < end) {
          uniqDays.add(dt.toISOString().split("T")[0]);
        }
      });
      return uniqDays.size;
    });

    return { labels, counts };
  }, [completions]);

  const percentOverTime = useMemo(() => {
    // last 28 days: cumulative completion percentage up to each day
    const windowDays = 28;
    const days = getLastNDays(windowDays);
    const labels = days.map((d) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" }));

    let completedSoFar = 0;
    const percents = days.map((d, idx) => {
      const key = d.toISOString().split("T")[0];
      if (completionDatesSet.has(key)) completedSoFar += 1;
      const expectedSoFar = (habit?.frequency || "daily") === "weekly" ? Math.max(1, Math.ceil((idx + 1) / 7)) : idx + 1;
      const pct = Math.min(Math.round((completedSoFar / expectedSoFar) * 100), 100);
      return pct;
    });

    return { labels, percents };
  }, [completionDatesSet, habit?.frequency]);

  const completionScore = useMemo(() => {
    const freq = habit?.frequency || "daily";
    const windowDays = 28;
    const days = getLastNDays(windowDays);
    const uniqueCompletedDays = days.reduce(
      (acc, d) => acc + (completionDatesSet.has(d.toISOString().split("T")[0]) ? 1 : 0),
      0
    );

    const expected = freq === "weekly" ? 4 : windowDays;
    const normalized = freq === "weekly" ? Math.min(uniqueCompletedDays, expected) : uniqueCompletedDays;
    return Math.min(Math.round((normalized / expected) * 100), 100);
  }, [habit?.frequency, completionDatesSet]);

  const habitDailyIntensityMap = useMemo(() => {
    const map = {};
    (completions || []).forEach((c) => {
      const day = String(c.date).split("T")[0];
      map[day] = (map[day] || 0) + 1;
    });
    return map;
  }, [completions]);

  const formatDate = (d) => {
    if (!d) return "";
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return "";
    return dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

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

  const longestRangeLabel = useMemo(() => {
    if (!habit?.longestStartDate || !habit?.longestEndDate) return "";
    return `${formatDate(habit.longestStartDate)} → ${formatDate(habit.longestEndDate)}`;
  }, [habit?.longestStartDate, habit?.longestEndDate]);

  const ProgressRing = ({ percent, color }) => {
    const size = 86;
    const stroke = 10;
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
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "800",
            color: palette.text,
            fontSize: "18px",
          }}
        >
          {percent}%
        </div>
      </div>
    );
  };

  const containerStyle = {
    minHeight: "100vh",
    background: palette.pageBg,
    padding: "26px 18px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  };

  const headerStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    maxWidth: "1100px",
    margin: "0 auto 16px",
    color: isDark ? palette.text : "white",
  };

  const topCardStyle = {
    maxWidth: "1100px",
    margin: "0 auto",
    background: palette.cardBg,
    borderRadius: "18px",
    border: `1px solid ${palette.cardBorder}`,
    boxShadow: isDark ? "0 22px 70px rgba(0,0,0,0.55)" : "0 18px 55px rgba(15,23,42,0.12)",
    padding: "18px",
  };

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "14px",
    marginTop: "14px",
  };

  const twoColStyle = {
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
    gap: "14px",
  };

  const cardStyle = {
    background: isDark ? "rgba(255,255,255,0.03)" : "#ffffff",
    border: isDark ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(2,6,23,0.06)",
    borderRadius: "16px",
    padding: "14px",
    boxShadow: isDark ? "0 18px 55px rgba(0,0,0,0.45)" : "0 10px 30px rgba(15,23,42,0.08)",
    transition: "transform 160ms ease, box-shadow 160ms ease",
  };

  const cardTitleStyle = {
    fontSize: "12px",
    fontWeight: "800",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    color: palette.muted,
    marginBottom: "10px",
  };

  const freqDots = (habit?.frequency || "daily") === "weekly" ? 1 : 7;

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={topCardStyle}>
          <div style={{ color: palette.muted, textAlign: "center" }}>Loading...</div>
        </div>
      </div>
    );
  }

  if (!habit) {
    return (
      <div style={containerStyle}>
        <div style={topCardStyle}>
          <div style={{ color: palette.muted, textAlign: "center" }}>Habit not found.</div>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          style={{
            padding: "10px 12px",
            borderRadius: "10px",
            border: isDark ? "1px solid rgba(255,255,255,0.14)" : "1px solid rgba(255,255,255,0.30)",
            background: isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.20)",
            color: isDark ? palette.text : "white",
            cursor: "pointer",
          }}
        >
          ← Back
        </button>

        <div style={{ fontWeight: 800, fontSize: "14px" }}>Habit Details</div>

        <button
          type="button"
          onClick={() => setThemeMode((m) => (m === "dark" ? "light" : "dark"))}
          style={{
            padding: "10px 12px",
            borderRadius: "10px",
            border: isDark ? "1px solid rgba(255,255,255,0.14)" : "1px solid rgba(255,255,255,0.30)",
            background: isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.20)",
            color: isDark ? palette.text : "white",
            cursor: "pointer",
          }}
        >
          {isDark ? "Light" : "Dark"}
        </button>
      </div>

      <div style={topCardStyle}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "14px" }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: "20px", fontWeight: "850", color: palette.text, overflow: "hidden", textOverflow: "ellipsis" }}>
              {habit.title}
            </div>
            <div style={{ marginTop: "6px", color: palette.muted, fontSize: "13px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <span>{habit.frequency === "daily" ? "Daily" : "Weekly"}</span>
              <span style={{ opacity: 0.7 }}>•</span>
              <span>🔥 Current: {habit.streak || 0}</span>
              <span style={{ opacity: 0.7 }}>•</span>
              <span>🏆 Best: {habit.longestStreak || 0}</span>
              <span style={{ opacity: 0.7 }}>•</span>
              <span>🔔 {formatTime12h(habit.reminderTime || "09:00")}</span>
            </div>
          </div>

          <ProgressRing percent={completionScore} color="#667eea" />
        </div>

        <div style={gridStyle}>
          <div style={twoColStyle}>
            <div
              style={cardStyle}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
            >
              <div style={cardTitleStyle}>Weekly</div>
              <div style={{ height: "180px" }}>
                <Line
                  data={{
                    labels: weeklySeries.labels,
                    datasets: [
                      {
                        label: "Completed",
                        data: weeklySeries.counts,
                        fill: true,
                        tension: 0.35,
                        borderColor: "#667eea",
                        backgroundColor: "rgba(102,126,234,0.20)",
                        pointRadius: 3,
                        pointHoverRadius: 4,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                      x: {
                        grid: { display: false },
                        ticks: { color: palette.muted },
                      },
                      y: {
                        beginAtZero: true,
                        grid: { color: isDark ? "rgba(255,255,255,0.10)" : "rgba(148,163,184,0.25)" },
                        ticks: { color: palette.muted, precision: 0 },
                      },
                    },
                  }}
                />
              </div>
            </div>

            <div
              style={cardStyle}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
            >
              <div style={cardTitleStyle}>Monthly</div>
              <div style={{ height: "180px" }}>
                <Bar
                  data={{
                    labels: monthlySeries.labels,
                    datasets: [
                      {
                        label: "Days completed",
                        data: monthlySeries.counts,
                        backgroundColor: "rgba(102,126,234,0.45)",
                        borderColor: "#667eea",
                        borderWidth: 1,
                        borderRadius: 8,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                      x: {
                        grid: { display: false },
                        ticks: { color: palette.muted },
                      },
                      y: {
                        beginAtZero: true,
                        grid: { color: isDark ? "rgba(255,255,255,0.10)" : "rgba(148,163,184,0.25)" },
                        ticks: { color: palette.muted, precision: 0 },
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>

          <div
            style={cardStyle}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          >
            <div style={cardTitleStyle}>Completion % over time</div>
            <div style={{ height: "190px" }}>
              <Line
                data={{
                  labels: percentOverTime.labels,
                  datasets: [
                    {
                      label: "Completion %",
                      data: percentOverTime.percents,
                      fill: true,
                      tension: 0.35,
                      borderColor: "#22c55e",
                      backgroundColor: "rgba(34,197,94,0.14)",
                      pointRadius: 0,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    x: {
                      grid: { display: false },
                      ticks: { color: palette.muted, maxTicksLimit: 8 },
                    },
                    y: {
                      beginAtZero: true,
                      max: 100,
                      grid: { color: isDark ? "rgba(255,255,255,0.10)" : "rgba(148,163,184,0.25)" },
                      ticks: { color: palette.muted, callback: (v) => `${v}%` },
                    },
                  },
                }}
              />
            </div>
          </div>

          <div style={twoColStyle}>
            <div
              style={cardStyle}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
            >
              <CalendarHeatmap
                title="Calendar"
                dateToCount={habitDailyIntensityMap}
                isDark={isDark}
                palette={palette}
              />
            </div>

            <div
              style={cardStyle}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
            >
              <div style={cardTitleStyle}>Best streak & frequency</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "10px",
                  }}
                >
                  <div
                    style={{
                      background: palette.surface,
                      border: `1px solid ${palette.cardBorder}`,
                      borderRadius: "14px",
                      padding: "12px",
                    }}
                  >
                    <div
                      style={{
                        color: palette.muted,
                        fontSize: "12px",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                      }}
                    >
                      Current streak
                    </div>
                    <div
                      style={{
                        marginTop: "6px",
                        fontSize: "22px",
                        fontWeight: 850,
                        color: palette.text,
                      }}
                    >
                      {habit.streak || 0}
                    </div>
                  </div>
                  <div
                    style={{
                      background: palette.surface,
                      border: `1px solid ${palette.cardBorder}`,
                      borderRadius: "14px",
                      padding: "12px",
                    }}
                  >
                    <div
                      style={{
                        color: palette.muted,
                        fontSize: "12px",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                      }}
                    >
                      Best streak
                    </div>
                    <div
                      style={{
                        marginTop: "6px",
                        fontSize: "22px",
                        fontWeight: 850,
                        color: palette.text,
                      }}
                    >
                      {habit.longestStreak || 0}
                    </div>
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      color: palette.muted,
                      fontSize: "12px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                    }}
                  >
                    Frequency
                  </div>
                  <div
                    style={{
                      marginTop: "10px",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <div style={{ display: "flex", gap: "8px" }}>
                      {Array.from({ length: 7 }).map((_, i) => {
                        const active = i < freqDots;
                        return (
                          <div
                            key={i}
                            style={{
                              width: "10px",
                              height: "10px",
                              borderRadius: "999px",
                              background: active ? "#667eea" : palette.surface2,
                              border: active
                                ? "1px solid rgba(255,255,255,0.18)"
                                : isDark
                                  ? "1px solid rgba(255,255,255,0.10)"
                                  : "1px solid rgba(2,6,23,0.06)",
                            }}
                          />
                        );
                      })}
                    </div>
                    <div style={{ color: palette.muted, fontSize: "13px" }}>
                      {habit.frequency === "weekly" ? "Once per week" : "Every day"}
                    </div>
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      color: palette.muted,
                      fontSize: "12px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                    }}
                  >
                    Best streak range
                  </div>
                  <div style={{ marginTop: "8px" }}>
                    <div
                      style={{
                        height: "12px",
                        borderRadius: "999px",
                        background: palette.surface2,
                        border: isDark
                          ? "1px solid rgba(255,255,255,0.10)"
                          : "1px solid rgba(2,6,23,0.06)",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${Math.min((Number(habit.longestStreak || 0) / 30) * 100, 100)}%`,
                          height: "100%",
                          background: "linear-gradient(90deg, rgba(102,126,234,0.55), #667eea)",
                          borderRadius: "999px",
                          transition: "width 300ms ease",
                        }}
                      />
                    </div>
                    <div style={{ marginTop: "8px", color: palette.muted, fontSize: "13px" }}>
                      {longestRangeLabel || "No streak range yet"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
