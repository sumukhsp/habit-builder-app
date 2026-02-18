import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalHabits: 0,
    totalCompletions: 0,
    streaks: [],
  });
  const [loading, setLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await API.get("/dashboard/stats");
      setStats(res.data);
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to load dashboard";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ maxWidth: 720, margin: "30px auto" }}>
      <div style={{ display: "flex", gap: 10, justifyContent: "space-between", alignItems: "center" }}>
        <h2>Dashboard</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => navigate("/habits")}>Habits</button>
          <button onClick={logout}>Logout</button>
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <p>Total Habits: {stats.totalHabits}</p>
          <p>Total Completions: {stats.totalCompletions}</p>

          <h3>Streaks</h3>
          {stats.streaks?.length ? (
            <div style={{ display: "grid", gap: 10 }}>
              {stats.streaks.map((s) => (
                <div key={s._id} style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
                  <div>HabitId: {s.habitId}</div>
                  <div>Current: {s.currentStreak}</div>
                  <div>Longest: {s.longestStreak}</div>
                </div>
              ))}
            </div>
          ) : (
            <p>No streaks yet.</p>
          )}
        </>
      )}
    </div>
  );
}