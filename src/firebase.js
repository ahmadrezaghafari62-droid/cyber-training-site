import { initializeApp } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

/* 🔥 FULL CONFIG (REQUIRED) */
const firebaseConfig = {
  apiKey: "AIzaSyBNLZjJSjPw_0cQKZTC_J4O6euP97LxPPE",
  authDomain: "cyber-training-site.firebaseapp.com",
  projectId: "cyber-training-site",
  storageBucket: "cyber-training-site.appspot.com",
  messagingSenderId: "394992113774",
  appId: "1:394992113774:web:a4a66f3df77be51eb36e7f",
};

/* 🔥 INIT APP */
const app = initializeApp(firebaseConfig);

/* 🔥 SERVICES */
const auth = getAuth(app);
const db = getFirestore(app);

/* 🔥 PERSIST LOGIN */
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("✅ Persistence set");
  })
  .catch((err) => {
    console.error("❌ Persistence error:", err);
  });

/* 🔥 EXPORT */
export { auth, db };