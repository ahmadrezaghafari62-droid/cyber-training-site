import { auth, db } from "./firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [progress, setProgress] = useState({});

  // 🔥 WAIT FOR AUTH PROPERLY
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) return;

      setUser(currentUser);

      try {
        const docRef = doc(db, "progress", currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProgress(docSnap.data());
        } else {
          console.log("No progress yet");
        }

      } catch (error) {
        console.log("🔥 Dashboard error:", error.message);
      }
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const courses = [
    "Phishing Awareness",
    "Password Security",
    "Social Engineering"
  ];

  return (
    <div style={{
      background: "#020617",
      minHeight: "100vh",
      color: "white",
      padding: "40px"
    }}>
      <h1 style={{ textAlign: "center" }}>CyberSentinel Dashboard</h1>

      <p style={{ textAlign: "center", color: "#94a3b8" }}>
        Welcome, {user?.email}
      </p>

      <h2 style={{ marginTop: "40px" }}>Your Training Modules</h2>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "20px",
        marginTop: "20px"
      }}>
        {courses.map((course, index) => {
          const courseData = progress?.courses?.[course];

          return (
            <div key={index} style={{
              background: "#0f172a",
              padding: "20px",
              borderRadius: "10px"
            }}>
              <h3>{course}</h3>

              <div style={{ marginTop: "10px" }}>
                <div style={{
                  height: "10px",
                  background: "#1e293b",
                  borderRadius: "5px"
                }}>
                  <div style={{
                    width: courseData
                      ? `${(courseData.score / courseData.total) * 100}%`
                      : "0%",
                    height: "100%",
                    background: "#38bdf8"
                  }} />
                </div>

                <p style={{ marginTop: "5px", fontSize: "14px", color: "#94a3b8" }}>
                  {courseData
                    ? `Score: ${courseData.score} / ${courseData.total}`
                    : "Not attempted"}
                </p>
              </div>

              <button
                onClick={() => navigate(`/course/${course}`)}
                style={{
                  marginTop: "10px",
                  padding: "10px",
                  width: "100%",
                  background: "#38bdf8",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer"
                }}
              >
                Start Training
              </button>
            </div>
          );
        })}
      </div>

      <div style={{ textAlign: "center", marginTop: "40px" }}>
        <button
          onClick={logout}
          style={{
            padding: "10px 20px",
            background: "red",
            border: "none",
            color: "white",
            cursor: "pointer"
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Dashboard;