import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";

function Invite() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  /* ================= LOAD INVITE ================= */

  useEffect(() => {
    const checkInvite = async () => {
      try {
        const inviteRef = doc(db, "invites", token);
        const snap = await getDoc(inviteRef);

        if (!snap.exists()) {
          alert("❌ Invalid invite link");
          navigate("/");
          return;
        }

        const data = snap.data();

        console.log("🔥 INVITE FOUND:", data);

        // ✅ STORE INVITE
        localStorage.setItem(
          "invite",
          JSON.stringify({
            companyId: data.companyId,
            role: data.role,
          })
        );

        console.log("✅ STORED IN LOCALSTORAGE");

        setLoading(false);

      } catch (err) {
        console.error("Invite error:", err);
        alert("Error loading invite");
        navigate("/");
      }
    };

    checkInvite();
  }, [token, navigate]);

  /* ================= UI ================= */

  if (loading) {
    return <div style={styles.center}>Checking invite...</div>;
  }

  return (
    <div style={styles.page}>
      <h1>🎉 You’ve been invited!</h1>

      <p>You are joining a company.</p>

      <button onClick={() => navigate("/signup")} style={styles.button}>
        Accept & Sign Up
      </button>

      <button onClick={() => navigate("/login")} style={styles.button}>
        Already have account? Login
      </button>
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  page: {
    background: "#020617",
    minHeight: "100vh",
    color: "white",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  center: {
    color: "white",
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    marginTop: "20px",
    padding: "12px 20px",
    background: "#38bdf8",
    border: "none",
    borderRadius: "6px",
    color: "white",
    cursor: "pointer",
  },
};

export default Invite;