import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";

function Invite() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [inviteData, setInviteData] = useState(null);

  /* ================= LOAD INVITE ================= */

  useEffect(() => {
    const fetchInvite = async () => {
      try {
        const inviteRef = doc(db, "invites", token);
        const snap = await getDoc(inviteRef);

        if (!snap.exists()) {
          alert("❌ Invalid invite link");
          navigate("/");
          return;
        }

        const data = snap.data();

        const payload = {
          companyId: data.companyId,
          companyName: data.companyName,
          role: data.role || "user",
        };

        console.log("🔥 INVITE FOUND:", payload);

        // ✅ SAVE to sessionStorage (ONLY ONCE)
        sessionStorage.setItem("invite", JSON.stringify(payload));

        setInviteData(payload);
        setLoading(false);

      } catch (err) {
        console.error("Invite error:", err);
        navigate("/");
      }
    };

    fetchInvite();
  }, [token, navigate]);

  /* ================= ACCEPT ================= */

  const handleAccept = () => {
    console.log("🔥 USING INVITE:", sessionStorage.getItem("invite"));
    navigate("/signup");
  };

  /* ================= UI ================= */

  if (loading) {
    return <div style={styles.center}>Checking invite...</div>;
  }

  return (
    <div style={styles.page}>
      <h1>🎉 You’ve been invited!</h1>

      <p>
        You are joining{" "}
        <strong>{inviteData?.companyName || "a company"}</strong>
      </p>

      {/* ✅ DEBUG (remove later) */}
      <p style={{ color: "#22c55e", marginTop: "10px" }}>
        DEBUG: {sessionStorage.getItem("invite")}
      </p>

      <button onClick={handleAccept} style={styles.button}>
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