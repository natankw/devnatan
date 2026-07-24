/* ==========================================================
   R.H.S V5 — LÓGICA DO SITE
   ========================================================== */

/* ---------- fundo: sinal (canvas leve, no lugar da chuva matrix) ---------- */
(function sinalFundo(){
  const canvas = document.getElementById("sinal");
  if(!canvas) return;
  const ctx = canvas.getContext("2d");
  let w, h, pontos = [];

  function resize(){
    w = canvas.width = innerWidth;
    h = canvas.height = innerHeight;
    const total = Math.floor((w*h)/26000);
    pontos = Array.from({length: total}, () => ({
      x: Math.random()*w, y: Math.random()*h,
      r: Math.random()*1.6+.4,
      vy: Math.random()*.15+.05
    }));
  }
  resize();
  addEventListener("resize", resize);

  function tick(){
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle = "rgba(46,230,166,.55)";
    pontos.forEach(p=>{
      ctx.beginPath();
      ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fill();
      p.y -= p.vy;
      if(p.y < 0) p.y = h;
    });
    requestAnimationFrame(tick);
  }
  tick();
})();

/* ---------- entrada + música ---------- */
const entrar = document.getElementById("entrar");
const welcome = document.getElementById("welcome");
const site = document.getElementById("site");
const music = document.getElementById("music");

if(entrar){
  entrar.onclick = () => {
    if(music && music.getAttribute("src")) music.play().catch(()=>{});
    if(welcome) welcome.style.display = "none";
    if(site) site.style.display = "block";
    registrarVisita();
  };
}

/* ---------- toast ---------- */
function toast(msg){
  const el = document.getElementById("toast");
  if(!el) return;
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(el._t);
  el._t = setTimeout(()=>{ el.hidden = true; }, 3200);
}

/* ---------- estado ---------- */
let TODAS = [];      // comunidades (grupos + canais)
let FILTRO_ATUAL = "todos";
let TERMO_BUSCA = "";

/* ==========================================================
   CARREGAR CONFIGURAÇÃO DO SITE
   ========================================================== */
async function carregarConfigSite(){
  try{
    const doc = await db.collection("config").doc("site").get();
    if(!doc.exists) return;
    const c = doc.data();
    if(c.nome) document.title = `${c.nome} — Central de Comunidades`;
    if(c.descricao) document.getElementById("siteDescricao").textContent = c.descricao;
    if(c.whatsapp) document.getElementById("canalOficial").href = c.whatsapp;
    if(c.musica) document.getElementById("music").setAttribute("src", c.musica);
    if(c.footer) document.getElementById("footerTexto").textContent = c.footer;
  }catch(e){
    console.warn("Config do site indisponível ainda:", e.message);
  }
}

/* ==========================================================
   COMUNIDADES (grupos + canais)
   ========================================================== */
async function carregarComunidades(){
  const area = document.getElementById("comunidades");
  area.innerHTML = `<div class="skeleton" style="height:220px;border-radius:16px;"></div>
                     <div class="skeleton" style="height:220px;border-radius:16px;"></div>
                     <div class="skeleton" style="height:220px;border-radius:16px;"></div>`;
  try{
    const snap = await db.collection("comunidades").orderBy("criadoEm","desc").get();
    TODAS = snap.docs.map(d => ({ id:d.id, ...d.data() }));
  }catch(e){
    console.error(e);
    TODAS = [];
  }
  aplicarFiltros();
  atualizarStatsLocais();
}

function aplicarFiltros(){
  let lista = [...TODAS];

  if(FILTRO_ATUAL === "grupo") lista = lista.filter(i => i.tipo === "grupo");
  else if(FILTRO_ATUAL === "canal") lista = lista.filter(i => i.tipo === "canal");
  else if(FILTRO_ATUAL === "vip") lista = lista.filter(i => i.vip);
  else if(FILTRO_ATUAL === "recentes"){
    const seteDias = Date.now() - 7*24*60*60*1000;
    lista = lista.filter(i => i.criadoEm && i.criadoEm.toMillis && i.criadoEm.toMillis() > seteDias);
  }

  if(TERMO_BUSCA){
    lista = lista.filter(i => (i.titulo||"").toLowerCase().includes(TERMO_BUSCA));
  }

  // fixados primeiro
  lista.sort((a,b) => (b.fixado?1:0) - (a.fixado?1:0));

  renderComunidades(lista);
}

