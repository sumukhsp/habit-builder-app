import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/api";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await API.post("/auth/login", formData);
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      const msg = err?.response?.data?.message || "Login failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const containerStyle = {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
    padding: "20px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  };

  const cardStyle = {
    display: "flex",
    borderRadius: "20px",
    overflow: "hidden",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
    maxWidth: "1000px",
    width: "100%",
    background: "#1a1a2e",
  };

  const leftSectionStyle = {
    flex: 1,
    background: `linear-gradient(135deg, rgba(138, 43, 226, 0.3), rgba(75, 0, 130, 0.3)), 
                  url('https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&q=80')`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    padding: "60px 40px",
    color: "white",
    minHeight: "600px",
    position: "relative",
  };

  const motivationalStyle = {
    fontSize: "32px",
    fontWeight: "700",
    lineHeight: "1.4",
    textShadow: "0 4px 12px rgba(0, 0, 0, 0.5)",
  };

  const rightSectionStyle = {
    flex: 1,
    padding: "60px 40px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    background: "#16213e",
  };

  const titleStyle = {
    fontSize: "28px",
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: "30px",
    textAlign: "left",
  };

  const formStyle = {
    display: "grid",
    gap: "16px",
  };

  const inputStyle = {
    padding: "14px 16px",
    border: "1.5px solid #2d3748",
    borderRadius: "10px",
    background: "#0f3460",
    color: "#ffffff",
    fontSize: "14px",
    transition: "all 0.3s ease",
    fontFamily: "inherit",
  };

  const buttonStyle = {
    padding: "14px 24px",
    background: "linear-gradient(135deg, #8a2be2, #6b1fb8)",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    marginTop: "20px",
    boxShadow: "0 4px 15px rgba(138, 43, 226, 0.4)",
  };

  const signupLinkStyle = {
    fontSize: "14px",
    color: "#cbd5e0",
    marginTop: "16px",
    textAlign: "center",
  };

  const linkStyle = {
    color: "#8a2be2",
    textDecoration: "none",
    fontWeight: "600",
    cursor: "pointer",
  };

  const errorStyle = {
    padding: "12px",
    background: "rgba(239, 68, 68, 0.1)",
    border: "1px solid #ef4444",
    borderRadius: "8px",
    color: "#fca5a5",
    fontSize: "14px",
    marginBottom: "16px",
    textAlign: "left",
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        {/* Left Section */}
        <div style={leftSectionStyle}>
          <div style={motivationalStyle}>
            Build Better Habits Every Day
          </div>
        </div>

        {/* Right Section */}
        <div style={rightSectionStyle}>
          <h2 style={titleStyle}>Welcome Back</h2>

          {error && <div style={errorStyle}>{error}</div>}

          <form onSubmit={handleLogin} style={formStyle}>
            <input
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "#8a2be2")}
              onBlur={(e) => (e.target.style.borderColor = "#2d3748")}
              required
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "#8a2be2")}
              onBlur={(e) => (e.target.style.borderColor = "#2d3748")}
              required
            />

            <button
              type="submit"
              disabled={loading}
              style={buttonStyle}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 6px 20px rgba(138, 43, 226, 0.6)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 15px rgba(138, 43, 226, 0.4)";
              }}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div style={signupLinkStyle}>
            Don't have an account?{" "}
            <Link to="/signup" style={linkStyle}>
              Signup
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;