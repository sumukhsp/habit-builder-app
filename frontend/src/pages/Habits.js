import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import HabitForm from "../components/HabitForm";
import HabitList from "../components/HabitList";

function Habits() {
  const navigate = useNavigate();
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div style={{ maxWidth: 720, margin: "30px auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>My Habits</h2>
        <button onClick={() => navigate("/dashboard")}>Dashboard</button>
      </div>

      <HabitForm refreshHabits={fetchHabits} />

      {loading ? <p>Loading...</p> : <HabitList habits={habits} refreshHabits={fetchHabits} />}
    </div>
  );
}

export default Habits;