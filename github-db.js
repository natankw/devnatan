/* ==========================================================
   R.H.S — BANCO DE DADOS VIA FIREBASE (Realtime Database)
   ========================================================== */

const firebaseConfig = {
  apiKey: "AIzaSyDJcdS3z8K1gCiHhs-HYxNq0Hd8FWz6ul0",
  authDomain: "rhs666-b92a3.firebaseapp.com",
  databaseURL: "https://rhs666-b92a3-default-rtdb.firebaseio.com",
  projectId: "rhs666-b92a3",
  storageBucket: "rhs666-b92a3.firebasestorage.app",
  messagingSenderId: "198556078911",
  appId: "1:198556078911:web:08475b3f220c65046d398a",
  measurementId: "G-C0411HLJ2K"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// TROQUE por uma senha sua — é ela que libera o painel admin
const SENHA_ADMIN = "rhs2026";

const DB_PADRAO = { comunidades: [], aliados: [], admins: [], config: {} };

function novoId(prefixo) {
  return `${prefixo}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function ghToken() {
  return sessionStorage.getItem("rhs_senha") || "";
}
function ghSalvarToken(senha) {
  sessionStorage.setItem("rhs_senha", senha);
}
function ghLimparToken() {
  sessionStorage.removeItem("rhs_senha");
}

async function ghTestarToken() {
  if (ghToken() !== SENHA_ADMIN) {
    return { ok: false, motivo: "Senha incorreta." };
  }
  return { ok: true };
}

async function ghCarregarPublico() {
  try {
    const snap = await db.ref("/").once("value");
    const data = snap.exists() ? snap.val() : JSON.parse(JSON.stringify(DB_PADRAO));
    data.comunidades = data.comunidades || [];
    data.aliados = data.aliados || [];
    data.admins = data.admins || [];
    data.config = data.config || {};
    return data;
  } catch (e) {
    console.warn("Não foi possível carregar o Firebase:", e.message);
    return JSON.parse(JSON.stringify(DB_PADRAO));
  }
}

async function ghCarregar() {
  const data = await ghCarregarPublico();
  return { data, sha: null };
}

async function ghSalvar(data, mensagem) {
  await db.ref("/").set(data);
  return true;
}
