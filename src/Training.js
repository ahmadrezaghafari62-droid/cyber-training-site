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
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(true);

  const [step, setStep] = useState(-1); // 🔥 -1 = INTRO

  /* ================= LOAD DATA ================= */

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;

      if (!user || !courseId) {
        setLoading(false);
        return;
      }

      try {
        const courseRef = doc(db, "courses", courseId);
        const courseSnap = await getDoc(courseRef);

        if (!courseSnap.exists()) {
          setCourse(null);
          return;
        }

        const data = courseSnap.data();

            setCourse(data);

            console.log("COURSE DATA:", data);      // ✅ correct
            console.log("LESSONS:", data.lessons);  // ✅ correct

        const progressRef = doc(
          db,
          "progress",
          `${user.uid}_${courseId}`
        );

        const progressSnap = await getDoc(progressRef);

        if (progressSnap.exists()) {
          setProgress(progressSnap.data());
          setStarted(true); // 🔥 already started
        } else {
          setProgress(null);
        }

      } catch (err) {
        console.error("🔥 Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId]);

  /* ================= START ================= */

  const startCourse = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const progressRef = doc(
      db,
      "progress",
      `${user.uid}_${courseId}`
    );

    const newProgress = {
      userId: user.uid,
      courseId,
      completed: false,
      score: 0,
      createdAt: serverTimestamp(),
    };

    await setDoc(progressRef, newProgress);

    setProgress(newProgress);
    setStarted(true);
    setStep(-1); // 🔥 start at intro
  };

  /* ================= COMPLETE ================= */

  const markComplete = async () => {
    const user = auth.currentUser;
    if (!user) return;

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
  };

  /* ================= STATES ================= */

  if (loading) return <div style={styles.center}>Loading...</div>;
  if (!course) return <div style={styles.center}>Course not found</div>;

  const lesson = course?.lessons?.[step];

  /* ================= START SCREEN ================= */

  if (!started) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <button onClick={() => navigate("/dashboard")} style={styles.backBtn}>
            ← Back
          </button>

          <h1 style={styles.title}>{course.title}</h1>
          <p style={styles.subtitle}>{course.description}</p>

          <button onClick={startCourse} style={styles.startBtn}>
            Start Course
          </button>
        </div>
      </div>
    );
  }

  /* ================= MAIN FLOW ================= */

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <button onClick={() => navigate("/dashboard")} style={styles.backBtn}>
          ← Back
        </button>

        <h1 style={styles.title}>{course.title}</h1>
        <p style={styles.subtitle}>{course.description}</p>

        {/* 🔥 INTRO SCREEN */}
        {step === -1 && (
          <>
            <div style={styles.content}>
              {(course.content || "No content available")
                .split("\n")
                .map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
            </div>

            <button onClick={() => setStep(0)} style={styles.startBtn}>
              Start Lessons
            </button>
          </>
        )}

        {/* 🔥 LESSONS */}
        {step >= 0 && lesson && (
          <>
            <h2 style={{ marginTop: "20px" }}>{lesson.title}</h2>

            <div style={styles.content}>{lesson.content}</div>

            {step < course.lessons.length - 1 ? (
              <button
                onClick={() => setStep(step + 1)}
                style={styles.startBtn}
              >
                Next Lesson
              </button>
            ) : (
              <>
                <p style={styles.status}>
                  Status:{" "}
                  {progress?.completed
                    ? "✅ Completed"
                    : "⏳ In Progress"}
                </p>

                {!progress?.completed ? (
                  <button
                    onClick={markComplete}
                    style={styles.completeBtn}
                  >
                    Mark as Complete
                  </button>
                ) : (
                  <button
                    onClick={() =>
                      navigate(`/certificate/${courseId}`)
                    }
                    style={styles.certificateBtn}
                  >
                    View Certificate
                  </button>
                )}
              </>
            )}
          </>
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
  startBtn: {
    marginTop: "30px",
    padding: "14px 24px",
    background: "#38bdf8",
    border: "none",
    borderRadius: "8px",
    color: "white",
    cursor: "pointer",
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
  backBtn: {
    marginBottom: "20px",
    padding: "6px 12px",
    border: "1px solid #38bdf8",
    background: "transparent",
    color: "#38bdf8",
    borderRadius: "6px",
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