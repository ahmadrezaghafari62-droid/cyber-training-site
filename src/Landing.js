import { useNavigate } from "react-router-dom";

function Landing() {
  const navigate = useNavigate();

  return (
    <div style={styles.page}>
      
      {/* HERO */}
      <div style={styles.hero}>
        <h1>CyberSentinel</h1>
        <p>Reduce human cyber risk through smart training</p>

        <button style={styles.cta} onClick={() => navigate("/signup")}>
          Get Started
        </button>
      </div>

      {/* FEATURES */}
      <div style={styles.section}>
        <h2>What You Get</h2>

        <div style={styles.features}>
          <div style={styles.card}>
            <h3>🎯 Phishing Awareness</h3>
            <p>Train users to detect real-world phishing attacks</p>
          </div>

          <div style={styles.card}>
            <h3>🔐 Password Security</h3>
            <p>Build strong authentication habits</p>
          </div>

          <div style={styles.card}>
            <h3>🧠 Social Engineering</h3>
            <p>Understand manipulation techniques attackers use</p>
          </div>
        </div>
      </div>

      {/* VALUE */}
      <div style={styles.section}>
        <h2>Why CyberSentinel?</h2>
        <p>
          90% of cyber breaches involve human error.  
          CyberSentinel helps organisations reduce that risk.
        </p>
      </div>

      {/* PRICING */}
      <div style={styles.section}>
        <h2>Simple Pricing</h2>

        <div style={styles.pricing}>
          <h1>£5</h1>
          <p>per user / month</p>

          <button style={styles.cta} onClick={() => navigate("/signup")}>
            Start Now
          </button>
        </div>
      </div>

      {/* CTA */}
      <div style={styles.section}>
        <h2>Start Securing Your Team Today</h2>

        <button style={styles.cta} onClick={() => navigate("/signup")}>
          Create Account
        </button>
      </div>

    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  page: {
    background: "#020617",
    color: "white",
    minHeight: "100vh",
    padding: "40px",
    textAlign: "center",
  },
  hero: {
    marginBottom: "60px",
  },
  section: {
    marginTop: "60px",
  },
  features: {
    display: "flex",
    gap: "20px",
    justifyContent: "center",
    flexWrap: "wrap",
    marginTop: "20px",
  },
  card: {
    background: "#0f172a",
    padding: "20px",
    borderRadius: "10px",
    width: "250px",
  },
  pricing: {
    background: "#0f172a",
    padding: "30px",
    borderRadius: "10px",
    display: "inline-block",
  },
  cta: {
    marginTop: "20px",
    padding: "12px 20px",
    background: "#38bdf8",
    border: "none",
    borderRadius: "6px",
    color: "white",
    cursor: "pointer",
    fontSize: "16px",
  },
};

export default Landing;