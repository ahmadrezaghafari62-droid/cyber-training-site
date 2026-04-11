import { useState } from "react";
import { auth } from "./firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const login = async () => {
    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    setLoading(true);

    try {
      await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password.trim()
      );

      navigate("/dashboard");

    } catch (err) {
      if (err.code === "auth/user-not-found") {
        alert("User not found");
      } else if (err.code === "auth/wrong-password") {
        alert("Wrong password");
      } else if (err.code === "auth/invalid-email") {
        alert("Invalid email");
      } else {
        alert("Login failed");
      }
    }

    setLoading(false);
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={{ marginBottom: "10px" }}>Welcome Back</h2>

        <p style={styles.subtitle}>
          Login to your CyberSentinel account
        </p>

        <input
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={styles.input}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={styles.input}
        />

        <button
          onClick={login}
          disabled={loading}
          style={styles.button}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p style={{ marginTop: "15px", color: "#94a3b8" }}>
          Don’t have an account?{" "}
          <span
            style={styles.link}
            onClick={() => navigate("/signup")}
          >
            Sign up
          </span>
        </p>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  page: {
    background: "#020617",
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "white"
  },

  card: {
    background: "rgba(15, 23, 42, 0.9)",
    padding: "40px",
    borderRadius: "12px",
    width: "350px",
    textAlign: "center",
    border: "1px solid #1e293b"
  },

  subtitle: {
    color: "#94a3b8",
    marginBottom: "20px"
  },

  input: {
    width: "100%",
    padding: "12px",
    margin: "10px 0",
    borderRadius: "6px",
    border: "1px solid #1e293b",
    background: "#020617",
    color: "white"
  },

  button: {
    width: "100%",
    padding: "12px",
    marginTop: "15px",
    background: "#38bdf8",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer"
  },

  link: {
    color: "#38bdf8",
    cursor: "pointer"
  }
};

export default Login;