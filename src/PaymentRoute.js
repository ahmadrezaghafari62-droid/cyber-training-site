import { useEffect, useState } from "react";
import { auth, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { Navigate } from "react-router-dom";

function PaymentRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [subscribed, setSubscribed] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      setUser(currentUser);

      const unsubscribeFirestore = onSnapshot(
        doc(db, "users", currentUser.uid),
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();

            console.log("🔥 USER DATA:", data);

            setSubscribed(data.isSubscribed === true);
          }

          setLoading(false);
        }
      );

      return () => unsubscribeFirestore();
    });

    return () => unsubscribeAuth();
  }, []);

  if (loading) {
    return <p style={{ textAlign: "center" }}>Checking access...</p>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  // 🚨 ONLY CHECK SUBSCRIPTION
  if (!subscribed) {
    return <Navigate to="/payment" />;
  }

  return children;
}

export default PaymentRoute;