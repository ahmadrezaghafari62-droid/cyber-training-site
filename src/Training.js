import { useState } from "react";
import { auth, db } from "./firebase";
import { doc, setDoc, arrayUnion } from "firebase/firestore";
import { useParams, useNavigate } from "react-router-dom";

function Training() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [saving, setSaving] = useState(false);

  /* ================= COURSE DATA ================= */

  const courseContent = {
    phishing: [
      {
        question: "What is phishing?",
        options: ["Fishing emails", "Cyber attack", "Antivirus"],
        answer: "Cyber attack",
      },
      {
        question: "Phishing emails usually:",
        options: ["Look suspicious", "Look legitimate", "Are safe"],
        answer: "Look legitimate",
      },
    ],
    passwords: [
      {
        question: "Strong password includes:",
        options: ["123456", "Name only", "Letters, numbers & symbols"],
        answer: "Letters, numbers & symbols",
      },
    ],
    social: [
      {
        question: "Social engineering is:",
        options: ["Hacking people", "Fixing computers", "Coding"],
        answer: "Hacking people",
      },
    ],
  };

  const questions = courseContent[courseId] || [];

  /* ================= HANDLE ANSWER ================= */

  const handleAnswer = async (selected) => {
    if (selectedAnswer) return;

    setSelectedAnswer(selected);

    let newScore = score;

    if (selected === questions[step].answer) {
      newScore += 1;
      setScore(newScore);
    }

    const next = step + 1;

    // 👉 Move to next question
    if (next < questions.length) {
      setTimeout(() => {
        setStep(next);
        setSelectedAnswer(null);
      }, 400);
      return;
    }

    // 🔥 FINAL STEP — SAVE
    const user = auth.currentUser;
    if (!user) return;

    setSaving(true);

    try {
      await setDoc(
        doc(db, "progress", user.uid),
        {
          [courseId]: {
            score: newScore,
            total: questions.length,
          },
          history: arrayUnion({
            courseId,
            date: new Date().toISOString(),
            score: newScore,
            total: questions.length,
          }),
        },
        { merge: true }
      );

      console.log("✅ Progress saved");

      // ✅ GO TO COMPLETION PAGE (WITH DATA)
      console.log("🚀 NAVIGATING TO COMPLETED");
     navigate("/certificate", {
  state: {
    score: newScore,
    total: questions.length,
    courseId
  }
});

    } catch (err) {
      console.error("🔥 Save error:", err.message);
      setSaving(false);
    }
  };

  /* ================= NO COURSE ================= */

  if (!questions.length) {
    return (
      <div style={styles.center}>
        <p>No course found</p>
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <div style={styles.page}>
      <h2>{questions[step].question}</h2>

      {questions[step].options.map((opt, i) => {
        const isCorrect = opt === questions[step].answer;
        const isSelected = selectedAnswer === opt;

        return (
          <button
            key={i}
            onClick={() => handleAnswer(opt)}
            disabled={!!selectedAnswer}
            style={{
              ...styles.button,
              background: isSelected
                ? isCorrect
                  ? "#22c55e"
                  : "#ef4444"
                : "#38bdf8",
              opacity: selectedAnswer && !isSelected ? 0.6 : 1,
            }}
          >
            {opt}
          </button>
        );
      })}

      <p style={{ marginTop: "20px" }}>
        Question {step + 1} of {questions.length}
      </p>

      {saving && <p style={{ marginTop: "10px" }}>Saving progress...</p>}
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  page: {
    background: "#020617",
    minHeight: "100vh",
    color: "white",
    padding: "40px",
  },
  center: {
    background: "#020617",
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "white",
  },
  button: {
    display: "block",
    margin: "10px 0",
    padding: "12px",
    width: "300px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    color: "white",
    fontWeight: "bold",
  },
};

export default Training;