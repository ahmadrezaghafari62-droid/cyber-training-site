import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div style={{
      background: "#020617",
      minHeight: "100vh",
      color: "white",
      fontFamily: "Arial"
    }}>

      {/* NAVBAR */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "20px 40px",
        alignItems: "center"
      }}>
        <h2>CyberSentinel</h2>

        <div>
          <button onClick={() => navigate("/login")} style={btnSecondary}>
            Login
          </button>

          <button onClick={() => navigate("/signup")} style={btnPrimary}>
            Get Started
          </button>
        </div>
      </div>

      {/* HERO SECTION */}
      <div style={{
        textAlign: "center",
        padding: "80px 20px"
      }}>
        <h1 style={{ fontSize: "42px" }}>
          Protect Your Organisation from Human Cyber Risk
        </h1>

        <p style={{ color: "#94a3b8", marginTop: "20px", fontSize: "18px" }}>
          Train employees. Track behaviour. Reduce phishing and social engineering risks.
        </p>

        <button
          onClick={() => navigate("/signup")}
          style={{ ...btnPrimary, marginTop: "30px", fontSize: "18px" }}
        >
          Start Free Trial
        </button>
      </div>

      {/* FEATURES */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "20px",
        padding: "40px"
      }}>
        <Feature title="Training Modules" text="Interactive cybersecurity awareness courses" />
        <Feature title="Phishing Simulation" text="Test real-world employee behaviour" />
        <Feature title="Progress Tracking" text="Monitor employee performance and improvement" />
        <Feature title="Admin Dashboard" text="Get insights into organisational risk levels" />
      </div>

      {/* PRICING */}
      <div style={{ textAlign: "center", padding: "60px 20px" }}>
        <h2>Simple Pricing</h2>

        <div style={{
          background: "#0f172a",
          padding: "30px",
          marginTop: "20px",
          display: "inline-block",
          borderRadius: "10px"
        }}>
          <h3>£5 / user / month</h3>

          <p style={{ color: "#94a3b8", marginTop: "10px" }}>
            Full access to all features
          </p>

          <button
            onClick={() => navigate("/payment")}
            style={{ ...btnPrimary, marginTop: "20px" }}
          >
            Upgrade Now
          </button>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{
        textAlign: "center",
        padding: "20px",
        color: "#64748b"
      }}>
        © 2026 CyberSentinel. All rights reserved.
      </div>

    </div>
  );
}

/* COMPONENTS */

function Feature({ title, text }) {
  return (
    <div style={{
      background: "#0f172a",
      padding: "20px",
      borderRadius: "10px"
    }}>
      <h3>{title}</h3>
      <p style={{ color: "#94a3b8" }}>{text}</p>
    </div>
  );
}

/* BUTTON STYLES */

const btnPrimary = {
  padding: "10px 20px",
  background: "#38bdf8",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  marginLeft: "10px"
};

const btnSecondary = {
  padding: "10px 20px",
  background: "transparent",
  border: "1px solid #38bdf8",
  color: "#38bdf8",
  borderRadius: "5px",
  cursor: "pointer"
};

export default Home;