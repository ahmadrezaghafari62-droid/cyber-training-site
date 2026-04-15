function Completed() {
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
      <p>Great job finishing your training.</p>
      <p>Redirecting to dashboard...</p>
    </div>
  );
}

export default Completed;