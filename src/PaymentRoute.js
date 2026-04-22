import { useEffect, useState } from "react";
import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";
import { Navigate } from "react-router-dom";

function PaymentRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      const user = auth.currentUser;

      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);

        if (snap.exists()) {
          const data = snap.data();

          const access =
            data?.isSubscribed === true ||
            data?.trialActive === true ||
            !!data?.companyId;

          setHasAccess(access);
        }
      } catch (err) {
        console.error("PaymentRoute error:", err);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, []);

  if (loading) return <div>Loading...</div>;

  if (!hasAccess) return <Navigate to="/payment" />;

  return children;
}

export default PaymentRoute;