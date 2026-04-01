import { useParams } from "react-router-dom";
import { auth, db } from "./firebase";
import { doc, setDoc } from "firebase/firestore";
import { useState } from "react";

function Course() {
  const { name } = useParams();

  const [score, setScore] = useState(null);

  const questions = [
    {
      question: "What is phishing?",
      options: ["A cyber attack", "A fish", "A password"],
      answer: "A cyber attack"
    },
    {
      question: "Should you click unknown links?",
      options: ["Yes", "No"],
      answer: "No"
    }
  ];

  const submitQuiz = async () => {
  const user = auth.currentUser;

  let correct = 0;

  questions.forEach((q, index) => {
    const userAnswer = document.querySelector(
      `input[name="q${index}"]:checked`
    );

    if (userAnswer && userAnswer.value === q.answer) {
      correct++;
    }
  });

  setScore(correct);

  await setDoc(
    doc(db, "progress", user.uid),
    {
      courses: {
        [name]: {
          score: correct,
          total: questions.length
        }
      }
    },
    { merge: true }
  );
};

  return (
  <div style={{
    background: "#020617",
    minHeight: "100vh",
    color: "white",
    padding: "40px"
  }}>
    <h1 style={{ textAlign: "center" }}>{name} Training</h1>

    <div style={{
      maxWidth: "600px",
      margin: "auto",
      marginTop: "40px",
      background: "#0f172a",
      padding: "30px",
      borderRadius: "10px"
    }}>
      {questions.map((q, index) => (
        <div key={index} style={{ marginBottom: "25px" }}>
          <p style={{ fontWeight: "bold" }}>{q.question}</p>

          {q.options.map((option, i) => (
            <label key={i} style={{ display: "block", marginTop: "5px" }}>
              <input
                type="radio"
                name={`q${index}`}
                value={option}
              />{" "}
              {option}
            </label>
          ))}
        </div>
      ))}

      <button
        onClick={submitQuiz}
        style={{
          width: "100%",
          padding: "12px",
          background: "#38bdf8",
          border: "none",
          borderRadius: "5px",
          fontSize: "16px",
          cursor: "pointer"
        }}
      >
        Submit Quiz
      </button>

      {score !== null && (
        <h2 style={{ marginTop: "20px", textAlign: "center" }}>
          Your Score: {score}/{questions.length}
        </h2>
      )}
    </div>
  </div>
);
}

export default Course;