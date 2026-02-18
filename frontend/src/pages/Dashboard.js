import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

export default function Dashboard() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("User");
  const [habits, setHabits] = useState([]);
  const [completions, setCompletions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dailyGoalPercentage, setDailyGoalPercentage] = useState(0);

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
      const todayCompletions = statsRes.data.completions?.filter(
        (c) => c.date?.split("T")[0] === today
      ) || [];
      const percentage =
        habitsRes.data.length > 0
          ? Math.round((todayCompletions.length / habitsRes.data.length) * 100)
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

  const getWeekDays = () => {
    const days = [];
    const current = new Date(selectedDate);
    const first = current.getDate() - current.getDay();

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
      (c) => c.habitId === habitId && c.date.split("T")[0] === dateStr
    );
  };

  const getCompletionCountForHabit = (habitId) => {
    return completions.filter((c) => c.habitId === habitId).length;
  };

  const handleMarkComplete = async (habitId) => {
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

  const containerStyle = {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    padding: "30px 20px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  };

  const headerStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
    color: "white",
  };

  const greetingStyle = {
    fontSize: "24px",
    fontWeight: "600",
  };

  const navButtonStyle = {
    padding: "10px 20px",
    background: "rgba(255, 255, 255, 0.2)",
    color: "white",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    borderRadius: "8px",
    cursor: "pointer",
    marginLeft: "10px",
    transition: "all 0.3s ease",
  };

  const cardStyle = {
    background: "white",
    borderRadius: "20px",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
    padding: "40px",
    maxWidth: "1400px",
    margin: "0 auto",
  };

  const topSectionStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
    paddingBottom: "20px",
    borderBottom: "1px solid #eee",
  };

  const datePickerStyle = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "14px",
    color: "#666",
  };

  const dateSmallStyle = {
    fontSize: "12px",
    fontWeight: "500",
  };

  const mainGridStyle = {
    display: "grid",
    gridTemplateColumns: "1fr 350px",
    gap: "30px",
  };

  const leftSectionStyle = {
    background: "#f8f9fa",
    borderRadius: "15px",
    padding: "25px",
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

  const habitGridStyle = {
    display: "grid",
    gap: "15px",
  };

  const habitRowStyle = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    paddingBottom: "12px",
    borderBottom: "1px solid #e0e0e0",
  };

  const habitNameStyle = {
    width: "80px",
    fontWeight: "600",
    fontSize: "13px",
    color: "#333",
    overflow: "hidden",
    textOverflow: "ellipsis",
  };

  const daysGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: "8px",
    flex: 1,
  };

  const dayBoxStyle = (completed, color) => ({
    width: "30px",
    height: "30px",
    borderRadius: "6px",
    background: completed ? color : "#e0e0e0",
    opacity: completed ? 1 : 0.3,
    cursor: "pointer",
    transition: "all 0.2s ease",
  });

  const dayHeaderStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: "8px",
    marginBottom: "10px",
  };

  const dayLabelStyle = {
    textAlign: "center",
    fontWeight: "600",
    fontSize: "12px",
    color: "#999",
    padding: "0 0 8px 0",
  };

  const statisticsStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  };

  const statBoxStyle = {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    padding: "20px",
    borderRadius: "12px",
    textAlign: "center",
  };

  const statNumberStyle = {
    fontSize: "32px",
    fontWeight: "700",
    marginBottom: "5px",
  };

  const statLabelStyle = {
    fontSize: "13px",
    opacity: 0.9,
  };

  const habitCardStyle = (color) => ({
    background: "white",
    borderLeft: `4px solid ${color}`,
    padding: "15px",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    flex: 1,
  });

  const habitCardTitleStyle = {
    fontWeight: "600",
    marginBottom: "8px",
    fontSize: "14px",
    color: "#333",
  };

  const habitCardCountStyle = {
    fontSize: "12px",
    color: "#999",
    marginBottom: "10px",
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
          <p style={{ textAlign: "center", color: "#999" }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div style={greetingStyle}>
          👋 Hey there, {userName.split(" ")[0]}
        </div>
        <div>
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
            <div style={{ fontSize: "18px", fontWeight: "600", color: "#333" }}>
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
              <div style={{ fontSize: "13px", color: "#999", marginBottom: "3px" }}>
                Weekly Progress
              </div>
              <div style={{ fontSize: "22px", fontWeight: "700", color: "#667eea" }}>
                {habits.length > 0
                  ? Math.round(
                      (completions.filter((c) => {
                        const weekStart = new Date(weekDays[0]);
                        const weekEnd = new Date(weekDays[6]);
                        const compDate = new Date(c.date);
                        return compDate >= weekStart && compDate <= weekEnd;
                      }).length /
                        (habits.length * 7)) *
                        100
                    )
                  : 0}
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

            {/* Habits Grid */}
            <div style={habitGridStyle}>
              {habits.length > 0 ? (
                habits.map((habit) => (
                  <div key={habit._id} style={habitRowStyle}>
                    <div style={habitNameStyle}>{habit.name}</div>
                    <div style={daysGridStyle}>
                      {weekDays.map((day, index) => (
                        <div
                          key={index}
                          style={dayBoxStyle(
                            isHabitCompletedOnDate(habit._id, day),
                            colorMap[habit._id]
                          )}
                          title={day.toLocaleDateString()}
                        />
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ color: "#999", textAlign: "center", marginTop: "20px" }}>
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
              <div style={statBoxStyle}>
                <div style={statNumberStyle}>{dailyGoalPercentage}%</div>
                <div style={statLabelStyle}>daily goal achieved</div>
              </div>
              <div style={statBoxStyle}>
                <div style={statNumberStyle}>{habits.length}</div>
                <div style={statLabelStyle}>total habits</div>
              </div>
            </div>

            {/* Habit List */}
            {habits.length > 0 ? (
              habits.map((habit) => (
                <div
                  key={habit._id}
                  style={habitCardStyle(colorMap[habit._id])}
                >
                  <div style={habitCardTitleStyle}>{habit.name}</div>
                  <div style={habitCardCountStyle}>
                    {getCompletionCountForHabit(habit._id)} completions
                  </div>
                  <button
                    style={completeButtonStyle}
                    onClick={() => handleMarkComplete(habit._id)}
                    onMouseEnter={(e) => (e.target.opacity = "0.9")}
                    onMouseLeave={(e) => (e.target.opacity = "1")}
                  >
                    Mark Complete
                  </button>
                </div>
              ))
            ) : (
              <p style={{ color: "#999", textAlign: "center" }}>
                No habits to display
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}