import { useEffect, useState } from "react";
import { db, auth } from "./firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function Admin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState(null);

  const navigate = useNavigate();

  /* ================= LOAD COMPANY ================= */

  useEffect(() => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      navigate("/login");
      return;
    }

    // 🔥 Get user's companyId first
    const userRef = collection(db, "users");

    const unsubscribeUser = onSnapshot(userRef, (snapshot) => {
      const current = snapshot.docs.find(
        (doc) => doc.id === currentUser.uid
      );

      if (current) {
        const data = current.data();
        setCompanyId(data.companyId);
      }
    });

    return () => unsubscribeUser();
  }, [navigate]);

  /* ================= LOAD USERS ================= */

  useEffect(() => {
    if (!companyId) return;

    const q = query(
      collection(db, "users"),
      where("companyId", "==", companyId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setUsers(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [companyId]);

  /* ================= UI ================= */

  if (loading) {
    return (
      <div style={styles.center}>
        <p>Loading company data...</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <h1>🏢 Company Admin Dashboard</h1>

      <div style={styles.card}>
        <h2>👥 Employees</h2>

        {users.length === 0 ? (
          <p>No users found</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Email</th>
                <th>Role</th>
              </tr>
            </thead>

            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.email}</td>
                  <td>{u.role || "user"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <button onClick={() => navigate("/dashboard")} style={styles.button}>
        Back to Dashboard
      </button>
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
  card: {
    marginTop: "30px",
    padding: "20px",
    background: "#0f172a",
    borderRadius: "10px",
  },
  table: {
    width: "100%",
    marginTop: "20px",
    borderCollapse: "collapse",
  },
  button: {
    marginTop: "20px",
    padding: "10px",
    background: "#38bdf8",
    border: "none",
    borderRadius: "6px",
    color: "white",
    cursor: "pointer",
  },
};

export default Admin;