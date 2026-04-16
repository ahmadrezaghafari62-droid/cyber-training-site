import { useEffect, useState } from "react";
import { auth, db } from "./firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { doc, onSnapshot, setDoc } from "firebase/firestore";

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [progress, setProgress] = useState({});
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = "https://cybersentinel-backend-ezpt.onrender.com";

  /* ================= HELPERS ================= */

  const getPercentage = (score, total) => {
    if (!total || total === 0) return 0;
    return Math.round((score / total) * 100);
  };

  const getCoursesOnly = () => {
    Object.entries(progress)
  .filter(
    ([key, value]) =>
      value && typeof value.score === "number" && typeof value.total === "number"
  )
  .map(([key, value]) => {
        value && typeof value.score === "number" && typeof value.total === "number"
    );
  };

  /* ================= LOAD USER ================= */

  useEffect(() => {
    let unsubUser;
    let unsubProgress;

    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        navigate("/login");
        return;
      }

      setUser(currentUser);

      const userRef = doc(db, "users", currentUser.uid);
      unsubUser = onSnapshot(userRef, (snap) => {
        if (snap.exists()) setUserData(snap.data());
      });

      const progressRef = doc(db, "progress", currentUser.uid);
      unsubProgress = onSnapshot(progressRef, async (snap) => {
        if (snap.exists()) {
          setProgress(snap.data());
        } else {
          const defaultProgress = {
            phishing: { score: 0, total: 5 },
            passwords: { score: 0, total: 5 },
            social: { score: 0, total: 5 },
          };

          await setDoc(progressRef, defaultProgress);
          setProgress(defaultProgress);
        }

        setLoading(false);
      });
    });

    return () => {
      unsubAuth();
      if (unsubUser) unsubUser();
      if (unsubProgress) unsubProgress();
    };
  }, [navigate]);

  /* ================= CALCULATIONS ================= */

  const courses = getCoursesOnly();

  let totalScore = 0;
  let totalPossible = 0;

  courses.forEach(([_, course]) => {
    totalScore += course.score;
    totalPossible += course.total;
  });

  const avg =
    totalPossible > 0
      ? Math.round((totalScore / totalPossible) * 100)
      : 0;

  let riskLevel = "Low";
  if (avg < 40) riskLevel = "High";
  else if (avg < 70) riskLevel = "Medium";

  const overallProgress =
    courses.length > 0
      ? Math.round(
          courses.reduce(
            (sum, [_, c]) => sum + getPercentage(c.score, c.total),
            0
          ) / courses.length
        )
      : 0;

  const isSubscribed = userData?.isSubscribed === true;

  /* ================= ACTIONS ================= */

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  /* ================= LOADING ================= */

  if (loading) {
    return <div style={styles.center}>Loading...</div>;
  }

  if (!user) {
    return <div style={styles.center}>Authenticating...</div>;
  }

  /* ================= LOCK ================= */

  if (!isSubscribed) {
    return (
      <div style={styles.page}>
        <h1>Dashboard</h1>
        <p>{user.email}</p>

        <div style={styles.warning}>
          <h3>🔒 Subscription Required</h3>
          <button onClick={() => navigate("/payment")} style={styles.button}>
            Upgrade Now
          </button>
        </div>
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1>Dashboard</h1>
        <button onClick={handleLogout} style={styles.logout}>
          Logout
        </button>
      </div>

      <p style={styles.email}>{user.email}</p>

      {/* RISK */}
      <div style={styles.card}>
        <h2>Risk Score</h2>
        <h1>{avg}%</h1>

        <p style={{
          color:
            riskLevel === "High"
              ? "#ef4444"
              : riskLevel === "Medium"
              ? "#f59e0b"
              : "#22c55e"
        }}>
          {riskLevel} Risk
        </p>

        {/* COMPLETION MESSAGE */}
        {courses.length > 0 &&
          courses.every(([_, c]) => c.score === c.total) && (
            <p style={{ color: "#22c55e", marginTop: "10px" }}>
              🎉 Training Complete!
            </p>
          )}
      </div>

      {/* PROGRESS */}
      <div style={styles.card}>
        <h2>📊 Training Progress</h2>

        <p>Overall: {overallProgress}%</p>
        <div style={styles.progressBar}>
          <div style={{ ...styles.progressFill, width: `${overallProgress}%` }} />
        </div>

        {courses.map(([key, value]) => {
          const percent = getPercentage(value.score, value.total);

          return (
            <div key={key} style={{ marginTop: "20px" }}>
              <p>{key.toUpperCase()} — {percent}%</p>
              <div style={styles.progressBar}>
                <div style={{ ...styles.progressFill, width: `${percent}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* TRAINING */}
      <div style={styles.card}>
        <h2>Start Training</h2>

        {["phishing", "passwords", "social"].map((course) => (
          <button
            key={course}
            onClick={() => navigate(`/training/${course}`)}
            style={styles.button}
          >
            {course}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  page: {
    background: "#020617",
    minHeight: "100vh",
    color: "white",
    padding: "40px",
  },
  center: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    color: "white",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
  },
  email: {
    color: "#94a3b8",
  },
  card: {
    marginTop: "30px",
    padding: "25px",
    background: "#0f172a",
    borderRadius: "12px",
  },
  warning: {
    background: "#7f1d1d",
    padding: "20px",
    borderRadius: "10px",
  },
  button: {
    marginTop: "10px",
    padding: "10px",
    background: "#38bdf8",
    border: "none",
    borderRadius: "6px",
    color: "white",
    cursor: "pointer",
  },
  logout: {
    background: "red",
    padding: "10px",
    borderRadius: "6px",
    color: "white",
    border: "none",
  },
  progressBar: {
    width: "100%",
    height: "10px",
    background: "#1e293b",
    borderRadius: "6px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: "#22c55e",
    transition: "width 0.4s ease",
  },
};

export default Dashboard;