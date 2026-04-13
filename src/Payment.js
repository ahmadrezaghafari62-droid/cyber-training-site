import { useEffect, useState } from "react";
import { auth, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";

function Payment() {
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [user, setUser] = useState(null);

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

      setUser(currentUser); // ✅ IMPORTANT

      try {
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();

          if (userData.isSubscribed) {
            console.log("✅ Already subscribed");
            navigate("/dashboard");
            return;
          }
        }

        setLoading(false);
      } catch (err) {
        console.error("❌ Subscription check error:", err);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  /* ================================
     💳 HANDLE PAYMENT
  ================================= */

 const handleUpgrade = async () => {
  console.log("🚀 Upgrade clicked");

  if (!user) {
    alert("User not loaded yet");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/create-checkout-session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: user.uid,
        email: user.email,
      }),
    });

    const data = await res.json();

    console.log("🔥 Checkout response:", data);

    if (!res.ok) {
      throw new Error(data?.error || "Checkout failed");
    }

    if (!data.url) {
      throw new Error("No checkout URL");
    }

    window.location.href = data.url;

  } catch (err) {
    console.error("❌ Checkout error:", err);
    alert(err.message);
  }
};

  /* ================================
     ⏳ LOADING
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
          onClick={handleUpgrade} // ✅ FIXED
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