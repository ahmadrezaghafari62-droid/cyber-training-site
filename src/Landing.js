import { useNavigate } from "react-router-dom";

function Landing() {
  const navigate = useNavigate();

  return (
    <div style={styles.page}>

      {/* ================= HERO ================= */}
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>
          CyberSentinel <span style={{ color: "#38bdf8" }}>HQ</span>
        </h1>

        <p style={styles.heroSubtitle}>
          Reduce human cyber risk through smart, interactive training.
        </p>

        <button style={styles.ctaPrimary} onClick={() => navigate("/signup")}>
          Get Started
        </button>
      </div>

      {/* ================= FEATURES ================= */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>What You Get</h2>

        <div style={styles.grid}>
          <Card
            title="🎯 Phishing Awareness"
            desc="Train users to detect real-world phishing attacks"
          />
          <Card
            title="🔐 Password Security"
            desc="Build strong authentication habits"
          />
          <Card
            title="🧠 Social Engineering"
            desc="Understand attacker manipulation techniques"
          />
        </div>
      </div>

      {/* ================= VALUE ================= */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Why CyberSentinel?</h2>

        <p style={styles.text}>
          90% of cyber breaches involve human error. CyberSentinel helps
          organisations reduce that risk through targeted training and insights.
        </p>
      </div>

      {/* ================= PRICING ================= */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Simple Pricing</h2>

        <div style={styles.pricingCard}>
          <h1 style={styles.price}>£5</h1>
          <p style={styles.priceText}>per user / month</p>

          <button
            style={{ ...styles.ctaPrimary, width: "100%", marginTop: "20px" }}
            onClick={() => navigate("/signup")}
          >
            Start Now
          </button>
        </div>
      </div>

      {/* ================= CTA ================= */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>
          Start Securing Your Team Today
        </h2>

        <button style={styles.ctaPrimary} onClick={() => navigate("/signup")}>
          Create Account
        </button>
      </div>

      {/* ================= FOOTER ================= */}
      <div style={styles.footer}>
        © 2026 CyberSentinel <span style={{ color: "#38bdf8" }}>HQ</span> — Built for modern organisations
      </div>

    </div>
  );
}

/* ================= COMPONENT ================= */

function Card({ title, desc }) {
  return (
    <div style={styles.card}>
      <h3>{title}</h3>
      <p style={styles.cardText}>{desc}</p>
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
    marginBottom: "80px",
  },

  heroTitle: {
    fontSize: "56px",
    fontWeight: "700",
    letterSpacing: "-1px",
    lineHeight: "1.1",
  },

  heroSubtitle: {
    marginTop: "20px",
    fontSize: "18px",
    color: "#94a3b8",
  },

  section: {
    marginTop: "80px",
  },

  sectionTitle: {
    fontSize: "30px",
    fontWeight: "600",
  },

  text: {
    marginTop: "20px",
    color: "#94a3b8",
    maxWidth: "600px",
    marginInline: "auto",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
    marginTop: "40px",
  },

  card: {
    background: "#0f172a",
    padding: "25px",
    borderRadius: "12px",
  },

  cardText: {
    color: "#94a3b8",
    marginTop: "10px",
  },

  pricingCard: {
    background: "#0f172a",
    padding: "40px",
    borderRadius: "12px",
    width: "300px",
    margin: "30px auto",
  },

  price: {
    fontSize: "42px",
    fontWeight: "700",
  },

  priceText: {
    color: "#94a3b8",
  },

  ctaPrimary: {
    marginTop: "20px",
    padding: "14px 24px",
    background: "#38bdf8",
    border: "none",
    borderRadius: "8px",
    color: "white",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "500",
  },

  footer: {
    marginTop: "100px",
    paddingTop: "30px",
    borderTop: "1px solid #1e293b",
    color: "#94a3b8",
  },
};

export default Landing;