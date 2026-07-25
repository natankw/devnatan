/* ==========================================================
   R.H.S — CONFIGURAÇÃO DO FIREBASE
   ========================================================== */

const firebaseConfig = {
  apiKey: "AIzaSyD8O6S_ss0Jhgpcivns6auPwG30dj5jBq0",
  authDomain: "kh-ws-a4dce.firebaseapp.com",
  projectId: "kh-ws-a4dce",
  storageBucket: "kh-ws-a4dce.firebasestorage.app",
  messagingSenderId: "100025478991",
  appId: "1:100025478991:web:0743dc42c86aa0206f5f3a",
  measurementId: "G-VLL6D51VS0"
};

let db, auth;

try{
  firebase.initializeApp(firebaseConfig);
  db = firebase.firestore();
  auth = firebase.auth();
}catch(erroFirebase){
  document.addEventListener("DOMContentLoaded", () => {
    const aviso = document.createElement("div");
    aviso.style = "position:fixed;top:0;left:0;right:0;background:#B0555E;color:#fff;padding:14px;font-family:sans-serif;font-size:14px;z-index:99999;text-align:center;";
    aviso.textContent = "Erro ao carregar o Firebase: " + erroFirebase.message;
    document.body.prepend(aviso);
  });
  console.error("Erro ao inicializar o Firebase:", erroFirebase);
}
