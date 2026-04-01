import { useState } from "react";
import { auth, db } from "./firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const signup = async () => {
    if (!email || !password || !company) {
      alert("Please fill all fields");
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Save user
      await setDoc(doc(db, "users", userCredential.user.uid), {
        email,
        company,
        isSubscribed: false,
        createdAt: new Date()
      });

      alert("Account created 🎉");
      navigate("/dashboard");

    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        alert("Email already registered");
      } else if (err.code === "auth/weak-password") {
        alert("Password should be at least 6 characters");
      } else {
        alert("Signup failed");
      }
    }

    setLoading(false);
  };

  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      <h2>Sign Up</h2>

      <input placeholder="Company Name" onChange={e => setCompany(e.target.value)} /><br /><br />
      <input placeholder="Email" onChange={e => setEmail(e.target.value)} /><br /><br />
      <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} /><br /><br />

      <button onClick={signup} disabled={loading}>
        {loading ? "Creating..." : "Create Account"}
      </button>
    </div>
  );
}

export default Signup;