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
import Completed from "./Completed";

/* ROUTE GUARDS */
import ProtectedRoute from "./ProtectedRoute";
import PaymentRoute from "./PaymentRoute";

function App() {
  const [user, setUser] = useState(undefined); // 🔥 IMPORTANT
  const [loading, setLoading] = useState(true);

  /* ================= FIREBASE AUTH ================= */

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
      <div
        style={{
          background: "#020617",
          color: "white",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        Loading...
      </div>
    );
  }

  /* ================= ROUTES ================= */

  return (
    <Routes>

      {/* HOME */}
      <Route
        path="/"
        element={user ? <Navigate to="/dashboard" replace /> : <Landing />}
      />

      {/* PUBLIC */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/contact" element={<Contact />} />

      {/* PAYMENT */}
      <Route path="/payment" element={<Payment />} />

      {/* COMPLETED (🔥 MUST BE ABOVE PROTECTED LOGIC) */}
      <Route path="/completed" element={<Completed />} />

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

      {/* ADMIN */}
      <Route path="/admin" element={<Admin />} />

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
}

export default App;