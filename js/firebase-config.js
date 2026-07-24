/* ==========================================================
   R.H.S — CONFIGURAÇÃO DO FIREBASE
   ==========================================================
   Preencha com as chaves do SEU projeto Firebase.
   Veja o passo a passo completo em README.md ("1. Criar o Firebase").
   Essas chaves são públicas por natureza (o Firebase foi feito
   para isso) — a segurança real vem das Regras do Firestore e
   do Firebase Authentication, não do sigilo dessas chaves.
   ========================================================== */

const firebaseConfig = {
  apiKey: "COLE_AQUI_SUA_API_KEY",
  authDomain: "COLE_AQUI.firebaseapp.com",
  projectId: "COLE_AQUI_O_PROJECT_ID",
  storageBucket: "COLE_AQUI.appspot.com",
  messagingSenderId: "COLE_AQUI",
  appId: "COLE_AQUI_O_APP_ID"
};

// Inicializa o Firebase (SDK compat, carregado via <script> no HTML)
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
