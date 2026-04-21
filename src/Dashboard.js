import { useEffect, useState } from "react";
import { auth, db } from "./firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import {
  doc,
  onSnapshot,
  collection,
  getDoc,
} from "firebase/firestore";

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [courses, setCourses] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [loading, setLoading] = useState(true);

  /* ================= LOAD DATA ================= */

  useEffect(() => {
    let unsubUser, unsubCourses;

    const unsubAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate("/login");
        return;
      }

      setUser(currentUser);

      /* USER DATA */
      const userRef = doc(db, "users", currentUser.uid);
      unsubUser = onSnapshot(userRef, (snap) => {
        setUserData(snap.exists() ? snap.data() : {});
      });

      /* COURSES */
      const coursesRef = collection(db, "courses");

      unsubCourses = onSnapshot(coursesRef, async (snapshot) => {
        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        list.sort((a, b) => (a.order || 0) - (b.order || 0));
        setCourses(list);

        /* LOAD PROGRESS */
        const map = {};

        await Promise.all(
          list.map(async (course) => {
            const progressId = `${currentUser.uid}_${course.id}`;
            const snap = await getDoc(doc(db, "progress", progressId));

            map[course.id] = snap.exists()
              ? snap.data()
              : { completed: false };
          })
        );

        setProgressMap(map);
        setLoading(false);
      });
    });

    return () => {
      if (unsubAuth) unsubAuth();
      if (unsubUser) unsubUser();
      if (unsubCourses) unsubCourses();
    };
  }, [navigate]);

  /* ================= STATES ================= */

  if (loading) return <div style={styles.center}>Loading...</div>;
  if (!user) return null;

  const hasAccess =
    userData?.isSubscribed === true || !!userData?.companyId;

  if (!hasAccess) {
    return (
      <div style={styles.page}>
        <h1>Dashboard</h1>
        <p>{user.email}</p>

        <div style={styles.warning}>
          <h3>🔒 Subscription Required</h3>
          <button
            onClick={() => navigate("/payment")}
            style={styles.primaryBtn}
          >
            Upgrade Now
          </button>
        </div>
      </div>
    );
  }

  /* ================= ACTIONS ================= */

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  /* ================= UI ================= */

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Dashboard</h1>
          <p style={styles.subtitle}>{user.email}</p>
        </div>

        <button onClick={handleLogout} style={styles.logout}>
          Logout
        </button>
      </div>

      {/* GRID */}
      <div style={styles.grid}>
        {/* COMPANY */}
        <div style={styles.card}>
          <h2>🏢 Company</h2>
          <p style={styles.muted}>
            {userData?.companyId
              ? "Connected to company"
              : "No company yet"}
          </p>

          <button
            onClick={() => navigate("/company")}
            style={styles.primaryBtn}
          >
            Company Dashboard
          </button>
        </div>

        {/* COURSES */}
        <div style={styles.card}>
          <h2>🎓 Training Courses</h2>

          {courses.length === 0 && (
            <p style={styles.muted}>No courses available</p>
          )}

          {courses.map((course) => {
            const progress = progressMap[course.id];
            const completed = progress?.completed;
            const percent = completed ? 100 : 0;

            return (
              <div key={course.id} style={styles.courseItem}>
                <h3>{course.title}</h3>
                <p style={styles.muted}>{course.description}</p>

                <p style={styles.muted}>Progress: {percent}%</p>

                <div style={styles.progressBar}>
                  <div
                    style={{
                      ...styles.progressFill,
                      width: `${percent}%`,
                    }}
                  />
                </div>

                <div style={{ marginTop: "10px" }}>
                  {/* 🔥 FIXED BUTTON */}
                  <button
                    onClick={() =>
                      navigate(`/training/${course.id}`)
                    }
                    style={styles.primaryBtn}
                  >
                    {completed ? "Review" : "Start"}
                  </button>

                  {completed && (
                    <button
                      onClick={() =>
                        navigate(`/certificate/${course.id}`)
                      }
                      style={styles.secondaryBtn}
                    >
                      Certificate
                    </button>
                  )}
                </div>
              </div>
            );
          })}
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

  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "40px",
  },

  title: {
    fontSize: "32px",
    fontWeight: "600",
  },

  subtitle: {
    color: "#94a3b8",
    marginTop: "5px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "20px",
  },

  card: {
    background: "#0f172a",
    padding: "25px",
    borderRadius: "12px",
  },

  courseItem: {
    marginTop: "20px",
    padding: "15px",
    background: "#020617",
    borderRadius: "8px",
  },

  muted: {
    color: "#94a3b8",
  },

  progressBar: {
    width: "100%",
    height: "8px",
    background: "#1e293b",
    borderRadius: "10px",
    marginTop: "8px",
  },

  progressFill: {
    height: "100%",
    background: "#22c55e",
    borderRadius: "10px",
  },

  primaryBtn: {
    marginTop: "10px",
    padding: "8px 12px",
    background: "#38bdf8",
    border: "none",
    borderRadius: "6px",
    color: "white",
    cursor: "pointer",
    marginRight: "10px",
  },

  secondaryBtn: {
    marginTop: "10px",
    padding: "8px 12px",
    background: "#22c55e",
    border: "none",
    borderRadius: "6px",
    color: "white",
    cursor: "pointer",
  },

  logout: {
    background: "#ef4444",
    border: "none",
    padding: "10px",
    borderRadius: "6px",
    color: "white",
    cursor: "pointer",
  },

  warning: {
    background: "#7f1d1d",
    padding: "20px",
    borderRadius: "10px",
    marginTop: "20px",
  },

  center: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
  },
};

export default Dashboard;