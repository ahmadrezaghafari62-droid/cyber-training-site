import { useEffect, useState } from "react";
import { auth, db } from "./firebase";
import { useNavigate } from "react-router-dom";
import {
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

function CompanyDashboard() {
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [progressData, setProgressData] = useState({});
  const [loading, setLoading] = useState(true);

  /* ================= LOAD COMPANY DATA ================= */

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;

      if (!user) {
        navigate("/login");
        return;
      }

      try {
        // 🔥 GET CURRENT USER COMPANY
        const usersSnap = await getDocs(
          query(collection(db, "users"), where("companyId", "!=", null))
        );

        const users = usersSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setEmployees(users);

        // 🔥 GET PROGRESS FOR ALL USERS
        const progressSnap = await getDocs(collection(db, "progress"));

        const progressMap = {};

        progressSnap.docs.forEach((doc) => {
          const data = doc.data();
          const { userId, courseId, completed } = data;

          if (!progressMap[userId]) {
            progressMap[userId] = [];
          }

          progressMap[userId].push({
            courseId,
            completed,
          });
        });

        setProgressData(progressMap);
        setLoading(false);

      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  /* ================= HELPERS ================= */

  const getCompletion = (userId) => {
    const userProgress = progressData[userId] || [];

    if (userProgress.length === 0) return 0;

    const completed = userProgress.filter((p) => p.completed).length;

    return Math.round((completed / userProgress.length) * 100);
  };

  const getRiskLevel = (percent) => {
    if (percent === 100) return "Low Risk";
    if (percent >= 50) return "Medium Risk";
    return "High Risk";
  };

  /* ================= LOADING ================= */

  if (loading) {
    return <div style={styles.center}>Loading company data...</div>;
  }

  /* ================= COMPANY STATS ================= */

  const avg =
    employees.length > 0
      ? Math.round(
          employees.reduce(
            (sum, u) => sum + getCompletion(u.id),
            0
          ) / employees.length
        )
      : 0;

  /* ================= UI ================= */

  return (
    <div style={styles.page}>
      <h1>🏢 Company Dashboard</h1>

      {/* COMPANY METRIC */}
      <div style={styles.card}>
        <h2>📊 Company Completion</h2>
        <h1>{avg}%</h1>
      </div>

      {/* EMPLOYEES */}
      <div style={styles.card}>
        <h2>👥 Employees</h2>

        {employees.map((emp) => {
          const percent = getCompletion(emp.id);
          const risk = getRiskLevel(percent);

          return (
            <div key={emp.id} style={styles.employee}>
              <div>
                <p>{emp.email}</p>
                <p style={styles.muted}>
                  {percent}% • {risk}
                </p>
              </div>

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

  card: {
    background: "#0f172a",
    padding: "25px",
    borderRadius: "12px",
    marginTop: "20px",
  },

  employee: {
    marginTop: "15px",
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
    background: "#38bdf8",
    borderRadius: "10px",
  },

  center: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
  },
};

export default CompanyDashboard;