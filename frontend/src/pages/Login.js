import React, { useState } from "react";
import API from "../api/api";

function Login(){

  const [formData,setFormData]=useState({
    email:"",
    password:""
  });

  const handleChange=(e)=>{
    setFormData({...formData,[e.target.name]:e.target.value});
  };

  const handleLogin=async(e)=>{
    e.preventDefault();

    try{
      const res = await API.post("/auth/login",formData);

      localStorage.setItem("token",res.data.token);

      window.location.href="/dashboard";

    }catch(err){
      console.log(err.response?.data || err);
      alert("Login failed");
    }
  };

  return(
    <div>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input name="email" placeholder="Email" onChange={handleChange}/>
        <input name="password" type="password" placeholder="Password" onChange={handleChange}/>
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;
