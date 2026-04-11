import { useEffect, useState } from "react";
import { auth, db } from "./firebase";
import { doc, setDoc, arrayUnion } from "firebase/firestore";
import { useParams, useNavigate } from "react-router-dom";

function Training() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  /* ================= COURSE DATA ================= */

  const courseContent = {
    phishing: [
      {
        question: "What is phishing?",
        options: ["Fishing emails", "Cyber attack", "Antivirus"],
        answer: "Cyber attack"
      },
      {
        question: "Phishing emails usually:",
        options: ["Look suspicious", "Look legitimate", "Are safe"],
        answer: "Look legitimate"
      }
    ],
    passwords: [
      {
        question: "Strong password includes:",
        options: ["123456", "Name only", "Letters, numbers & symbols"],
        answer: "Letters, numbers & symbols"
      }
    ],
    social: [
      {
        question: "Social engineering is:",
        options: ["Hacking people", "Fixing computers", "Coding"],
        answer: "Hacking people"
      }
    ]
  };

  const questions = courseContent[courseId] || [];

  /* ================= HANDLE ANSWER ================= */

  const handleAnswer = async (selected) => {
    let newScore = score;

    if (selected === questions[step].answer) {
      newScore += 1;
      setScore(newScore);
    }

    const next = step + 1;

    if (next < questions.length) {
      setStep(next);
    } else {
      const user = auth.currentUser;
      if (!user) return;

      try {
        // ✅ SAVE RESULT + HISTORY
        await setDoc(
          doc(db, "progress", user.uid),
          {
            [courseId]: {
              score: newScore,
              total: questions.length
            },

            history: arrayUnion({
              courseId,
              date: new Date().toISOString(),
              score: newScore,
              total: questions.length
            })
          },
          { merge: true }
        );

        console.log("✅ Progress saved");

      } catch (err) {
        console.error("🔥 Save error:", err.message);
      }

      setCompleted(true);

      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    }
  };

  /* ================= COMPLETION ================= */

  if (completed) {
    return (
      <div style={{ padding: "40px", color: "white" }}>
        <h2>🎉 Course Completed</h2>
        <p>Your score: {score} / {questions.length}</p>
        <p>Redirecting...</p>
      </div>
    );
  }

  /* ================= NO COURSE ================= */

  if (!questions.length) {
    return <p style={{ color: "white" }}>No course found</p>;
  }

  /* ================= UI ================= */

  return (
    <div style={{
      background: "#020617",
      minHeight: "100vh",
      color: "white",
      padding: "40px"
    }}>
      <h2>{questions[step].question}</h2>

      {questions[step].options.map((opt, i) => (
        <button
          key={i}
          onClick={() => handleAnswer(opt)}
          style={{
            display: "block",
            margin: "10px 0",
            padding: "10px",
            width: "300px",
            background: "#38bdf8",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
          }}
        >
          {opt}
        </button>
      ))}

      <p style={{ marginTop: "20px" }}>
        Question {step + 1} of {questions.length}
      </p>
    </div>
  );
}

export default Training;