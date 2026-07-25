/* ==========================================================
   R.H.S — CONFIGURAÇÃO DO FIREBASE
   ========================================================== */

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyD8O6S_ss0Jhgpcivns6auPwG30dj5jBq0",
  authDomain: "kh-ws-a4dce.firebaseapp.com",
  projectId: "kh-ws-a4dce",
  storageBucket: "kh-ws-a4dce.firebasestorage.app",
  messagingSenderId: "100025478991",
  appId: "1:100025478991:web:0743dc42c86aa0206f5f3a",
  measurementId: "G-VLL6D51VS0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const analytics = getAnalytics(app);

export { db, analytics };
