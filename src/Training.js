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
  const [step, setStep] = useState(-1);
  const [showQuiz, setShowQuiz] = useState(false);
  const [passed, setPassed] = useState(false);
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [success, setSuccess] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(null);

  /* ================= LOAD ================= */

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (!user || !courseId) {
        setLoading(false);
        return;
      }

      try {
        const courseSnap = await getDoc(doc(db, "courses", courseId));
        if (!courseSnap.exists()) return;

        const courseData = courseSnap.data();
        setCourse(courseData);

        const progressRef = doc(db, "progress", `${user.uid}_${courseId}`);
        const progressSnap = await getDoc(progressRef);

        if (progressSnap.exists()) {
          const data = progressSnap.data();
          setProgress(data);
          setStarted(true);

          const savedStep =
            typeof data.currentStep === "number" ? data.currentStep : -1;

          setStep(savedStep);

          if (savedStep >= (courseData.lessons?.length || 0)) {
            setShowQuiz(true);
          }
        }
      } catch (err) {
        console.error(err);
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

    const progressRef = doc(db, "progress", `${user.uid}_${courseId}`);

    const newProgress = {
      userId: user.uid,
      courseId,
      completed: false,
      score: 0,
      currentStep: -1,
      createdAt: serverTimestamp(),
    };

    await setDoc(progressRef, newProgress);

    setProgress(newProgress);
    setStarted(true);
    setStep(-1);
  };

  /* ================= NEXT ================= */

  const goNext = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const nextStep = step + 1;
    const totalLessons = course.lessons?.length || 0;

    if (nextStep >= totalLessons) {
      setShowQuiz(true);

      await setDoc(
        doc(db, "progress", `${user.uid}_${courseId}`),
        { currentStep: nextStep },
        { merge: true }
      );
      return;
    }

    setStep(nextStep);

    await setDoc(
      doc(db, "progress", `${user.uid}_${courseId}`),
      { currentStep: nextStep },
      { merge: true }
    );
  };

  /* ================= QUIZ ================= */

  const handleAnswer = (option, index) => {
    setSelectedIndex(index);

    const correctIndex = course.quiz.answer;

    if (index === correctIndex) {
      setPassed(true);
      setError("");
      setSuccess("✅ Correct! You can now finish the course.");
    } else {
      setSuccess("");

      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      if (newAttempts >= 3) {
        setError("❌ Too many attempts. Restart the course.");
      } else {
        setError("❌ Incorrect answer. Try again.");
      }
    }
  };

  /* ================= COMPLETE ================= */

  const completeCourse = async () => {
    const user = auth.currentUser;
    if (!user) return;

    await setDoc(
      doc(db, "progress", `${user.uid}_${courseId}`),
      {
        completed: true,
        score: 100,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    setProgress((prev) => ({ ...prev, completed: true }));
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

  /* ================= MAIN ================= */

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <button onClick={() => navigate("/dashboard")} style={styles.backBtn}>
          ← Back
        </button>

        <h1 style={styles.title}>{course.title}</h1>
        <p style={styles.subtitle}>{course.description}</p>

        {/* INTRO */}
        {step === -1 && (
          <>
            <div style={styles.content}>
              {(course.content || "No intro available")
                .split("\n")
                .map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
            </div>

            <button onClick={goNext} style={styles.startBtn}>
              Start Lessons
            </button>
          </>
        )}

        {/* LESSON */}
        {step >= 0 && lesson && !showQuiz && (
          <>
            <h2 style={{ marginTop: "20px" }}>{lesson.title}</h2>
            <div style={styles.content}>{lesson.content}</div>

            <button onClick={goNext} style={styles.startBtn}>
              Next Lesson
            </button>
          </>
        )}

        {/* QUIZ */}
        {showQuiz && !progress?.completed && (
          <div>
            <h2 style={{ marginTop: "20px" }}>Quiz</h2>
            <p style={styles.content}>{course.quiz.question}</p>

            {course.quiz.options.map((opt, i) => {
              const isCorrect = i === course.quiz.answer;
              const isSelected = i === selectedIndex;
              const showCorrect = selectedIndex !== null && isCorrect;

              return (
                <button
                  key={i}
                  onClick={() => handleAnswer(opt, i)}
                  disabled={attempts >= 3 || passed}
                  style={{
                    ...styles.optionBtn,
                    background:
                      isSelected && isCorrect
                        ? "#14532d"
                        : isSelected
                        ? "#7f1d1d"
                        : showCorrect
                        ? "#14532d"
                        : "#1e293b",
                    border:
                      isSelected && isCorrect
                        ? "2px solid #22c55e"
                        : isSelected
                        ? "2px solid #ef4444"
                        : showCorrect
                        ? "2px solid #22c55e"
                        : "1px solid #38bdf8",
                  }}
                >
                  {opt}
                  {(isSelected || showCorrect) && (
                    <span style={{ marginLeft: "10px" }}>
                      {isCorrect ? "✅" : isSelected ? "❌" : ""}
                    </span>
                  )}
                </button>
              );
            })}

            {error && <p style={{ color: "#f87171" }}>{error}</p>}
            {success && <p style={{ color: "#4ade80" }}>{success}</p>}

            {passed && (
              <button onClick={completeCourse} style={styles.completeBtn}>
                Finish Course
              </button>
            )}
          </div>
        )}

        {/* COMPLETED */}
        {progress?.completed && (
          <>
            <p style={styles.status}>Status: ✅ Completed</p>

            <button
              onClick={() => navigate(`/certificate/${courseId}`)}
              style={styles.certificateBtn}
            >
              View Certificate
            </button>
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
  title: { fontSize: "28px" },
  subtitle: { color: "#94a3b8" },
  content: { marginTop: "20px" },
  startBtn: {
    marginTop: "30px",
    padding: "14px 24px",
    background: "#38bdf8",
    borderRadius: "8px",
    color: "white",
  },
  completeBtn: {
    marginTop: "20px",
    padding: "12px 20px",
    background: "#22c55e",
    borderRadius: "6px",
    color: "white",
  },
  certificateBtn: {
    marginTop: "20px",
    padding: "12px 20px",
    background: "#38bdf8",
    borderRadius: "6px",
    color: "white",
  },
  optionBtn: {
      display: "block",
      margin: "12px auto",
      padding: "12px",
      width: "100%",
      background: "#1e293b",
      color: "white",
      border: "1px solid #38bdf8",
      borderRadius: "6px",
      cursor: "pointer",
      transition: "all 0.2s ease",
  },
  backBtn: {
    marginBottom: "20px",
    padding: "6px 12px",
    border: "1px solid #38bdf8",
    color: "#38bdf8",
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