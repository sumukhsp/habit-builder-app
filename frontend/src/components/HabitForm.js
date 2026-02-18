import React, { useState } from "react";
import API from "../api/api";

function HabitForm({ refreshHabits }) {

  const [title,setTitle] = useState("");

  const handleSubmit = async (e)=>{
    e.preventDefault();

    try{
      await API.post("/habits",{ title });
      setTitle("");
      refreshHabits();
    }catch(err){
      console.log(err);
    }
  };

  return(
    <form onSubmit={handleSubmit}>
      <input
        placeholder="Enter habit"
        value={title}
        onChange={(e)=>setTitle(e.target.value)}
      />
      <button type="submit">Add Habit</button>
    </form>
  );
}

export default HabitForm;
