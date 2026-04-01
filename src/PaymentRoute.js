import { useEffect, useState } from "react";
import { auth, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { Navigate } from "react-router-dom";

function PaymentRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      setUser(currentUser);

      try {
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          console.log("📊 Firestore data:", data);

          setIsSubscribed(data?.isSubscribed === true);
        } else {
          console.log("❌ User doc missing");
          setIsSubscribed(false);
        }

      } catch (error) {
        console.error("🔥 Firestore error:", error.message);
        setIsSubscribed(false);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <p style={{ textAlign: "center" }}>Loading...</p>;

  // ❌ Not logged in → go login
  if (!user) {
    return <Navigate to="/login" />;
  }

  // ❌ Not subscribed → go payment
  if (!isSubscribed) {
    return <Navigate to="/payment" />;
  }

  // ✅ Allowed
  return children;
}

export default PaymentRoute;