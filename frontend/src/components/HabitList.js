import React from "react";
import API from "../api/api";

function HabitList({ habits, refreshHabits }){

  const markComplete = async (id)=>{
    try{
      await API.post("/completion/complete",{ habitId:id });
      refreshHabits();
    }catch(err){
      console.log(err);
    }
  };

  return(
    <div>
      {habits.map(habit=>(
        <div key={habit._id}>
          {habit.title}
          <button onClick={()=>markComplete(habit._id)}>
            Complete
          </button>
        </div>
      ))}
    </div>
  );
}

export default HabitList;
