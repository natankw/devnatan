/* ==========================================================
   R.H.S V5 — LÓGICA DO SITE (dados via GitHub, sem Firebase)
   ========================================================== */

/* ---------- fundo: chuva de código estilo matrix (cinza) ---------- */
(function sinalFundo(){
  const canvas = document.getElementById("sinal");
  if(!canvas) return;
  const ctx = canvas.getContext("2d");
  let w, h, colunas, tamanhoFonte = 15, gotas = [];

  const CARACTERES = "01アイウエオカキクケコサシスセソ<>{}[]/*;:$%#@!R.H.S";
  const CORES = ["#6B7280", "#4B5563", "#9CA3AF", "#374151"];

  function resize(){
    w = canvas.width = innerWidth;
    h = canvas.height = innerHeight;
    colunas = Math.floor(w / tamanhoFonte);
    gotas = Array.from({length: colunas}, () => ({
      y: Math.random() * -h,
      vel: Math.random() * 4 + 3,
      cor: CORES[Math.floor(Math.random()*CORES.length)]
    }));
  }
  resize();
  addEventListener("resize", resize);

  function tick(){
    ctx.fillStyle = "rgba(6,5,7,.16)";
    ctx.fillRect(0,0,w,h);

    ctx.font = tamanhoFonte + "px monospace";
    for(let i=0;i<colunas;i++){
      const g = gotas[i];
      const char = CARACTERES[Math.floor(Math.random()*CARACTERES.length)];
      ctx.fillStyle = g.cor;
      ctx.globalAlpha = 0.55;
      ctx.fillText(char, i*tamanhoFonte, g.y);

      g.y += g.vel;
      if(g.y > h && Math.random() > 0.975){
        g.y = Math.random() * -100;
        g.vel = Math.random() * 4 + 3;
        g.cor = CORES[Math.floor(Math.random()*CORES.length)];
      }
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(tick);
  }
  tick();
})();

/* ---------- ícones (substituem os emojis) ---------- */
const ICONE_GRUPO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 20v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1"/><circle cx="9" cy="7" r="3"/><path d="M22.5 20v-1a3.5 3.5 0 0 0-2.5-3.36"/><path d="M16 3.5a3.5 3.5 0 0 1 0 6.8"/></svg>';
const ICONE_CANAL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10v4a1 1 0 0 0 1 1h2l4 5V4L6 9H4a1 1 0 0 0-1 1Z"/><path d="M14.5 8a4 4 0 0 1 0 8"/><path d="M18 5a8 8 0 0 1 0 14"/></svg>';
const ICONE_ALIADO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.5l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.2-5.4 3.2 1.3-6-4.6-4.1 6.1-.6L12 3.5Z"/></svg>';

/* ---------- toast ---------- */
function toast(msg){
  const el = document.getElementById("toast");
  if(!el) return;
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(el._t);
  el._t = setTimeout(()=>{ el.hidden = true; }, 3200);
}

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
  };
}

/* ---------- estado ---------- */
let TODAS = [];
let FILTRO_ATUAL = "todos";
let CATEGORIA_ATUAL = "todas";
let TERMO_BUSCA = "";
let BANCO = null;

/* ==========================================================
   CARREGAMENTO ÚNICO (lê data/db.json direto, sem token)
   ========================================================== */
async function iniciar(){
  BANCO = await ghCarregarPublico();
  aplicarConfigSite(BANCO.config || {});
  carregarComunidades();
  carregarAliados();
  carregarAdmins();
}

function aplicarConfigSite(c){
  if(c.nome) document.title = `${c.nome} — Central de Comunidades`;
  if(c.logo){
    const logoCanal = document.getElementById("logoCanal");
    const logoEntrada = document.getElementById("logoEntrada");
    if(logoCanal) logoCanal.src = c.logo;
    if(logoEntrada) logoEntrada.src = c.logo;
  }
  if(c.descricao) document.getElementById("siteDescricao").textContent = c.descricao;
  if(c.whatsapp) document.getElementById("canalOficial").href = c.whatsapp;
  if(c.musica) document.getElementById("music").setAttribute("src", c.musica);
  if(c.footer) document.getElementById("footerTexto").textContent = c.footer;
}

