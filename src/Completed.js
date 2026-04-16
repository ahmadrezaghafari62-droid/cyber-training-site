import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function Completed() {
  const location = useLocation();
  const { score, total } = location.state || {};

  useEffect(() => {
    const timer = setTimeout(() => {
      // 🔥 FORCE HARD REFRESH
      window.location.href = "/dashboard";
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{
      background: "#020617",
      minHeight: "100vh",
      color: "white",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center"
    }}>
      <h1 style={{ color: "#22c55e" }}>🎉 Course Completed!</h1>

      <p>Your score: {score} / {total}</p>

      <p style={{ marginTop: "20px", color: "#94a3b8" }}>
        Redirecting to dashboard...
      </p>
    </div>
  );
}

export default Completed;