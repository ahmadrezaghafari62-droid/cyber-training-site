import { useLocation, useNavigate } from "react-router-dom";

function Certificate() {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state) {
    return <p>No certificate data</p>;
  }

  const { score, total, courseId } = state;

  return (
    <div style={{
      background: "#020617",
      color: "white",
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
      textAlign: "center"
    }}>
      <h1 style={{ color: "#22c55e" }}>🎓 Certificate</h1>

      <h2>CyberSentinel Training</h2>

      <p style={{ marginTop: "20px" }}>
        Completed: <strong>{courseId}</strong>
      </p>

      <p>
        Score: {score} / {total}
      </p>

      <p style={{ marginTop: "20px", color: "#94a3b8" }}>
        {new Date().toLocaleDateString()}
      </p>

      <button
        onClick={() => navigate("/dashboard")}
        style={{
          marginTop: "30px",
          padding: "10px 20px",
          background: "#38bdf8",
          border: "none",
          borderRadius: "6px",
          color: "white",
          cursor: "pointer"
        }}
      >
        Back to Dashboard
      </button>
    </div>
  );
}

export default Certificate;