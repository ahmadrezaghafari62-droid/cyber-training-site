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

/* ROUTE GUARDS */
import ProtectedRoute from "./ProtectedRoute";
import PaymentRoute from "./PaymentRoute";

function App() {
  const [user, setUser] = useState(undefined);
  const [loading, setLoading] = useState(true);

  /* ================= AUTH ================= */

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        await createUserIfNotExists(currentUser);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /* ================= CREATE USER ================= */

  const createUserIfNotExists = async (user) => {
    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          email: user.email,
          isSubscribed: false,
          trialActive: true,
          createdAt: new Date(),
        });

        console.log("✅ New user created");
      }
    } catch (error) {
      console.error("🔥 Firestore error:", error.message);
    }
  };

  /* ================= LOADING ================= */

  if (loading || user === undefined) {
    return (
      <div style={{
        background: "#020617",
        color: "white",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}>
        Loading...
      </div>
    );
  }

  /* ================= ROUTES ================= */

  return (
    <Routes>

      {/* HOME (SMART REDIRECT) */}
      <Route
        path="/"
        element={user ? <Navigate to="/dashboard" /> : <Landing />}
      />

      {/* PUBLIC */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/contact" element={<Contact />} />

      {/* PAYMENT */}
      <Route path="/payment" element={<Payment />} />

      {/* DASHBOARD */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* TRAINING */}
      <Route
        path="/training/:courseId"
        element={
          <PaymentRoute>
            <Training />
          </PaymentRoute>
        }
      />

      {/* CERTIFICATE ✅ */}
      <Route path="/certificate" element={<Certificate />} />

      {/* ADMIN */}
      <Route path="/admin" element={<Admin />} />

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/" />} />

    </Routes>
  );
}

export default App;