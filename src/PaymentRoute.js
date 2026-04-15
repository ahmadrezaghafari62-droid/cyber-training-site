import { useEffect, useState } from "react";
import { auth, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { Navigate, useLocation } from "react-router-dom";

function PaymentRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [subscribed, setSubscribed] = useState(false);
  const [user, setUser] = useState(null);

  const location = useLocation();

  useEffect(() => {
    let unsubscribeFirestore;

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      setUser(currentUser);

      // 🔥 Listen to Firestore user data
      unsubscribeFirestore = onSnapshot(
        doc(db, "users", currentUser.uid),
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();

            console.log("🔥 USER DATA:", data);

            setSubscribed(data.isSubscribed === true);
          } else {
            setSubscribed(false);
          }

          setLoading(false);
        },
        (error) => {
          console.error("🔥 Firestore error:", error);
          setLoading(false);
        }
      );
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeFirestore) unsubscribeFirestore();
    };
  }, []);

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "40px" }}>
        Checking access...
      </div>
    );
  }

  /* ================= AUTH CHECK ================= */

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  /* ================= ✅ ALLOW COMPLETION PAGE ================= */

  if (location.pathname === "/completed") {
    return children;
  }

  /* ================= 🔐 SUBSCRIPTION CHECK ================= */

  if (!subscribed) {
    return <Navigate to="/payment" replace />;
  }

  /* ================= ✅ ACCESS GRANTED ================= */

  return children;
}

export default PaymentRoute;