import { useEffect, useState } from "react";
import { db, auth } from "./firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
  getDocs,
  setDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function Admin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState(null);
  const [inviteEmail, setInviteEmail] = useState("");

  const navigate = useNavigate();

  /* ================= INVITE USER ================= */

  const handleInvite = async () => {
    if (!inviteEmail) return alert("Enter email");

    try {
      const q = query(
        collection(db, "users"),
        where("email", "==", inviteEmail)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        alert("User not found. They must sign up first.");
        return;
      }

      const userDoc = snapshot.docs[0];

      await setDoc(
        doc(db, "users", userDoc.id),
        {
          companyId: companyId,
          role: "user",
        },
        { merge: true }
      );

      alert("✅ User added to company!");
      setInviteEmail("");
    } catch (err) {
      console.error(err);
      alert("Error inviting user");
    }
  };

  /* ================= LOAD COMPANY ================= */

  useEffect(() => {
    const fetchCompany = async () => {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        navigate("/login");
        return;
      }

      try {
        const userRef = doc(db, "users", currentUser.uid);
        const snap = await getDoc(userRef);

        if (snap.exists()) {
          setCompanyId(snap.data().companyId);
        }
      } catch (err) {
        console.error("Error loading company:", err);
      }
    };

    fetchCompany();
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

        {/* 🔥 INVITE SECTION (ALWAYS VISIBLE) */}
        <div style={styles.inviteBox}>
          <input
            type="email"
            placeholder="Enter employee email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            style={styles.input}
          />

          <button onClick={handleInvite} style={styles.button}>
            Invite User
          </button>
        </div>

        {/* 🔥 TABLE */}
        {users.length === 0 ? (
          <p>No users found</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Role</th>
              </tr>
            </thead>

            <tbody>
              {users.map((u) => (
                <tr
                  key={u.id}
                  style={styles.tr}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#1e293b")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <td style={styles.td}>{u.email}</td>
                  <td style={styles.td}>{u.role || "user"}</td>
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
  inviteBox: {
    marginBottom: "20px",
  },
  input: {
    padding: "10px",
    marginRight: "10px",
    borderRadius: "6px",
    border: "none",
    width: "250px",
  },
  table: {
    width: "100%",
    marginTop: "20px",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    padding: "12px",
    borderBottom: "1px solid #334155",
    color: "#94a3b8",
  },
  td: {
    padding: "12px",
    borderBottom: "1px solid #1e293b",
  },
  tr: {
    transition: "background 0.2s",
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
};

export default Admin;