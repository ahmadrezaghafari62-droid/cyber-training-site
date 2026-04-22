import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

import { auth, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

/* PAGES */
import Landing from "./Home";
import Login from "./Login";
import Signup from "./Signup";
import Dashboard from "./Dashboard";
import Admin from "./Admin";
import Payment from "./Payment";
import Training from "./Training";
import Contact from "./Contact";
import Certificate from "./Certificate";
import Invite from "./Invite";
import CompanyDashboard from "./CompanyDashboard";

/* ROUTE GUARDS */
import ProtectedRoute from "./ProtectedRoute";
import PaymentRoute from "./PaymentRoute";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ================= AUTH ================= */

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        setUser(currentUser);

        if (currentUser) {
          await createUserIfNotExists(currentUser);
        }
      } catch (err) {
        console.error("🔥 Auth error:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  /* ================= ENSURE USER EXISTS ================= */

  const createUserIfNotExists = async (user) => {
    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          email: user.email,
          isSubscribed: false,
          trialActive: true,
          companyId: null,
          role: "user",
          createdAt: new Date(),
        });

        console.log("✅ New user created");
      }
    } catch (err) {
      console.error("🔥 User creation error:", err);
    }
  };

  /* ================= LOADING ================= */

  if (loading) {
    return <div style={styles.loading}>Loading...</div>;
  }

  /* ================= ROUTES ================= */

  return (
    <div style={styles.app}>
      <Routes>
        {/* PUBLIC */}
        <Route
          path="/"
          element={user ? <Navigate to="/dashboard" replace /> : <Landing />}
        />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/invite/:token" element={<Invite />} />

        {/* PAYMENT */}
        <Route path="/payment" element={<Payment />} />

        {/* PROTECTED */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/company"
          element={
            <ProtectedRoute>
              <CompanyDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          }
        />

        {/* TRAINING */}
      <Route
          path="/training/:courseId"
          element={<Training />}
        />

       

        {/* CERTIFICATE (DYNAMIC ONLY ✅) */}
        <Route
          path="/certificate/:courseId"
          element={<Certificate />}
        />

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* FOOTER */}
      <footer style={styles.footer}>
        © 2026 CyberSentinel <span style={{ color: "#38bdf8" }}>HQ</span> — 
        Independent cybersecurity training platform. Not affiliated with similarly named organisations.
      </footer>
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  app: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    background: "#020617",
  },

  loading: {
    background: "#020617",
    color: "white",
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  footer: {
    marginTop: "auto",
    padding: "15px",
    textAlign: "center",
    fontSize: "12px",
    color: "#64748b",
    borderTop: "1px solid #1e293b",
  },
};

export default App;