function renderComunidades(lista){
  const area = document.getElementById("comunidades");
  const vazio = document.getElementById("vazioComunidades");
  area.innerHTML = "";

  if(lista.length === 0){
    vazio.hidden = false;
    return;
  }
  vazio.hidden = true;

  lista.forEach(item => {
    area.innerHTML += criarCard(item, item.tipo === "canal" ? "📢" : "👥", "comunidades");
  });
}

/* ==========================================================
   ALIADOS / PARCEIROS
   ========================================================== */
async function carregarAliados(){
  const area = document.getElementById("parceiros");
  try{
    const snap = await db.collection("aliados").orderBy("criadoEm","desc").get();
    const lista = snap.docs.map(d => ({ id:d.id, ...d.data() }));
    document.getElementById("statAliados").dataset.target = lista.length;
    area.innerHTML = "";
    document.getElementById("vazioParceiros").hidden = lista.length !== 0;
    lista.forEach(item => { area.innerHTML += criarCard(item, "⭐", "aliados"); });
    animarContadores();
  }catch(e){
    console.error(e);
  }
}

/* ==========================================================
   CARD (usado por comunidades e aliados)
   ========================================================== */
function criarCard(item, icone, colecao){
  const imagem = item.imagem || "img/default-avatar.svg";
  return `
  <div class="community-card">
    <div class="card-media">
      <img src="${imagem}" class="community-img" alt="${item.titulo || 'Comunidade'}"
           onerror="this.src='img/default-avatar.svg'">
      <div class="card-badges">
        ${item.vip ? '<span class="badge badge-vip">VIP</span>' : ''}
        ${item.fixado ? '<span class="badge badge-fixado">Fixado</span>' : ''}
      </div>
      <span class="card-type">${icone}</span>
      <button class="report-btn" title="Denunciar" onclick="abrirDenuncia('${item.id}','${colecao}','${(item.titulo||'').replace(/'/g,"\\'")}')">⚑</button>
    </div>
    <div class="community-info">
      <h3>${item.titulo || "Comunidade"}</h3>
      <p>${item.desc || "Comunidade R.H.S"}</p>
      <div class="community-meta">
        <span>${item.categoria || "Geral"}</span>
        <span>${item.cliques || 0} entradas</span>
      </div>
      <a href="${item.link || '#'}" target="_blank" rel="noopener" class="card-button"
         onclick="registrarClique('${item.id}','${colecao}')">Entrar →</a>
    </div>
  </div>`;
}

async function registrarClique(id, colecao){
  try{
    await db.collection(colecao).doc(id).update({
      cliques: firebase.firestore.FieldValue.increment(1)
    });
  }catch(e){ /* silencioso: não deve travar a navegação do usuário */ }
}

/* ==========================================================
   BUSCA + SINTONIZADOR (tuner)
   ========================================================== */
const pesquisa = document.getElementById("pesquisa");
if(pesquisa){
  pesquisa.addEventListener("input", (e)=>{
    TERMO_BUSCA = e.target.value.toLowerCase().trim();
    aplicarFiltros();
  });
}

document.querySelectorAll(".tuner-btn").forEach((btn, idx) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tuner-btn").forEach(b => { b.classList.remove("active"); b.setAttribute("aria-selected","false"); });
    btn.classList.add("active");
    btn.setAttribute("aria-selected","true");
    FILTRO_ATUAL = btn.dataset.f;
    moverAgulha(btn);
    aplicarFiltros();
  });
});

function moverAgulha(btn){
  const needle = document.getElementById("tunerNeedle");
  if(!needle) return;
  needle.style.width = btn.offsetWidth + "px";
  needle.style.transform = `translateX(${btn.offsetLeft - 5}px)`;
}
window.addEventListener("load", ()=>{
  const ativo = document.querySelector(".tuner-btn.active");
  if(ativo) moverAgulha(ativo);
});
window.addEventListener("resize", ()=>{
  const ativo = document.querySelector(".tuner-btn.active");
  if(ativo) moverAgulha(ativo);
});

/* ==========================================================
   DENÚNCIA
   ========================================================== */
let denunciaAtual = null;
function abrirDenuncia(id, colecao, nome){
  denunciaAtual = { id, colecao };
  document.getElementById("denunciaNome").textContent = nome || "esta comunidade";
  document.getElementById("motivoDenuncia").value = "";
  document.getElementById("detalhesDenuncia").value = "";
  document.getElementById("denunciaSucesso").hidden = true;
  document.getElementById("modalDenuncia").hidden = false;
}
document.getElementById("fecharModal").onclick = () => { document.getElementById("modalDenuncia").hidden = true; };

