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
  onSnapshot,
  updateDoc,
} from "firebase/firestore";

function CompanyDashboard() {
  const navigate = useNavigate();

  const [company, setCompany] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [progressData, setProgressData] = useState({});
  const [courses, setCourses] = useState([]);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  // 🔔 Notifications
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  /* ================= LOAD DATA ================= */

  useEffect(() => {
    const user = auth.currentUser;

    if (!user) {
      navigate("/login");
      return;
    }

    let unsubNotif = null;

    const load = async () => {
      try {
        const userSnap = await getDoc(doc(db, "users", user.uid));
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
        const usersSnap = await getDocs(
          query(
            collection(db, "users"),
            where("companyId", "==", userData.companyId)
          )
        );

        setEmployees(
          usersSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
        );

        // COURSES
        const coursesSnap = await getDocs(collection(db, "courses"));
        setCourses(
          coursesSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
        );

        // PROGRESS
        const progressSnap = await getDocs(collection(db, "progress"));

        const map = {};
        progressSnap.docs.forEach((d) => {
          const data = d.data();
          if (!map[data.userId]) map[data.userId] = [];
          map[data.userId].push(data);
        });

        setProgressData(map);

        // 🔔 NOTIFICATIONS (REAL-TIME)
        const notifRef = query(
          collection(db, "notifications"),
          where("userId", "==", user.uid)
        );

        unsubNotif = onSnapshot(notifRef, (snap) => {
          setNotifications(
            snap.docs.map((d) => ({ id: d.id, ...d.data() }))
          );
        });

        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    load();

    return () => {
      if (unsubNotif) unsubNotif();
    };
  }, [navigate]);

  /* ================= HELPERS ================= */

  const getCompletion = (userId) => {
    const data = progressData[userId] || [];
    if (!data.length) return 0;

    const completed = data.filter((p) => p.completed).length;
    return Math.round((completed / data.length) * 100);
  };

  const getRiskLevel = (p) => {
    if (p === 100) return "Low Risk";
    if (p >= 50) return "Medium Risk";
    return "High Risk";
  };

  const getCourseStatus = (userId, courseId) => {
    const data = progressData[userId] || [];
    const record = data.find((p) => p.courseId === courseId);

    if (!record) return "Not Started";
    if (record.completed) return "Completed";
    return "In Progress";
  };

  /* ================= FILTER ================= */

  const filteredEmployees = employees
    .map((emp) => {
      const percent = getCompletion(emp.id);
      return {
        ...emp,
        percent,
        risk: getRiskLevel(percent),
      };
    })
    .filter((emp) => {
      if (filter === "ALL") return true;
      if (filter === "HIGH") return emp.risk === "High Risk";
      if (filter === "MEDIUM") return emp.risk === "Medium Risk";
      if (filter === "LOW") return emp.risk === "Low Risk";
    })
    .sort((a, b) => a.percent - b.percent);

  /* ================= ACTIONS ================= */

  const addEmployee = async () => {
    const user = auth.currentUser;
    if (!user || !email) return;

    try {
      const snap = await getDocs(
        query(collection(db, "users"), where("email", "==", email))
      );

      if (snap.empty) {
        setMessage("❌ User not found");
        return;
      }

      const userDoc = snap.docs[0];

      await setDoc(
        doc(db, "users", userDoc.id),
        { companyId: company.id, role: "employee" },
        { merge: true }
      );

      setMessage("✅ Employee added");
      setEmail("");
    } catch (err) {
      console.error(err);
      setMessage("❌ Error adding employee");
    }
  };

  const markAsRead = async (id) => {
    await updateDoc(doc(db, "notifications", id), {
      read: true,
    });
  };

  /* ================= UI ================= */

  if (loading) return <div style={styles.center}>Loading...</div>;
  if (!company) return <div style={styles.page}>No company found</div>;

  const avg =
    employees.length > 0
      ? Math.round(
          employees.reduce(
            (sum, u) => sum + getCompletion(u.id),
            0
          ) / employees.length
        )
      : 0;

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.header}>
        <h1>🏢 {company.name}</h1>

        {/* 🔔 BELL */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() =>
              setShowNotifications(!showNotifications)
            }
            style={styles.bell}
          >
            🔔
            {unreadCount > 0 && (
              <span style={styles.badge}>{unreadCount}</span>
            )}
          </button>

          {showNotifications && (
            <div style={styles.dropdown}>
              {notifications.map((n) => (
                <div
                  key={n.id}
                  style={styles.notificationItem}
                  onClick={() => markAsRead(n.id)}
                >
                  <p>{n.message}</p>
                  {!n.read && <span>• New</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* METRIC */}
      <div style={styles.card}>
        <h2>📊 Company Completion</h2>
        <h1>{avg}%</h1>
      </div>

      {/* FILTER */}
      <div style={styles.card}>
        <h2>🎯 Filter</h2>
        <button onClick={() => setFilter("ALL")}>All</button>
        <button onClick={() => setFilter("HIGH")}>High</button>
        <button onClick={() => setFilter("MEDIUM")}>Medium</button>
        <button onClick={() => setFilter("LOW")}>Low</button>
      </div>

      {/* EMPLOYEES */}
      <div style={styles.card}>
        {filteredEmployees.map((emp) => (
          <div key={emp.id} style={styles.employee}>
            <p>{emp.email}</p>
            <p>
              {emp.percent}% • {emp.risk}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  page: { padding: "40px", color: "white", background: "#020617" },
  header: { display: "flex", justifyContent: "space-between" },
  card: { background: "#0f172a", padding: "20px", marginTop: "20px" },
  employee: { marginTop: "10px" },
  center: { display: "flex", justifyContent: "center", height: "100vh" },

  bell: { fontSize: "20px", background: "transparent", color: "white" },
  badge: { background: "red", borderRadius: "50%", padding: "2px 6px" },
  dropdown: {
    position: "absolute",
    top: "30px",
    right: 0,
    background: "#0f172a",
    padding: "10px",
  },
  notificationItem: { padding: "5px", cursor: "pointer" },
};

export default CompanyDashboard;