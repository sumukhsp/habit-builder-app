import React, { useEffect, useState } from "react";
import API from "../api/api";
import HabitForm from "../components/HabitForm";
import HabitList from "../components/HabitList";

function Habits(){

  const [habits,setHabits] = useState([]);

  const fetchHabits = async ()=>{
    try{
      const res = await API.get("/habits");
      setHabits(res.data);
    }catch(err){
      console.log(err);
    }
  };

  useEffect(()=>{
    fetchHabits();
  },[]);

  return(
    <div>
      <h2>My Habits</h2>

      <HabitForm refreshHabits={fetchHabits}/>
      <HabitList habits={habits} refreshHabits={fetchHabits}/>
    </div>
  );
}

export default Habits;