document.getElementById("enviarDenuncia").onclick = async () => {
  const motivo = document.getElementById("motivoDenuncia").value;
  if(!motivo){ toast("Selecione um motivo."); return; }
  try{
    await db.collection("denuncias").add({
      itemId: denunciaAtual.id,
      colecao: denunciaAtual.colecao,
      motivo,
      detalhes: document.getElementById("detalhesDenuncia").value,
      criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
      resolvida: false
    });
    document.getElementById("denunciaSucesso").hidden = false;
  }catch(e){
    toast("Não foi possível enviar agora. Tente novamente.");
  }
};

/* ==========================================================
   PARCERIA (ADM / WhatsApp)
   ========================================================== */
async function carregarAdmins(){
  try{
    const snap = await db.collection("admins").get();
    const select = document.getElementById("admSelect");
    select.innerHTML = "";
    snap.docs.forEach(d => {
      const a = d.data();
      select.innerHTML += `<option value="${a.numero}">${a.nome}</option>`;
    });
  }catch(e){ console.error(e); }
}

const whatsappBtn = document.getElementById("whatsapp");
if(whatsappBtn){
  whatsappBtn.onclick = () => {
    const numero = document.getElementById("admSelect").value;
    if(!numero){ toast("Nenhum ADM cadastrado ainda."); return; }
    const msg = document.getElementById("mensagemParceria").value;
    window.open(`https://wa.me/${numero}?text=${encodeURIComponent(msg)}`, "_blank");
  };
}

/* ==========================================================
   ESTATÍSTICAS (contagem animada)
   ========================================================== */
function atualizarStatsLocais(){
  const grupos = TODAS.filter(i => i.tipo === "grupo").length;
  const canais = TODAS.filter(i => i.tipo === "canal").length;
  document.getElementById("statGrupos").dataset.target = grupos;
  document.getElementById("statCanais").dataset.target = canais;
  animarContadores();
}

function animarContadores(){
  document.querySelectorAll(".signal-value[data-target]").forEach(el => {
    const alvo = parseInt(el.dataset.target || "0", 10);
    const atual = parseInt(el.textContent || "0", 10);
    if(atual === alvo) return;
    let n = atual;
    const passo = () => {
      n += Math.max(1, Math.ceil((alvo-n)/8));
      if(n >= alvo){ el.textContent = alvo; return; }
      el.textContent = n;
      requestAnimationFrame(passo);
    };
    passo();
  });
}

/* ==========================================================
   VISITANTES + ONLINE AGORA (presença simples via Firestore)
   ========================================================== */
function idDeSessao(){
  let id = sessionStorage.getItem("rhs_sid");
  if(!id){
    id = "s_" + Math.random().toString(36).slice(2) + Date.now();
    sessionStorage.setItem("rhs_sid", id);
  }
  return id;
}

async function registrarVisita(){
  try{
    await db.collection("visitas").doc(idDeSessao()).set({
      ultimoAcesso: firebase.firestore.FieldValue.serverTimestamp()
    });
  }catch(e){ /* não bloqueia a experiência */ }
  manterPresenca();
  atualizarContadoresGlobais();
}

function manterPresenca(){
  registrarPresencaAgora();
  setInterval(registrarPresencaAgora, 60000); // renova a cada 60s
}
async function registrarPresencaAgora(){
  try{
    await db.collection("visitas").doc(idDeSessao()).set({
      ultimoAcesso: firebase.firestore.FieldValue.serverTimestamp()
    });
  }catch(e){}
}

async function atualizarContadoresGlobais(){
  try{
    const doisMin = new Date(Date.now() - 2*60000);
    const snapOnline = await db.collection("visitas")
      .where("ultimoAcesso", ">", doisMin).get();
    document.getElementById("statOnline").textContent = snapOnline.size;

    const snapTotal = await db.collection("visitas").get();
    document.getElementById("statVisitantes").dataset.target = snapTotal.size;
    animarContadores();
  }catch(e){ console.warn("Contadores de visitantes indisponíveis:", e.message); }
}

/* ==========================================================
   INICIALIZAÇÃO
   ========================================================== */
(async function iniciar(){
  await carregarConfigSite();
  await Promise.all([carregarComunidades(), carregarAliados(), carregarAdmins()]);
})();
