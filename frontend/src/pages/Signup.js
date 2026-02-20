import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/api";

export default function Signup() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth <= 768);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!firstName || !lastName || !email || !password) {
      setError("All fields are required");
      return;
    }
    
    if (!agreeTerms) {
      setError("Please agree to Terms & Conditions");
      return;
    }

    setLoading(true);
    try {
      const name = `${firstName} ${lastName}`;
      await API.post("/auth/signup", { name, email, password });
      alert("Signup success. Please login.");
      navigate("/");
    } catch (err) {
      const msg = err?.response?.data?.message || "Signup failed";
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
    flexDirection: isMobile ? "column" : "row",
    borderRadius: "20px",
    overflow: "hidden",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
    maxWidth: "1000px",
    width: "100%",
    background: "#1a1a2e",
  };

  const leftSectionStyle = {
    flex: 1,
    background: "linear-gradient(135deg, rgba(138, 43, 226, 0.28), rgba(75, 0, 130, 0.35))",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: isMobile ? "36px 24px" : "60px 44px",
    color: "white",
    minHeight: isMobile ? "320px" : "600px",
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
    padding: isMobile ? "36px 24px" : "60px 40px",
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

  const nameRowStyle = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
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

  const checkboxRowStyle = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginTop: "8px",
  };

  const checkboxStyle = {
    width: "20px",
    height: "20px",
    cursor: "pointer",
    accentColor: "#8a2be2",
  };

  const checkboxLabelStyle = {
    fontSize: "14px",
    color: "#cbd5e0",
    cursor: "pointer",
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

  const loginLinkStyle = {
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
          <h2 style={titleStyle}>Create an account</h2>

          {error && <div style={errorStyle}>{error}</div>}

          <form onSubmit={handleSignup} style={formStyle}>
            <div style={nameRowStyle}>
              <input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#8a2be2")}
                onBlur={(e) => (e.target.style.borderColor = "#2d3748")}
                required
              />
              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#8a2be2")}
                onBlur={(e) => (e.target.style.borderColor = "#2d3748")}
                required
              />
            </div>

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "#8a2be2")}
              onBlur={(e) => (e.target.style.borderColor = "#2d3748")}
              required
            />

            <input
              type="password"
              placeholder="Create password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "#8a2be2")}
              onBlur={(e) => (e.target.style.borderColor = "#2d3748")}
              required
            />

            <div style={checkboxRowStyle}>
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                style={checkboxStyle}
                id="terms"
              />
              <label htmlFor="terms" style={checkboxLabelStyle}>
                I agree to the Terms & Conditions
              </label>
            </div>

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
              {loading ? "Creating..." : "Create account"}
            </button>
          </form>

          <div style={loginLinkStyle}>
            Already have an account?{" "}
            <Link to="/" style={linkStyle}>
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}