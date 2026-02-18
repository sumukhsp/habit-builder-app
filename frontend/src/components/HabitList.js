import React, { useState } from "react";
import API from "../api/api";

function HabitRow({ habit, onChanged }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(habit.title);
  const [frequency, setFrequency] = useState(habit.frequency || "daily");
  const [loading, setLoading] = useState(false);

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

  const save = async () => {
    setLoading(true);
    try {
      await API.put(`/habits/${habit._id}`, { title: title.trim(), frequency });
      setEditing(false);
      onChanged();
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to update habit";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const remove = async () => {
    if (!window.confirm("Delete this habit?")) return;
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

  return (
    <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8, display: "grid", gap: 10 }}>
      {editing ? (
        <>
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
          <select value={frequency} onChange={(e) => setFrequency(e.target.value)}>
            <option value="daily">daily</option>
            <option value="weekly">weekly</option>
          </select>
        </>
      ) : (
        <>
          <div style={{ fontWeight: 600 }}>{habit.title}</div>
          <div style={{ opacity: 0.7 }}>Frequency: {habit.frequency}</div>
        </>
      )}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={markComplete} disabled={loading}>
          Complete
        </button>

        {editing ? (
          <>
            <button onClick={save} disabled={loading}>
              Save
            </button>
            <button onClick={() => setEditing(false)} disabled={loading}>
              Cancel
            </button>
          </>
        ) : (
          <button onClick={() => setEditing(true)} disabled={loading}>
            Edit
          </button>
        )}

        <button onClick={remove} disabled={loading}>
          Delete
        </button>
      </div>
    </div>
  );
}

function HabitList({ habits, refreshHabits }) {
  if (!habits?.length) return <p>No habits yet. Add one above.</p>;

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {habits.map((habit) => (
        <HabitRow key={habit._id} habit={habit} onChanged={refreshHabits} />
      ))}
    </div>
  );
}

export default HabitList;