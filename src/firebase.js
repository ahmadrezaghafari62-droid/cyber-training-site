import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBNLZjJSjPw_0cQKZTC_J4O6euP97LxPPE",
  authDomain: "cyber-training-site.firebaseapp.com",
  projectId: "cyber-training-site",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);