/* ==========================================================
   COMUNIDADES (grupos + canais)
   ========================================================== */
function carregarComunidades(){
  TODAS = (BANCO.comunidades || []).slice().sort((a,b) => (b.criadoEm||0) - (a.criadoEm||0));
  aplicarFiltros();
  document.getElementById("totalComunidades").textContent = TODAS.length;
}

function aplicarFiltros(){
  let lista = [...TODAS];

  if(FILTRO_ATUAL === "grupo") lista = lista.filter(i => i.tipo === "grupo");
  else if(FILTRO_ATUAL === "canal") lista = lista.filter(i => i.tipo === "canal");
  else if(FILTRO_ATUAL === "vip") lista = lista.filter(i => i.vip);
  else if(FILTRO_ATUAL === "recentes"){
    const seteDias = Date.now() - 7*24*60*60*1000;
    lista = lista.filter(i => i.criadoEm && i.criadoEm > seteDias);
  }

  if(CATEGORIA_ATUAL !== "todas"){
    lista = lista.filter(i => (i.categoria||"") === CATEGORIA_ATUAL);
  }

  if(TERMO_BUSCA){
    lista = lista.filter(i => (i.titulo||"").toLowerCase().includes(TERMO_BUSCA));
  }

  lista.sort((a,b) => (b.fixado?1:0) - (a.fixado?1:0));

  renderComunidades(lista);

  document.getElementById("qtdMostrada").textContent = lista.length;
  document.getElementById("qtdTotal").textContent = TODAS.length;
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
    area.innerHTML += criarCard(item, item.tipo === "canal" ? ICONE_CANAL : ICONE_GRUPO);
  });
}

/* ==========================================================
   ALIADOS / PARCEIROS
   ========================================================== */
function carregarAliados(){
  const area = document.getElementById("parceiros");
  const lista = (BANCO.aliados || []).slice().sort((a,b) => (b.criadoEm||0) - (a.criadoEm||0));
  document.getElementById("totalAliados").textContent = lista.length;
  area.innerHTML = "";
  document.getElementById("vazioParceiros").hidden = lista.length !== 0;
  lista.forEach(item => { area.innerHTML += criarCard(item, ICONE_ALIADO); });
}

/* ==========================================================
   CARD (usado por comunidades e aliados)
   ========================================================== */
function criarCard(item, icone){
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
    </div>
    <div class="community-info">
      <h3>${item.titulo || "Comunidade"}</h3>
      <p>${item.desc || "Comunidade R.H.S"}</p>
      <div class="community-meta">
        <span>${item.categoria || "Geral"}</span>
      </div>
      <a href="${item.link || '#'}" target="_blank" rel="noopener" class="card-button">Entrar →</a>
    </div>
  </div>`;
}

/* ==========================================================
   BUSCA + FILTROS
   ========================================================== */
const pesquisa = document.getElementById("pesquisa");
if(pesquisa){
  pesquisa.addEventListener("input", (e)=>{
    TERMO_BUSCA = e.target.value.toLowerCase().trim();
    aplicarFiltros();
  });
}

document.querySelectorAll(".filtro-pill.principal").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filtro-pill.principal").forEach(b => { b.classList.remove("active"); b.setAttribute("aria-selected","false"); });
    btn.classList.add("active");
    btn.setAttribute("aria-selected","true");
    FILTRO_ATUAL = btn.dataset.f;
    aplicarFiltros();
  });
});

document.querySelectorAll(".filtros-cat .filtro-pill").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filtros-cat .filtro-pill").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    CATEGORIA_ATUAL = btn.dataset.cat;
    aplicarFiltros();
  });
});

/* ==========================================================
   PARCERIA (ADM / WhatsApp)
   ========================================================== */
function carregarAdmins(){
  const select = document.getElementById("admSelect");
  select.innerHTML = "";
  (BANCO.admins || []).forEach(a => {
    select.innerHTML += `<option value="${a.numero}">${a.nome}</option>`;
  });
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
   INICIALIZAÇÃO
   ========================================================== */
iniciar();
