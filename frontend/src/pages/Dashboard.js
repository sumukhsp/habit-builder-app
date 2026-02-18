import { useEffect, useState } from "react";
import API from "../api/api";

export default function Dashboard() {

  const [stats, setStats] = useState({
    totalHabits: 0,
    totalCompletions: 0,
    streaks: []
  });

  useEffect(() => {
    const token = localStorage.getItem("token");

    // Call API only if logged in
    if (token) {
      fetchStats();
    }
  }, []);

  const fetchStats = async () => {
    try {
      const res = await API.get("/dashboard/stats");
      setStats(res.data);
    } catch (err) {
      console.log("Dashboard API error:", err);
    }
  };

  return (
    <div>
      <h2>Dashboard</h2>

      <p>Total Habits: {stats.totalHabits}</p>
      <p>Total Completions: {stats.totalCompletions}</p>

      <h3>Streaks</h3>
      {stats.streaks && stats.streaks.map((s, index) => (
        <div key={index}>
          <p>Current: {s.currentStreak}</p>
          <p>Longest: {s.longestStreak}</p>
        </div>
      ))}
    </div>
  );
}
