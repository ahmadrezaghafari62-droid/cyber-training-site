import { useEffect, useState } from "react";
import { auth, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";

function Payment() {
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const navigate = useNavigate();

  const API_URL = "https://cybersentinel-backend-ezpt.onrender.com";

  /* ================================
     🔐 AUTH + SUBSCRIPTION CHECK
  ================================= */

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate("/login");
        return;
      }

      try {
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();

          // ✅ Already subscribed → skip payment
          if (userData.isSubscribed) {
            console.log("✅ Already subscribed");
            navigate("/dashboard");
            return;
          }
        }

        setLoading(false);

      } catch (err) {
        console.error("Error checking subscription:", err);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  /* ================================
     💳 CREATE CHECKOUT SESSION
  ================================= */

  const handlePayment = async () => {
    const user = auth.currentUser;

    if (!user) {
      alert("Please login first");
      return;
    }

    try {
      setProcessing(true);

      console.log("🚀 Creating Stripe session...");

      const res = await fetch(`${API_URL}/create-checkout-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.uid,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create session");
      }

      if (data.url) {
        // 🔥 Redirect to Stripe
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }

    } catch (error) {
      console.error("❌ Payment error:", error.message);
      alert("Payment failed. Please try again.");
      setProcessing(false);
    }
  };

  /* ================================
     ⏳ LOADING STATE
  ================================= */

  if (loading) {
    return (
      <div style={styles.center}>
        <h2>Checking subscription...</h2>
      </div>
    );
  }

  /* ================================
     🎨 UI
  ================================= */

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1>Upgrade Plan</h1>

        <p style={styles.price}>£5 / user / month</p>

        <button
          onClick={handlePayment}
          disabled={processing}
          style={{
            ...styles.button,
            background: processing ? "#64748b" : "#38bdf8",
          }}
        >
          {processing ? "Redirecting..." : "Subscribe Now"}
        </button>

        <p style={styles.note}>
          Secure payment powered by Stripe
        </p>
      </div>
    </div>
  );
}

/* ================================
   🎨 STYLES
================================ */

const styles = {
  page: {
    background: "#020617",
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "white",
  },

  center: {
    background: "#020617",
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "white",
  },

  card: {
    background: "#0f172a",
    padding: "40px",
    borderRadius: "12px",
    width: "350px",
    textAlign: "center",
    border: "1px solid #1e293b",
  },

  price: {
    color: "#94a3b8",
    marginTop: "10px",
    fontSize: "18px",
  },

  button: {
    marginTop: "20px",
    width: "100%",
    padding: "12px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "16px",
    color: "white",
  },

  note: {
    marginTop: "15px",
    fontSize: "12px",
    color: "#94a3b8",
  },
};

export default Payment;