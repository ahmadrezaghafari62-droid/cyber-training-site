import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

function Home() {
  const navigate = useNavigate();

  return (
    <div style={styles.page}>

      {/* ================= NAVBAR ================= */}
      <div style={styles.navbar}>
        <h2>🛡️ CyberSentinel</h2>

        <div>
          <button onClick={() => navigate("/login")} style={styles.navBtn}>
            Login
          </button>
          <button onClick={() => navigate("/signup")} style={styles.primaryBtn}>
            Get Started
          </button>
        </div>
      </div>

      {/* ================= HERO ================= */}
      <motion.div
        style={styles.hero}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 style={styles.heroTitle}>
          Human Risk is Your Biggest Cyber Threat
        </h1>

        <p style={styles.heroSubtitle}>
          Train employees, measure risk, and strengthen your organisation’s security posture.
        </p>

        <button
          onClick={() => navigate("/signup")}
          style={styles.primaryBtnLarge}
        >
          Start Free Trial
        </button>
      </motion.div>

      {/* ================= FEATURES ================= */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Powerful Features</h2>

        <div style={styles.grid}>
          <AnimatedCard title="🎯 Interactive Training" desc="Real-world cyber scenarios" />
          <AnimatedCard title="📊 Risk Intelligence" desc="Identify high-risk users instantly" />
          <AnimatedCard title="⚡ Analytics" desc="Track team performance live" />
        </div>
      </div>

      {/* ================= HOW IT WORKS ================= */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>How It Works</h2>

        <div style={styles.grid}>
          <Step number="1" title="Create Account" desc="Sign up and set up your organisation in seconds." />
          <Step number="2" title="Train Your Team" desc="Assign interactive cybersecurity training modules." />
          <Step number="3" title="Track & Improve" desc="Monitor risk levels and improve employee awareness." />
        </div>
      </div>

      {/* ================= TESTIMONIALS ================= */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Trusted by Professionals</h2>

        <div style={styles.grid}>
          <Testimonial text="CyberSentinel transformed how we train staff." author="IT Manager, London" />
          <Testimonial text="Simple, powerful, and effective." author="Security Lead, FinTech" />
          <Testimonial text="Finally a platform that focuses on human risk." author="Cyber Consultant" />
        </div>
      </div>

      {/* ================= PRICING ================= */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Simple Pricing</h2>

        <motion.div style={styles.pricingCard} whileHover={{ scale: 1.05 }}>
          <h3>Pro Plan</h3>
          <h1 style={{ fontSize: "40px" }}>£5</h1>
          <p>/user/month</p>

          <button
            onClick={() => navigate("/signup")}
            style={{ ...styles.primaryBtnLarge, width: "100%", marginTop: "20px" }}
          >
            Start Free Trial
          </button>
        </motion.div>
      </div>

      {/* ================= FINAL CTA ================= */}
      <div style={styles.cta}>
        <h2 style={styles.ctaTitle}>Ready to Reduce Human Cyber Risk?</h2>

        <p style={styles.ctaText}>
          Start your free trial today and protect your organisation.
        </p>

        <button
          onClick={() => navigate("/signup")}
          style={styles.primaryBtnLarge}
        >
          🚀 Start Free Trial
        </button>
      </div>

      {/* ================= FOOTER ================= */}
      <div style={styles.footer}>
        © 2026 CyberSentinel — Built for modern organisations
      </div>

    </div>
  );
}

/* ================= COMPONENTS ================= */

function AnimatedCard({ title, desc }) {
  return (
    <motion.div style={styles.card} whileHover={{ y: -5 }}>
      <h3>{title}</h3>
      <p style={{ color: "#94a3b8" }}>{desc}</p>
    </motion.div>
  );
}

function Testimonial({ text, author }) {
  return (
    <motion.div style={styles.card}>
      <p>"{text}"</p>
      <p style={{ marginTop: "10px", color: "#38bdf8" }}>— {author}</p>
    </motion.div>
  );
}

function Step({ number, title, desc }) {
  return (
    <div style={styles.card}>
      <h3>{number}. {title}</h3>
      <p style={{ color: "#94a3b8" }}>{desc}</p>
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  page: {
    background: "#020617",
    color: "white",
    minHeight: "100vh"
  },

  navbar: {
    display: "flex",
    justifyContent: "space-between",
    padding: "20px 40px"
  },

  hero: {
    textAlign: "center",
    padding: "120px 20px"
  },

  heroTitle: {
    fontSize: "48px"
  },

  heroSubtitle: {
    marginTop: "20px",
    color: "#94a3b8"
  },

  section: {
    padding: "80px 40px",
    textAlign: "center"
  },

  sectionTitle: {
    fontSize: "28px"
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
    marginTop: "40px"
  },

  card: {
    background: "#0f172a",
    padding: "25px",
    borderRadius: "12px"
  },

  pricingCard: {
    background: "#0f172a",
    padding: "40px",
    borderRadius: "12px",
    width: "320px",
    margin: "30px auto"
  },

  cta: {
    padding: "80px 20px",
    textAlign: "center"
  },

  ctaTitle: {
    fontSize: "32px"
  },

  ctaText: {
    marginTop: "15px",
    color: "#94a3b8"
  },

  primaryBtn: {
    background: "#38bdf8",
    border: "none",
    padding: "10px 20px",
    borderRadius: "6px",
    marginLeft: "10px"
  },

  primaryBtnLarge: {
    background: "#38bdf8",
    border: "none",
    padding: "14px 30px",
    borderRadius: "8px",
    marginTop: "20px"
  },

  navBtn: {
    background: "transparent",
    border: "1px solid #38bdf8",
    padding: "10px 20px",
    borderRadius: "6px",
    color: "white"
  },

  footer: {
    textAlign: "center",
    padding: "30px",
    borderTop: "1px solid #1e293b",
    color: "#94a3b8"
  }
};

export default Home;