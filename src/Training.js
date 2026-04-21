import { useEffect, useState } from "react";
import { auth, db } from "./firebase";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useParams, useNavigate } from "react-router-dom";

function Training() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH COURSE + PROGRESS ================= */

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;

      if (!user || !courseId) {
        setLoading(false);
        return;
      }

      try {
        /* GET COURSE */
        const courseRef = doc(db, "courses", courseId);
        const courseSnap = await getDoc(courseRef);

        if (!courseSnap.exists()) {
          setCourse(null);
          setLoading(false);
          return;
        }

        setCourse(courseSnap.data());

        /* GET PROGRESS */
        const progressRef = doc(
          db,
          "progress",
          `${user.uid}_${courseId}`
        );

        const progressSnap = await getDoc(progressRef);

        if (progressSnap.exists()) {
          setProgress(progressSnap.data());
        } else {
          const defaultProgress = {
            userId: user.uid,
            courseId,
            completed: false,
            score: 0,
            createdAt: serverTimestamp(),
          };

          await setDoc(progressRef, defaultProgress);
          setProgress(defaultProgress);
        }
      } catch (err) {
        console.error("🔥 Training error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId]);

  /* ================= MARK COMPLETE ================= */

  const markComplete = async () => {
    const user = auth.currentUser;

    if (!user) return;

    try {
      const progressRef = doc(
        db,
        "progress",
        `${user.uid}_${courseId}`
      );

      await setDoc(
        progressRef,
        {
          completed: true,
          score: 100,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      setProgress((prev) => ({
        ...prev,
        completed: true,
      }));

      alert("✅ Course completed!");
    } catch (err) {
      console.error("🔥 Error:", err);
    }
  };

  /* ================= STATES ================= */

  if (loading)
    return <div style={styles.center}>Loading...</div>;

  if (!course)
    return <div style={styles.center}>Course not found</div>;

  const isCompleted = progress?.completed;

  /* ================= UI ================= */

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>{course.title}</h1>

        <p style={styles.subtitle}>{course.description}</p>

        <div style={styles.content}>{course.content}</div>

        <p style={styles.status}>
          Status:{" "}
          {isCompleted ? "✅ Completed" : "⏳ In Progress"}
        </p>

        {!isCompleted ? (
          <button onClick={markComplete} style={styles.completeBtn}>
            Mark as Complete
          </button>
        ) : (
          <button
            onClick={() => navigate(`/certificate/${courseId}`)}
            style={styles.certificateBtn}
          >
            View Certificate
          </button>
        )}
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  page: {
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
    width: "500px",
    textAlign: "center",
  },

  title: {
    fontSize: "28px",
    fontWeight: "600",
  },

  subtitle: {
    color: "#94a3b8",
    marginTop: "10px",
  },

  content: {
    marginTop: "20px",
    fontSize: "16px",
    lineHeight: "1.6",
  },

  status: {
    marginTop: "20px",
    color: "#94a3b8",
  },

  completeBtn: {
    marginTop: "20px",
    padding: "12px 20px",
    background: "#22c55e",
    border: "none",
    borderRadius: "6px",
    color: "white",
    cursor: "pointer",
  },

  certificateBtn: {
    marginTop: "20px",
    padding: "12px 20px",
    background: "#38bdf8",
    border: "none",
    borderRadius: "6px",
    color: "white",
    cursor: "pointer",
  },

  center: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "white",
  },
};

export default Training;