import { useEffect, useState } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

function Payment() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  // 🔥 Listen for logged-in user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("AUTH USER:", currentUser);
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const handlePayment = async () => {
    if (!user) {
      alert("You must be logged in");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("http://localhost:4242/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.uid,
        }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Failed to start payment");
      }

    } catch (error) {
      console.error(error);
      alert("Payment error");
    }

    setLoading(false);
  };

  return (
    <div style={{
      background: "#020617",
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      color: "white",
    }}>
      <div style={{
        background: "#0f172a",
        padding: "40px",
        borderRadius: "12px",
        width: "350px",
        textAlign: "center",
      }}>
        <h1>Upgrade Plan</h1>

        <p style={{ color: "#94a3b8" }}>
          £5 / user / month
        </p>

        <button
          onClick={handlePayment}
          disabled={loading}
          style={{
            marginTop: "20px",
            width: "100%",
            padding: "12px",
            background: loading ? "#64748b" : "#38bdf8",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          {loading ? "Redirecting..." : "Subscribe Now"}
        </button>
      </div>
    </div>
  );
}

export default Payment;