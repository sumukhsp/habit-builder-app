import { useEffect, useMemo, useState } from "react";

export default function CalendarHeatmap({
  title,
  dateToCount,
  isDark,
  palette,
  initialMonth,
  onMonthChange,
}) {
  const [month, setMonth] = useState(() => {
    if (initialMonth) {
      const d = new Date(initialMonth);
      return new Date(d.getFullYear(), d.getMonth(), 1);
    }
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  useEffect(() => {
    if (!onMonthChange) return;
    onMonthChange(month);
  }, [month, onMonthChange]);

  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const grid = useMemo(() => {
    const start = new Date(month.getFullYear(), month.getMonth(), 1);
    const end = new Date(month.getFullYear(), month.getMonth() + 1, 0);

    const startMonIndex = (start.getDay() + 6) % 7;
    const gridStart = new Date(start);
    gridStart.setDate(start.getDate() - startMonIndex);
    gridStart.setHours(0, 0, 0, 0);

    const endMonIndex = (end.getDay() + 6) % 7;
    const gridEnd = new Date(end);
    gridEnd.setDate(end.getDate() + (6 - endMonIndex));
    gridEnd.setHours(0, 0, 0, 0);

    const days = [];
    for (
      let d = new Date(gridStart);
      d <= gridEnd;
      d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)
    ) {
      days.push(new Date(d));
    }

    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    return { weeks, start, end };
  }, [month]);

  const maxCount = useMemo(() => {
    let max = 0;
    grid.weeks.forEach((week) => {
      week.forEach((d) => {
        const key = d.toISOString().split("T")[0];
        const v = Number(dateToCount?.[key] || 0);
        if (v > max) max = v;
      });
    });
    return max;
  }, [dateToCount, grid.weeks]);

  const getLevel = (count) => {
    if (!count) return 0;
    if (maxCount <= 1) return 4;
    const ratio = count / maxCount;
    if (ratio >= 0.8) return 4;
    if (ratio >= 0.55) return 3;
    if (ratio >= 0.3) return 2;
    return 1;
  };

  const levelColor = (level) => {
    if (level === 0) return palette.surface2;
    if (level === 1) return isDark ? "rgba(102,126,234,0.22)" : "rgba(102,126,234,0.18)";
    if (level === 2) return isDark ? "rgba(102,126,234,0.38)" : "rgba(102,126,234,0.32)";
    if (level === 3) return isDark ? "rgba(102,126,234,0.60)" : "rgba(102,126,234,0.52)";
    return "#667eea";
  };

  const headerStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    marginBottom: "10px",
  };

  const titleStyle = {
    fontSize: "12px",
    fontWeight: 800,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    color: palette.muted,
  };

  const navStyle = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: palette.muted,
    fontSize: "13px",
  };

  const navBtnStyle = {
    width: "28px",
    height: "28px",
    borderRadius: "10px",
    border: isDark ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(2,6,23,0.08)",
    background: isDark ? "rgba(255,255,255,0.06)" : "rgba(2,6,23,0.04)",
    color: palette.text,
    cursor: "pointer",
  };

  const gridWrapStyle = {
    overflowX: "auto",
    paddingBottom: "2px",
  };

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: `70px repeat(${grid.weeks.length}, 1fr)`,
    gap: "10px",
    alignItems: "start",
    minWidth: "680px",
  };

  const dayLabelColStyle = {
    display: "grid",
    gridTemplateRows: "repeat(7, 1fr)",
    gap: "8px",
    paddingTop: "22px",
  };

  const dayLabelStyle = {
    fontSize: "11px",
    color: palette.muted,
    textAlign: "left",
    height: "14px",
    display: "flex",
    alignItems: "center",
  };

  const weekColStyle = {
    display: "grid",
    gridTemplateRows: "22px repeat(7, 1fr)",
    gap: "8px",
    alignItems: "center",
  };

  const monthLabelStyle = {
    fontSize: "11px",
    color: palette.muted,
    textAlign: "center",
    height: "22px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const cellStyle = (bg) => ({
    width: "14px",
    height: "14px",
    borderRadius: "5px",
    background: bg,
    border: isDark ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(2,6,23,0.06)",
    transition: "transform 120ms ease, filter 120ms ease",
  });

  return (
    <div>
      <div style={headerStyle}>
        <div style={titleStyle}>{title || "Calendar heatmap"}</div>
        <div style={navStyle}>
          <button
            type="button"
            style={navBtnStyle}
            onClick={() => setMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
          >
            ←
          </button>
          <div style={{ minWidth: "120px", textAlign: "center" }}>
            {month.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </div>
          <button
            type="button"
            style={navBtnStyle}
            onClick={() => setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
          >
            →
          </button>
        </div>
      </div>

      <div style={gridWrapStyle}>
        <div style={gridStyle}>
          <div style={dayLabelColStyle}>
            {dayLabels.map((d) => (
              <div key={d} style={dayLabelStyle}>
                {d}
              </div>
            ))}
          </div>

          {grid.weeks.map((week, wIdx) => {
            const firstOfWeek = week[0];
            const monthLabel =
              firstOfWeek.getDate() <= 7
                ? firstOfWeek.toLocaleDateString("en-US", { month: "short" })
                : "";

            return (
              <div key={wIdx} style={weekColStyle}>
                <div style={monthLabelStyle}>{monthLabel}</div>
                {week.map((d) => {
                  const key = d.toISOString().split("T")[0];
                  const count = Number(dateToCount?.[key] || 0);
                  const level = getLevel(count);
                  const bg = levelColor(level);
                  const isInMonth = d.getMonth() === month.getMonth();

                  return (
                    <div
                      key={key}
                      title={`${d.toLocaleDateString()} • ${count} completion${count === 1 ? "" : "s"}`}
                      style={{
                        ...cellStyle(bg),
                        opacity: isInMonth ? 1 : 0.35,
                        filter: isInMonth ? "none" : "grayscale(10%)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "scale(1.12)";
                        e.currentTarget.style.filter = "brightness(1.05)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scale(1)";
                        e.currentTarget.style.filter = isInMonth ? "none" : "grayscale(10%)";
                      }}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
