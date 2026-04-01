import { useState } from "react";
import { auth } from "./firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const login = async () => {
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    try {
      await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword);
      alert("Logged in!");
      navigate("/dashboard");
    } catch (err) {
      if (err.code === "auth/user-not-found") {
        alert("User not found");
      } else if (err.code === "auth/wrong-password") {
        alert("Wrong password");
      } else if (err.code === "auth/invalid-email") {
        alert("Invalid email format");
      } else if (err.code === "auth/invalid-credential") {
        alert("Invalid email or password");
      } else {
        alert("Login failed");
      }
    }
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Login</h2>

      <input
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <br /><br />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <br /><br />

      <button onClick={login}>
        Login
      </button>
    </div>
  );
}

export default Login;