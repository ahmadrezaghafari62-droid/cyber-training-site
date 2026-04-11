import { useState } from "react";
import { auth, db } from "./firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function Signup() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    company: "",
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  /* ================================
     🔄 HANDLE INPUT CHANGE
  ================================= */

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  /* ================================
     🔐 SIGNUP FUNCTION
  ================================= */

  const signup = async () => {
    const { email, password, company } = formData;

    if (!email || !password || !company) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      // 🔥 Create Auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password.trim()
      );

      const user = userCredential.user;

      // 🔥 Create Firestore user document
      await setDoc(doc(db, "users", user.uid), {
        email: email.trim(),
        company: company.trim(),

        // 🚀 Subscription logic
        role: "free",
        isSubscribed: false,
        trialActive: true,
        subscriptionStatus: "trial",

        // 📊 Future analytics
        riskScore: 0,
        quizzesCompleted: 0,

        createdAt: serverTimestamp(),
      });

      console.log("✅ User created:", user.uid);

      // ✅ Better UX (no blocking alert)
      navigate("/dashboard");

    } catch (err) {
      console.error("🔥 Signup Error:", err);

      // Clean user-friendly errors
      switch (err.code) {
        case "auth/email-already-in-use":
          alert("Email already registered");
          break;
        case "auth/weak-password":
          alert("Password must be at least 6 characters");
          break;
        case "auth/network-request-failed":
          alert("Network error — check your internet");
          break;
        case "auth/unauthorized-domain":
          alert("Domain not authorised in Firebase");
          break;
        default:
          alert("Something went wrong. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  /* ================================
     🎨 UI
  ================================= */

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2>Create Account</h2>

        <p style={styles.subtitle}>
          Start your cybersecurity journey
        </p>

        <input
          name="company"
          placeholder="Company Name"
          value={formData.company}
          onChange={handleChange}
          style={styles.input}
        />

        <input
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          style={styles.input}
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          style={styles.input}
        />

        <button
          onClick={signup}
          disabled={loading}
          style={{
            ...styles.button,
            background: loading ? "#64748b" : "#38bdf8",
          }}
        >
          {loading ? "Creating..." : "Create Account"}
        </button>

        <p style={styles.footerText}>
          Already have an account?{" "}
          <span
            style={styles.link}
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}

/* ================================
   🎨 STYLES
================================ */

const styles = {
  page: {
    background: "#020617",
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "white",
  },

  card: {
    background: "rgba(15, 23, 42, 0.9)",
    padding: "40px",
    borderRadius: "12px",
    width: "350px",
    textAlign: "center",
    border: "1px solid #1e293b",
  },

  subtitle: {
    color: "#94a3b8",
    marginBottom: "20px",
  },

  input: {
    width: "100%",
    padding: "12px",
    margin: "10px 0",
    borderRadius: "6px",
    border: "1px solid #1e293b",
    background: "#020617",
    color: "white",
  },

  button: {
    width: "100%",
    padding: "12px",
    marginTop: "15px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "16px",
  },

  footerText: {
    marginTop: "15px",
    color: "#94a3b8",
  },

  link: {
    color: "#38bdf8",
    cursor: "pointer",
  },
};

export default Signup;