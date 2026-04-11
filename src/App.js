import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";

import { auth, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

/* PAGES */
import Home from "./Home";
import Login from "./Login";
import Signup from "./Signup";
import Dashboard from "./Dashboard";
import Admin from "./Admin";
import Payment from "./Payment";
import Training from "./Training";
import Contact from "./Contact";

/* ROUTE GUARDS */
import ProtectedRoute from "./ProtectedRoute";
import PaymentRoute from "./PaymentRoute";

function App() {

  /* ================================
     🔥 CREATE USER IN FIRESTORE
  ================================= */

  const createUserIfNotExists = async (user) => {
    if (!user) return;

    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(
          userRef,
          {
            email: user.email,
            isSubscribed: false,
            trialActive: true,
            createdAt: new Date(),
          },
          { merge: true }
        );

        console.log("✅ New user created with trial");
      } else {
        // Ensure trialActive exists
        await setDoc(
          userRef,
          { trialActive: true },
          { merge: true }
        );

        console.log("🔄 Existing user updated");
      }

    } catch (error) {
      console.error("🔥 Firestore error:", error.message);
    }
  };

  /* ================================
     🔐 AUTH LISTENER
  ================================= */

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
  ================================= */

  return (
    <Routes>

      {/* PUBLIC ROUTES */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/contact" element={<Contact />} />

      {/* PAYMENT */}
      <Route path="/payment" element={<Payment />} />

      {/* PROTECTED DASHBOARD */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* TRAINING (REQUIRES PAYMENT OR TRIAL) */}
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

      {/* FALLBACK (OPTIONAL BUT GOOD PRACTICE) */}
      <Route path="*" element={<Home />} />

    </Routes>
  );
}

export default App;