/* ==========================================================
   R.H.S — MOTOR DO SITE PÚBLICO (index.html)
   ==========================================================
   Antes esse arquivo só tinha a busca automática do WhatsApp
   (que é função do painel admin). Faltava TUDO que faz o site
   funcionar: tirar a tela de entrada, carregar o data/db.json,
   desenhar os cards, filtros, busca e o botão de parceria.
   Por isso o site ficava travado na tela preta de "Entrar".
   ========================================================== */

let BANCO = { comunidades: [], aliados: [], admins: [], config: {} };
let filtroTipoAtual = "todos";
let filtroCategoriaAtual = "todas";
let textoBuscaAtual = "";

document.addEventListener("DOMContentLoaded", () => {
  iniciarCanvasSinal();
  ligarTelaEntrada();
  ligarFiltrosEBusca();
  carregarESiteMostrar();

  // mantém a busca automática do WhatsApp (usada dentro do admin,
  // mas o listener só ativa se o botão existir na página)
  const botoes = document.querySelectorAll("button");
  for (const btn of botoes) {
    if (btn.textContent.includes("Buscar automaticamente") || btn.id === "btnBuscar") {
      btn.addEventListener("click", buscarAutomaticamente);
      break;
    }
  }
});

/* ---------- tela de entrada ---------- */
function ligarTelaEntrada() {
  const btnEntrar = document.getElementById("entrar");
  const welcome = document.getElementById("welcome");
  const site = document.getElementById("site");
  const music = document.getElementById("music");

  if (!btnEntrar) return;

  btnEntrar.addEventListener("click", () => {
    welcome.style.display = "none";
    site.style.display = "block";
    if (music && music.src) {
      music.play().catch(() => {}); // autoplay pode ser bloqueado, tudo bem
    }
  });
}

/* ---------- carregar dados e montar o site ---------- */
async function carregarESiteMostrar() {
  try {
    BANCO = await ghCarregarPublico();
  } catch (e) {
    console.error("Erro ao carregar banco de dados:", e);
    BANCO = { comunidades: [], aliados: [], admins: [], config: {} };
  }

  aplicarConfig(BANCO.config || {});
  montarSelectAdmins(BANCO.admins || []);
  renderizarTudo();
}

function aplicarConfig(config) {
  const logoEntrada = document.getElementById("logoEntrada");
  const logoCanal = document.getElementById("logoCanal");
  const siteDescricao = document.getElementById("siteDescricao");
  const canalOficial = document.getElementById("canalOficial");
  const footerTexto = document.getElementById("footerTexto");
  const music = document.getElementById("music");

  if (config.logo) {
    if (logoEntrada) logoEntrada.src = config.logo;
    if (logoCanal) logoCanal.src = config.logo;
  }
  if (config.descricao && siteDescricao) siteDescricao.textContent = config.descricao;
  if (config.whatsapp && canalOficial) canalOficial.href = config.whatsapp;
  if (config.footer && footerTexto) footerTexto.textContent = config.footer;
  if (config.nome) document.title = `${config.nome} — Central de Comunidades`;
  if (config.musica && music) music.src = config.musica;
}

