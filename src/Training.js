import { useEffect, useState } from "react";
import { db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";
import { useParams } from "react-router-dom";

function Training() {
  const { courseId } = useParams();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ================= FETCH COURSE ================= */

  useEffect(() => {
    if (!courseId) {
      console.log("❌ No courseId in URL");
      setLoading(false);
      return;
    }

    const fetchCourse = async () => {
      try {
        console.log("🔥 FETCHING COURSE:", courseId);

        const docRef = doc(db, "courses", courseId);
        const snap = await getDoc(docRef);

        if (snap.exists()) {
          const data = snap.data();
          console.log("✅ COURSE FOUND:", data);
          setCourse(data);
        } else {
          console.log("❌ NO COURSE FOUND IN FIRESTORE");
          setError("Course not found");
        }

      } catch (err) {
        console.error("🔥 ERROR FETCHING COURSE:", err);
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  /* ================= STATES ================= */

  if (loading) {
    return (
      <div style={styles.center}>
        Loading course...
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.center}>
        {error}
      </div>
    );
  }

  if (!course) {
    return (
      <div style={styles.center}>
        No course found
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>{course.title}</h1>

        <p style={styles.description}>
          {course.description}
        </p>

        <div style={styles.content}>
          {course.content}
        </div>
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
    background: "rgba(15, 23, 42, 0.9)",
    padding: "40px",
    borderRadius: "12px",
    width: "500px",
    border: "1px solid #1e293b",
    textAlign: "center",
  },
  title: {
    marginBottom: "10px",
  },
  description: {
    color: "#94a3b8",
    marginBottom: "20px",
  },
  content: {
    fontSize: "16px",
    lineHeight: "1.6",
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