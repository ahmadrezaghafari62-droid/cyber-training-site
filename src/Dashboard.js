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

  /* ================= HELPERS ================= */

  const getPercentage = (score, total) => {
    if (!total) return 0;
    return Math.round((score / total) * 100);
  };

  const getCoursesOnly = () =>
    Object.entries(progress).filter(
      ([_, v]) =>
        v &&
        typeof v.score === "number" &&
        typeof v.total === "number"
    );

  /* ================= CREATE COMPANY ================= */

  const handleCreateCompany = async () => {
    console.log("🔥 CLICKED");

    if (!user) return;

    try {
      const companyRef = doc(db, "companies", user.uid);

      await setDoc(companyRef, {
        companyName: "My Company",
        ownerId: user.uid,
        createdAt: new Date(),
      });

      await setDoc(
        doc(db, "users", user.uid),
        {
          companyId: user.uid,
          role: "admin",
        },
        { merge: true }
      );

      alert("✅ Company created!");
    } catch (err) {
      console.error("🔥 ERROR:", err);
      alert("Error creating company");
    }
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
        if (snap.exists()) {
          const data = snap.data();
          console.log("USER DATA:", data);
          setUserData(data);
        } else {
          setUserData({});
        }
      });

      const progressRef = doc(db, "progress", currentUser.uid);

      unsubProgress = onSnapshot(progressRef, async (snap) => {
        if (snap.exists()) {
          setProgress(snap.data());
        } else {
          const defaultProgress = {
            phishing: { score: 0, total: 2 },
            passwords: { score: 0, total: 1 },
            social: { score: 0, total: 1 },
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

  const totalScore = courses.reduce((sum, [_, c]) => sum + c.score, 0);
  const totalPossible = courses.reduce((sum, [_, c]) => sum + c.total, 0);

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

  /* ================= STATES ================= */

  if (loading) return <div style={styles.center}>Loading...</div>;
  if (!user) return <div style={styles.center}>Authenticating...</div>;

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

      {/* ✅ COMPANY ALWAYS VISIBLE */}
      <div style={styles.card}>
        <h2>🏢 Company</h2>

        <p style={{ color: "#94a3b8" }}>
          Company ID: {userData?.companyId || "None"}
        </p>

        {!userData?.companyId && (
          <button onClick={handleCreateCompany} style={styles.button}>
            Create Company
          </button>
        )}
      </div>

      <button onClick={() => navigate("/admin")} style={styles.button}>
  Go to Company Dashboard
</button>

      {/* RISK */}
      <div style={styles.card}>
        <h2>Risk Score</h2>
        <h1>{avg}%</h1>

        <p style={{ color: "#22c55e" }}>{riskLevel} Risk</p>
      </div>

      {/* PROGRESS */}
      <div style={styles.card}>
        <h2>📊 Training Progress</h2>

        <p>Overall: {overallProgress}%</p>

        <div style={styles.progressBar}>
          <div
            style={{ ...styles.progressFill, width: `${overallProgress}%` }}
          />
        </div>

        {courses.map(([key, value]) => {
          const percent = getPercentage(value.score, value.total);

          return (
            <div key={key} style={{ marginTop: "20px" }}>
              <p>{key.toUpperCase()} — {percent}%</p>

              <div style={styles.progressBar}>
                <div
                  style={{
                    ...styles.progressFill,
                    width: `${percent}%`,
                  }}
                />
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