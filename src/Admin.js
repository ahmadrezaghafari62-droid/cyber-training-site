import { useEffect, useState } from "react";
import { db, auth } from "./firebase";
import { collection, getDocs } from "firebase/firestore";

function Admin() {
  const [users, setUsers] = useState([]);
  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const snapshot = await getDocs(collection(db, "progress"));

        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setUsers(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // 🔒 Admin protection MUST be after hooks
  if (!currentUser || currentUser.email !== "ahmad.r.ghafari@gmail.com") {
    return (
      <h2 style={{ color: "white", textAlign: "center", marginTop: "50px" }}>
        Access Denied
      </h2>
    );
  }

  return (
    <div
      style={{
        background: "#020617",
        minHeight: "100vh",
        color: "white",
        padding: "40px"
      }}
    >
      <h1>Admin Dashboard</h1>

      {users.length === 0 && <p>No user data found</p>}

      {users.map((userData, index) => (
        <div
          key={index}
          style={{
            background: "#0f172a",
            padding: "20px",
            marginTop: "20px",
            borderRadius: "10px"
          }}
        >
          <h3>User ID: {userData.id}</h3>

          {userData.courses &&
            Object.entries(userData.courses).map(([course, data], i) => {
              const percentage =
                data.total > 0
                  ? Math.round((data.score / data.total) * 100)
                  : 0;

              return (
                <div key={i} style={{ marginTop: "10px" }}>
                  <h4>{course}</h4>

                  <div
                    style={{
                      height: "10px",
                      background: "#1e293b",
                      borderRadius: "5px",
                      overflow: "hidden"
                    }}
                  >
                    <div
                      style={{
                        width: `${percentage}%`,
                        height: "100%",
                        background: percentage === 100 ? "green" : "orange"
                      }}
                    ></div>
                  </div>

                  <p>
                    Score: {data.score} / {data.total} ({percentage}%)
                  </p>

                  <p>
                    Risk:{" "}
                    {percentage === 100
                      ? "🟢 Low Risk"
                      : "🔴 Needs Training"}
                  </p>
                </div>
              );
            })}
        </div>
      ))}
    </div>
  );
}

export default Admin;