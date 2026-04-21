import { useEffect, useState } from "react";
import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";
import { useParams } from "react-router-dom";
import jsPDF from "jspdf";

function Certificate() {
  const { courseId } = useParams();

  const [user, setUser] = useState(null);
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      setUser(currentUser);

      // 🔹 Get course
      const courseSnap = await getDoc(doc(db, "courses", courseId));
      if (courseSnap.exists()) {
        setCourse(courseSnap.data());
      }

      // 🔹 Get progress
      const progressId = `${currentUser.uid}_${courseId}`;
      const progressSnap = await getDoc(doc(db, "progress", progressId));

      if (progressSnap.exists()) {
        setProgress(progressSnap.data());
      }
    };

    loadData();
  }, [courseId]);

  const generatePDF = () => {
    const pdf = new jsPDF();

    const certId = `CS-${Date.now()}`;
    const date = new Date().toLocaleDateString();

    pdf.setFontSize(22);
    pdf.text("Certificate of Completion", 60, 30);

    pdf.setFontSize(16);
    pdf.text("CyberSentinel HQ Training", 60, 45);

    pdf.setFontSize(12);
    pdf.text(`Issued to: ${user.email}`, 20, 70);
    pdf.text(`Course: ${course.title}`, 20, 85);
    pdf.text(`Status: Completed`, 20, 100);
    pdf.text(`Certificate ID: ${certId}`, 20, 115);
    pdf.text(`Date: ${date}`, 20, 130);

    pdf.save(`CyberSentinel-${courseId}-Certificate.pdf`);
  };

  if (!course || !progress) {
    return <div style={styles.center}>Loading certificate...</div>;
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1>🎓 Certificate of Completion</h1>

        <h2>{course.title}</h2>

        <p>Issued to: {user?.email}</p>
        <p>Status: {progress.completed ? "Completed" : "Not completed"}</p>

        <button onClick={generatePDF} style={styles.button}>
          Download Certificate
        </button>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  page: {
    background: "#020617",
    minHeight: "100vh",
    color: "white",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    background: "#0f172a",
    padding: "40px",
    borderRadius: "12px",
    textAlign: "center",
  },
  button: {
    marginTop: "20px",
    padding: "12px",
    background: "#22c55e",
    border: "none",
    borderRadius: "6px",
    color: "white",
    cursor: "pointer",
  },
  center: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
  },
};

export default Certificate;