import { useLocation, useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useRef } from "react";
import { auth } from "./firebase";

function Certificate() {
  const location = useLocation();
  const navigate = useNavigate();
  const certRef = useRef();

  const data = location.state;

  /* ================= HANDLE NO DATA ================= */

  if (!data) {
    return (
      <div style={styles.center}>
        <h2>No certificate data</h2>
        <button onClick={() => navigate("/dashboard")} style={styles.button}>
          Go to Dashboard
        </button>
      </div>
    );
  }

  const { score, total, courseId } = data;

  const user = auth.currentUser;
  const certificateId = `CS-${Date.now()}`;

  /* ================= DOWNLOAD PDF ================= */

  const handleDownload = async () => {
    const element = certRef.current;

    const canvas = await html2canvas(element, {
      backgroundColor: "#020617",
      scale: 2,
      useCORS: true,
      scrollY: -window.scrollY,
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");

    const imgWidth = 190;
    const pageHeight = 297;

    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let position = 10;

    if (imgHeight < pageHeight) {
      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
    } else {
      let heightLeft = imgHeight;

      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
    }

    pdf.save("CyberSentinel-Certificate.pdf");
  };

  /* ================= UI (JSX) ================= */

  return (
    <div style={styles.page}>
      
      {/* 🔥 THIS IS WHAT PDF CAPTURES */}
      <div ref={certRef} style={styles.certificateBox}>
        <h1 style={{ color: "#22c55e" }}>🎓 Certificate</h1>

        <h2>CyberSentinel Training</h2>

        <p style={{ marginTop: "20px" }}>
          Issued to: <strong>{user?.email}</strong>
        </p>

        <p>
          Course: <strong>{courseId}</strong>
        </p>

        <p>
          Score: {score} / {total}
        </p>

        <p style={{ fontSize: "12px", color: "#94a3b8" }}>
          Certificate ID: {certificateId}
        </p>

        <p style={{ marginTop: "20px", color: "#94a3b8" }}>
          {new Date().toLocaleDateString()}
        </p>
      </div>

      {/* 🔥 BUTTONS */}
      <button onClick={handleDownload} style={styles.button}>
        Download PDF
      </button>

      <button onClick={() => navigate("/dashboard")} style={styles.button}>
        Back to Dashboard
      </button>
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
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  certificateBox: {
    border: "2px solid #22c55e",
    padding: "40px",
    borderRadius: "12px",
    textAlign: "center",
    marginBottom: "30px",
    width: "80%",
    maxWidth: "600px",
  },
  center: {
    background: "#020617",
    minHeight: "100vh",
    color: "white",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
  },
  button: {
    marginTop: "15px",
    padding: "10px 20px",
    background: "#38bdf8",
    border: "none",
    borderRadius: "6px",
    color: "white",
    cursor: "pointer",
  },
};

export default Certificate;