function montarSelectAdmins(admins) {
  const select = document.getElementById("admSelect");
  const secaoParceria = document.querySelector(".parceria");
  if (!select) return;

  select.innerHTML = "";

  if (!admins.length) {
    if (secaoParceria) secaoParceria.style.display = "none";
    return;
  }

  admins.forEach((adm) => {
    const opt = document.createElement("option");
    opt.value = adm.numero;
    opt.textContent = adm.nome;
    select.appendChild(opt);
  });

  const btnWhats = document.getElementById("whatsapp");
  if (btnWhats && !btnWhats.dataset.ligado) {
    btnWhats.dataset.ligado = "1";
    btnWhats.addEventListener("click", () => {
      const numero = select.value;
      const texto = document.getElementById("mensagemParceria")?.value || "";
      if (!numero) return;
      const url = `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
      window.open(url, "_blank", "noopener");
    });
  }
}

/* ---------- filtros e busca ---------- */
function ligarFiltrosEBusca() {
  document.querySelectorAll(".filtro-pill.principal[data-f]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filtro-pill.principal[data-f]").forEach((b) => {
        b.classList.remove("active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("active");
      btn.setAttribute("aria-selected", "true");
      filtroTipoAtual = btn.dataset.f;
      renderizarTudo();
    });
  });

  document.querySelectorAll(".filtro-pill[data-cat]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filtro-pill[data-cat]").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      filtroCategoriaAtual = btn.dataset.cat;
      renderizarTudo();
    });
  });

  const pesquisa = document.getElementById("pesquisa");
  if (pesquisa) {
    pesquisa.addEventListener("input", () => {
      textoBuscaAtual = pesquisa.value.trim().toLowerCase();
      renderizarTudo();
    });
  }
}

/* ---------- filtragem ---------- */
function comunidadesFiltradas() {
  let lista = [...(BANCO.comunidades || [])];

  if (filtroTipoAtual === "grupo") lista = lista.filter((c) => c.tipo === "grupo");
  else if (filtroTipoAtual === "canal") lista = lista.filter((c) => c.tipo === "canal");
  else if (filtroTipoAtual === "vip") lista = lista.filter((c) => c.vip);
  else if (filtroTipoAtual === "recentes") {
    const seteDias = 7 * 24 * 60 * 60 * 1000;
    const agora = Date.now();
    lista = lista.filter((c) => agora - (c.criadoEm || 0) <= seteDias);
  }

  if (filtroCategoriaAtual !== "todas") {
    lista = lista.filter((c) => c.categoria === filtroCategoriaAtual);
  }

  if (textoBuscaAtual) {
    lista = lista.filter(
      (c) =>
        (c.titulo || "").toLowerCase().includes(textoBuscaAtual) ||
        (c.desc || "").toLowerCase().includes(textoBuscaAtual)
    );
  }

  // fixados primeiro, depois mais recentes
  lista.sort((a, b) => {
    if (!!b.fixado !== !!a.fixado) return b.fixado ? 1 : -1;
    return (b.criadoEm || 0) - (a.criadoEm || 0);
  });

  return lista;
}

/* ---------- render principal ---------- */
function renderizarTudo() {
  const todasComunidades = BANCO.comunidades || [];
  const filtradas = comunidadesFiltradas();
  const canais = filtradas.filter((c) => c.tipo === "canal");
  const grupos = filtradas.filter((c) => c.tipo === "grupo");

  setTexto("totalComunidades", todasComunidades.length);
  setTexto("qtdTotal", todasComunidades.length);
  setTexto("qtdMostrada", filtradas.length);
  setTexto("totalCanais", canais.length);
  setTexto("totalGrupos", grupos.length);
  setTexto("totalAliados", (BANCO.aliados || []).length);

  renderizarLista("canais", canais, "vazioCanais");
  renderizarLista("grupos", grupos, "vazioGrupos");
  renderizarLista("parceiros", BANCO.aliados || [], "vazioParceiros", true);

  const vazioGeral = document.getElementById("vazioComunidades");
  if (vazioGeral) vazioGeral.hidden = filtradas.length > 0;
}

function setTexto(id, valor) {
  const el = document.getElementById(id);
  if (el) el.textContent = valor;
}

function renderizarLista(idContainer, itens, idVazio, ehParceiro = false) {
  const container = document.getElementById(idContainer);
  const vazio = document.getElementById(idVazio);
  if (!container) return;

  container.innerHTML = "";

  if (!itens.length) {
    if (vazio) vazio.hidden = false;
    return;
  }
  if (vazio) vazio.hidden = true;

  itens.forEach((item) => {
    container.appendChild(ehParceiro ? criarCardParceiro(item) : criarCardComunidade(item));
  });
}

function iconeTipo(tipo) {
  if (tipo === "canal") {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10v4a1 1 0 0 0 1 1h2l4 5V4L6 9H4a1 1 0 0 0-1 1Z"/><path d="M14.5 8a4 4 0 0 1 0 8"/><path d="M18 5a8 8 0 0 1 0 14"/></svg>';
  }
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 20v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1"/><circle cx="9" cy="7" r="3"/><path d="M22.5 20v-1a3.5 3.5 0 0 0-2.5-3.36"/><path d="M16 3.5a3.5 3.5 0 0 1 0 6.8"/></svg>';
}

function escapeHtml(txt) {
  const div = document.createElement("div");
  div.textContent = txt || "";
  return div.innerHTML;
}

function criarCardComunidade(item) {
  const div = document.createElement("div");
  div.className = "community-card";

  const badges = [];
  if (item.vip) badges.push('<span class="badge badge-vip">VIP</span>');
  if (item.fixado) badges.push('<span class="badge badge-fixado">Fixado</span>');

  div.innerHTML = `
    <div class="card-media">
      <img class="community-img" src="${escapeHtml(item.imagem)}" alt="${escapeHtml(item.titulo)}"
           onerror="this.onerror=null;this.src='img/default-avatar.svg';">
      <div class="card-badges">${badges.join("")}</div>
      <div class="card-type">${iconeTipo(item.tipo)}</div>
    </div>
    <div class="community-info">
      <h3>${escapeHtml(item.titulo)}</h3>
      <p>${escapeHtml(item.desc || "")}</p>
      <div class="community-meta">
        <span>${escapeHtml(item.categoria || "")}</span>
      </div>
      <a class="card-button" href="${escapeHtml(item.link)}" target="_blank" rel="noopener">
        Entrar ${item.tipo === "canal" ? "no canal" : "no grupo"}
      </a>
    </div>
  `;
  return div;
}

function criarCardParceiro(item) {
  const div = document.createElement("div");
  div.className = "community-card";
  div.innerHTML = `
    <div class="card-media">
      <img class="community-img" src="${escapeHtml(item.imagem)}" alt="${escapeHtml(item.titulo || item.nome)}"
           onerror="this.onerror=null;this.src='img/default-avatar.svg';">
    </div>
    <div class="community-info">
      <h3>${escapeHtml(item.titulo || item.nome)}</h3>
      <p>${escapeHtml(item.desc || "")}</p>
      <a class="card-button" href="${escapeHtml(item.link)}" target="_blank" rel="noopener">Visitar</a>
    </div>
  `;
  return div;
}

/* ---------- fundo animado (canvas #sinal) ---------- */
function iniciarCanvasSinal() {
  const canvas = document.getElementById("sinal");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let pontos = [];

  function ajustarTamanho() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  ajustarTamanho();
  window.addEventListener("resize", ajustarTamanho);

  const quantidade = 60;
  for (let i = 0; i < quantidade; i++) {
    pontos.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3
    });
  }

  function desenhar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#FF0000";
    pontos.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.4, 0, Math.PI * 2);
      ctx.fill();
    });
    requestAnimationFrame(desenhar);
  }
  desenhar();
}

/* ==========================================================
   BUSCA AUTOMÁTICA DO WHATSAPP (usada no painel admin)
   ========================================================== */
async function buscarAutomaticamente() {
  const linkInput = document.getElementById("linkInput") || document.querySelector('input[placeholder*="Link do grupo"]');
  const nomeInput = document.getElementById("nomeComunidade") || document.querySelector('input[placeholder*="Nome da comunidade"]');
  const fotoInput = document.getElementById("fotoComunidade") || document.querySelector('input[placeholder*="Foto (URL)"]');

  if (!linkInput) {
    console.error("❌ Campo de link não encontrado!");
    if (typeof toast === "function") toast("Erro: campo de link não encontrado");
    return;
  }

  const link = linkInput.value.trim();
  if (!link) {
    if (typeof toast === "function") toast("⚠️ Cole um link do WhatsApp primeiro");
    return;
  }
  if (!link.includes("whatsapp.com")) {
    if (typeof toast === "function") toast("⚠️ Link inválido. Use um link do WhatsApp");
    return;
  }

  if (typeof toast === "function") toast("🔍 Buscando dados...");

  try {
    const resultado = await buscarMetadadosWhatsApp(link);
    if (resultado.sucesso) {
      if (resultado.titulo && nomeInput) nomeInput.value = resultado.titulo;
      if (resultado.imagem && fotoInput) fotoInput.value = resultado.imagem;
      if (typeof toast === "function") toast("✅ Dados encontrados!");
    } else {
      if (typeof toast === "function") toast("❌ " + resultado.erro);
      console.error("❌ Erro na busca:", resultado.erro);
    }
  } catch (error) {
    if (typeof toast === "function") toast("❌ Erro: " + error.message);
    console.error("❌ Erro:", error);
  }
}

window.testarBusca = async function (link) {
  if (!link) link = prompt("Cole o link do WhatsApp:");
  if (!link) return;
  const resultado = await buscarMetadadosWhatsApp(link);
  if (resultado.sucesso) {
    alert(`✅ Encontrado!\n\nNome: ${resultado.titulo}\nFoto: ${resultado.imagem}`);
  } else {
    alert(`❌ Falhou!\n\nErro: ${resultado.erro}`);
  }
  return resultado;
};
