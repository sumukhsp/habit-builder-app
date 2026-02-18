import React, { useState } from "react";
import API from "../api/api";

function HabitForm({ refreshHabits }) {
  const [title, setTitle] = useState("");
  const [frequency, setFrequency] = useState("daily");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return alert("Title required");

    setLoading(true);
    try {
      await API.post("/habits", { title: title.trim(), frequency });
      setTitle("");
      setFrequency("daily");
      refreshHabits();
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to create habit";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, marginBottom: 16 }}>
      <input
        placeholder="Enter habit"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ flex: 1 }}
      />

      <select value={frequency} onChange={(e) => setFrequency(e.target.value)}>
        <option value="daily">daily</option>
        <option value="weekly">weekly</option>
      </select>

      <button type="submit" disabled={loading}>
        {loading ? "Adding..." : "Add"}
      </button>
    </form>
  );
}

export default HabitForm;