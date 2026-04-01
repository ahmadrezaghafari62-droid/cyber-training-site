import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";

import { auth, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

import Home from "./Home";
import Login from "./Login";
import Signup from "./Signup";
import Dashboard from "./Dashboard";
import Admin from "./Admin";
import Payment from "./Payment";
import Training from "./Training";
import Contact from "./Contact";
import ProtectedRoute from "./ProtectedRoute";
import PaymentRoute from "./PaymentRoute";

function App() {

  /* ================================
     🔥 CREATE USER IN FIRESTORE
  ================================ */

  const createUserIfNotExists = async (user) => {
    if (!user) return;

    try {
      await setDoc(
        doc(db, "users", user.uid),
        {
          email: user.email,
          isSubscribed: false,
          createdAt: new Date(),
        },
        { merge: true }
      );

      console.log("✅ User ensured in Firestore");

    } catch (error) {
      console.error("🔥 Firestore error:", error.message);
    }
  };

  /* ================================
     🔥 AUTH LISTENER
  ================================ */

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        createUserIfNotExists(user);
      }
    });

    return () => unsubscribe();
  }, []);

  /* ================================
     🚀 ROUTES
  ================================ */

  return (
    <Routes>

      {/* Public صفحات */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/contact" element={<Contact />} />

      {/* Protected Dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Payment Page (logged users only ideally) */}
      <Route path="/payment" element={<Payment />} />

      {/* Training (PAYMENT LOCKED) */}
      <Route
        path="/training"
        element={
          <PaymentRoute>
            <Training />
          </PaymentRoute>
        }
      />

      {/* Admin (optional protection later) */}
      <Route path="/admin" element={<Admin />} />

    </Routes>
  );
}

export default App;