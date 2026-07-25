// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyD8O6S_ss0Jhgpcivns6auPwG30dj5jBq0",
  authDomain: "kh-ws-a4dce.firebaseapp.com",
  projectId: "kh-ws-a4dce",
  storageBucket: "kh-ws-a4dce.firebasestorage.app",
  messagingSenderId: "100025478991",
  appId: "1:100025478991:web:0743dc42c86aa0206f5f3a",
  measurementId: "G-VLL6D51VS0"
};

// Inicializa o Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
