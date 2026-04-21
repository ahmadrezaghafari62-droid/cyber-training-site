import { useEffect, useState } from "react";
import { auth, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { Navigate, useLocation } from "react-router-dom";

function PaymentRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
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

      unsubscribeFirestore = onSnapshot(
        doc(db, "users", currentUser.uid),
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();

            console.log("🔥 USER DATA:", data);

            const access =
              data.isSubscribed === true ||
              data.trialActive === true ||
              data.companyId !== null;

            setHasAccess(access);
          } else {
            setHasAccess(false);
          }

          setLoading(false);
        }
      );
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeFirestore) unsubscribeFirestore();
    };
  }, []);

  if (loading) {
    return <div style={{ textAlign: "center" }}>Checking access...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Allow training routes
  if (location.pathname.startsWith("/training")) {
    if (!hasAccess) {
      return <Navigate to="/payment" replace />;
    }
    return children;
  }

  return children;
}

export default PaymentRoute;