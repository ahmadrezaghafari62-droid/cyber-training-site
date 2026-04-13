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

  /* ================= LOAD USER ================= */

  useEffect(() => {
    let unsubUser;
    let unsubProgress;

    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        navigate("/login");
        return;
      }

      setUser(currentUser); // ✅ FIXED

      /* 🔥 USER DATA */
      const userRef = doc(db, "users", currentUser.uid);

      unsubUser = onSnapshot(userRef, (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          console.log("🔥 USER DATA:", data);
          setUserData(data);
        }
      });

      /* 🔥 PROGRESS */
      const progressRef = doc(db, "progress", currentUser.uid);

      unsubProgress = onSnapshot(
        progressRef,
        async (snap) => {
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
        },
        (err) => {
          console.error("🔥 Firestore error:", err);
          setLoading(false);
        }
      );
    });

    return () => {
      unsubAuth();
      if (unsubUser) unsubUser();
      if (unsubProgress) unsubProgress();
    };
  }, [navigate]);

  /* ================= RISK SCORE ================= */

  let totalScore = 0;
  let totalPossible = 0;

  Object.values(progress || {}).forEach((course) => {
    if (!course?.score || !course?.total) return;
    totalScore += course.score;
    totalPossible += course.total;
  });

  const avg =
    totalPossible > 0
      ? Math.round((totalScore / totalPossible) * 100)
      : 0;

  const isSubscribed = userData?.isSubscribed === true;

  /* ================= ACTIONS ================= */

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  /* 🔥 STRIPE CHECKOUT */
  const handleUpgrade = async () => {
    console.log("🚀 Upgrade clicked");

    if (!user) {
      alert("User not loaded yet");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/create-checkout-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.uid,
          email: user.email,
        }),
      });

      console.log("🔥 STATUS:", res.status);

      const data = await res.json();

      console.log("🔥 RESPONSE:", data);

      if (!res.ok) {
        throw new Error(data?.error || "Checkout failed");
      }

      if (!data.url) {
        throw new Error("No checkout URL");
      }

      window.location.href = data.url;

    } catch (err) {
      console.error("❌ Checkout error:", err);
      alert(`Payment failed:\n\n${err.message}`);
    }
  };

  /* 🔥 BILLING PORTAL */
  const handleManageSubscription = async () => {
    try {
      const res = await fetch(`${API_URL}/create-portal-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.uid,
        }),
      });

      const data = await res.json();

      if (!data.url) {
        throw new Error("No portal URL");
      }

      window.location.href = data.url;

    } catch (err) {
      console.error("❌ Portal error:", err);
      alert("Failed to open billing portal");
    }
  };

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div style={styles.center}>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={styles.center}>
        <p>Authenticating...</p>
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

      <div style={styles.card}>
        <h2>Risk Score</h2>
        <h1>{avg}%</h1>
      </div>

      {!isSubscribed ? (
        <div style={styles.warning}>
          <h3>🔒 Subscription Required</h3>
          <p>You need to upgrade to access training.</p>

          <button onClick={handleUpgrade} style={styles.upgradeBtn}>
            Upgrade Now
          </button>
        </div>
      ) : (
        <div style={styles.card}>
          <h3>✅ Subscription Active</h3>

          <button onClick={handleManageSubscription} style={styles.button}>
            Manage Subscription
          </button>
        </div>
      )}

      <div style={styles.card}>
        <h2>Start Your Training</h2>

        <div style={styles.buttonRow}>
          {["phishing", "passwords", "social"].map((course) => (
            <button
              key={course}
              onClick={() =>
                isSubscribed
                  ? navigate(`/training/${course}`)
                  : handleUpgrade()
              }
              style={styles.button}
            >
              {course === "phishing"
                ? "Phishing Awareness"
                : course === "passwords"
                ? "Password Security"
                : "Social Engineering"}
            </button>
          ))}
        </div>
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
    background: "#020617",
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "white",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  email: {
    color: "#94a3b8",
    marginTop: "10px",
  },
  card: {
    marginTop: "30px",
    padding: "25px",
    background: "#0f172a",
    borderRadius: "12px",
    border: "1px solid #1e293b",
  },
  warning: {
    marginTop: "20px",
    padding: "20px",
    background: "#7f1d1d",
    borderRadius: "10px",
  },
  upgradeBtn: {
    marginTop: "10px",
    padding: "10px",
    background: "#38bdf8",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    color: "white",
  },
  buttonRow: {
    marginTop: "20px",
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  button: {
    padding: "12px",
    background: "#38bdf8",
    border: "none",
    borderRadius: "6px",
    color: "white",
    cursor: "pointer",
  },
  logout: {
    background: "red",
    border: "none",
    padding: "10px 15px",
    borderRadius: "6px",
    color: "white",
    cursor: "pointer",
  },
};

export default Dashboard;