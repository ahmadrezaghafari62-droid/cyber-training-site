import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function Completed() {
  const navigate = useNavigate();
  const location = useLocation();

  const score = location.state?.score ?? 0;
  const total = location.state?.total ?? 0;

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/dashboard");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div
      style={{
        background: "#020617",
        minHeight: "100vh",
        color: "white",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <h1 style={{ color: "#22c55e" }}>🎉 Course Completed!</h1>
      <p>Your score: {score} / {total}</p>
      <p style={{ marginTop: "10px", color: "#94a3b8" }}>
        Redirecting to dashboard...
      </p>
    </div>
  );
}

export default Completed;