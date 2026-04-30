import { useEffect, useState } from "react";
import { auth, db } from "./firebase";
import { useNavigate } from "react-router-dom";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";

function CompanyDashboard() {
  const navigate = useNavigate();

  const [company, setCompany] = useState(null);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [employees, setEmployees] = useState([]);
  const [progressData, setProgressData] = useState({});
  const [loading, setLoading] = useState(true);

  /* ================= LOAD DATA ================= */

  const loadCompanyData = async () => {
    const user = auth.currentUser;

    if (!user) {
      navigate("/login");
      return;
    }

    try {
      import { onSnapshot } from "firebase/firestore";

onSnapshot(doc(db, "users", user.uid), (userSnap) => {
  const userData = userSnap.data();

  if (!userData?.companyId) {
    setLoading(false);
    return;
  }

  loadCompany(userData.companyId);
});
      const userData = userSnap.data();

      if (!userData?.companyId) {
        setLoading(false);
        return;
      }

      // COMPANY
      const companySnap = await getDoc(
        doc(db, "companies", userData.companyId)
      );

      setCompany({
        id: userData.companyId,
        ...companySnap.data(),
      });

      // EMPLOYEES
      const q = query(
        collection(db, "users"),
        where("companyId", "==", userData.companyId)
      );

      const usersSnap = await getDocs(q);

      const users = usersSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setEmployees(users);

      // PROGRESS
      const progressSnap = await getDocs(collection(db, "progress"));

      const progressMap = {};

      progressSnap.docs.forEach((doc) => {
        const data = doc.data();
        const { userId, courseId, completed } = data;

        if (!progressMap[userId]) {
          progressMap[userId] = [];
        }

        progressMap[userId].push({ courseId, completed });
      });

      setProgressData(progressMap);
      setLoading(false);

    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanyData();
  }, []);

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

  /* ================= ADD EMPLOYEE ================= */

  const addEmployee = async () => {
    const user = auth.currentUser;

    if (!user || !email) return;

    if (email === user.email) {
      setMessage("❌ You cannot add yourself");
      return;
    }

    try {
      const q = query(
        collection(db, "users"),
        where("email", "==", email)
      );

      const snap = await getDocs(q);

      if (snap.empty) {
        setMessage("❌ User not found");
        return;
      }

      const userDoc = snap.docs[0];

      await setDoc(
        doc(db, "users", userDoc.id),
        { companyId: company.id },
        { merge: true }
      );

      setMessage("✅ Employee added successfully");
      setEmail("");

      // 🔥 refresh employees instantly
      loadCompanyData();

    } catch (err) {
      console.error(err);
      setMessage("❌ Error adding employee");
    }
  };

  /* ================= LOADING ================= */

  if (loading) {
    return <div style={styles.center}>Loading company data...</div>;
  }

  if (!company) {
    return (
      <div style={styles.page}>
        <h1>No company found</h1>
        <p>You are not part of a company yet.</p>
      </div>
    );
  }

  /* ================= COMPANY METRICS ================= */

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
      <h1>🏢 {company.name || "Company Dashboard"}</h1>

      {/* COMPANY METRIC */}
      <div style={styles.card}>
        <h2>📊 Company Completion</h2>
        <h1>{avg}%</h1>
      </div>

      {/* ADD EMPLOYEE */}
      <div style={styles.card}>
        <h2>➕ Add Employee</h2>

        <input
          type="email"
          placeholder="Enter employee email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />

        <button onClick={addEmployee} style={styles.primaryBtn}>
          Add Employee
        </button>

        {message && <p style={styles.muted}>{message}</p>}
      </div>

      {/* EMPLOYEES */}
      <div style={styles.card}>
        <h2>👥 Employees ({employees.length})</h2>

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
  input: {
    width: "100%",
    padding: "10px",
    marginTop: "10px",
    borderRadius: "6px",
    border: "1px solid #38bdf8",
    background: "#020617",
    color: "white",
  },
  primaryBtn: {
    marginTop: "10px",
    padding: "10px",
    background: "#38bdf8",
    border: "none",
    borderRadius: "6px",
    color: "white",
    cursor: "pointer",
  },
  muted: {
    color: "#94a3b8",
    marginTop: "10px",
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
    color: "white",
  },
};

export default CompanyDashboard;