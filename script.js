"use strict";

/* ==============================
   ELEMENTOS
============================== */

const loader = document.getElementById("loader");

const navLogo = document.getElementById("navLogo");
const navNome = document.getElementById("navNome");

const loaderLogo = document.getElementById("loaderLogo");
const loaderNome = document.getElementById("loaderNome");

const avatar = document.getElementById("avatar");
const siteNome = document.getElementById("siteNome");
const bio = document.getElementById("bio");

const btnWhatsapp = document.getElementById("btnWhatsapp");
const copyButton = document.getElementById("copyButton");

const footerLogo = document.getElementById("footerLogo");
const footerNome = document.getElementById("footerNome");
const footerText = document.getElementById("footerText");

const canaisRow = document.getElementById("canaisRow");
const gruposRow = document.getElementById("gruposRow");
const filtrosEl = document.getElementById("filtros");
const searchEl = document.getElementById("search");

const topButton = document.getElementById("topButton");

const bgAudio = document.getElementById("bgAudio");
const musicButton = document.getElementById("musicButton");

const bgVideo = document.getElementById("bgVideo");
const videoOverlay = document.getElementById("videoOverlay");
const canvas = document.getElementById("matrix");

let categoriaAtiva = "todas";
let config = null;

/* ==============================
   LOADER
============================== */

window.addEventListener("load", () => {
  setTimeout(() => {
    loader.style.opacity = "0";
    loader.style.pointerEvents = "none";
    setTimeout(() => loader.remove(), 700);
  }, 1200);
});

/* ==============================
   CARREGAR CONFIG
============================== */

function carregarConfig() {
  document.title = config.site.nome;

  navLogo.src = config.site.logo;
  loaderLogo.src = config.site.logo;
  footerLogo.src = config.site.logo;

  avatar.src = config.site.avatar;

  navNome.textContent = config.site.nome;
  loaderNome.textContent = config.site.nome;
  siteNome.textContent = config.site.nome;
  footerNome.textContent = config.site.nome;

  bio.textContent = config.site.descricao;
  footerText.textContent = config.footer.texto;

  btnWhatsapp.href = config.site.whatsapp;

  btnWhatsapp.addEventListener("click", (e) => {
    e.preventDefault();
    window.open(config.site.whatsapp, "_blank");
  });

  copyButton.addEventListener("click", () => {
    navigator.clipboard.writeText(config.site.whatsapp);
    copyButton.textContent = "Copiado!";
    setTimeout(() => (copyButton.textContent = "Copiar Link"), 1500);
  });
}

/* ==============================
   MÚSICA DE FUNDO
============================== */

function configurarMusica() {
  if (!config.site.musica) {
    musicButton.style.display = "none";
    return;
  }

  bgAudio.src = config.site.musica;
  musicButton.style.display = "flex";

  let tocando = false;

  musicButton.addEventListener("click", () => {
    if (tocando) {
      bgAudio.pause();
      musicButton.textContent = "🔇";
    } else {
      bgAudio.play().catch(() => {
        console.warn("O navegador bloqueou a reprodução automática, clique novamente.");
      });
      musicButton.textContent = "🎵";
    }
    tocando = !tocando;
  });
}

/* ==============================
   FUNDO (matrix / vídeo / imagem)
============================== */

function configurarFundo() {
  const tipo = config.site.fundoTipo || "matrix";

  if (tipo === "video" && config.site.videoFundo) {
    bgVideo.src = config.site.videoFundo;
    bgVideo.style.display = "block";
    videoOverlay.style.display = "block";
    if (canvas) canvas.style.display = "none";
  } else if (tipo === "imagem") {
    bgVideo.style.display = "none";
    videoOverlay.style.display = "none";
    if (canvas) canvas.style.display = "none";
  } else {
    bgVideo.style.display = "none";
    videoOverlay.style.display = "none";
  }
}

/* ==============================
   BOTÃO TOPO
============================== */

window.addEventListener("scroll", () => {
  topButton.style.display = window.scrollY > 250 ? "flex" : "none";
});

topButton.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

/* ==============================
   FILTROS
============================== */

function criarBotaoFiltro(nome, valor) {
  const botao = document.createElement("button");
  botao.className = "filtro";
  botao.textContent = nome;
  if (valor === "todas") botao.classList.add("ativo");

  botao.addEventListener("click", () => {
    document.querySelectorAll(".filtro").forEach((btn) => btn.classList.remove("ativo"));
    botao.classList.add("ativo");
    categoriaAtiva = valor;
    aplicarFiltros();
  });

  filtrosEl.appendChild(botao);
}

function obterCategoriasUsadas() {
  const todosItens = [...(config.canais || []), ...(config.grupos || [])];
  const categorias = todosItens.map((item) => item.categoria).filter(Boolean);
  return [...new Set(categorias)];
}

/* ==============================
   PESQUISA
============================== */

searchEl.addEventListener("input", aplicarFiltros);

function aplicarFiltros() {
  const texto = searchEl.value.trim().toLowerCase();

  document.querySelectorAll("#canaisRow .card, #gruposRow .card").forEach((card) => {
    const conteudo = card.innerText.toLowerCase();
    const categoriaCard = card.dataset.categoria || "";

    const passaTexto = conteudo.includes(texto);
    const passaCategoria = categoriaAtiva === "todas" || categoriaCard === categoriaAtiva;

    card.style.display = passaTexto && passaCategoria ? "flex" : "none";
  });
}

/* ==============================
   BUSCAR PREVIEW AUTOMÁTICO DO LINK
   (usa a API gratuita da Microlink pra
   pegar foto/nome/descrição do link)
============================== */

function limitarTexto(texto, tamanhoMax) {
  if (!texto) return "";
  const limpo = texto.replace(/\s+/g, " ").trim();
  return limpo.length > tamanhoMax ? limpo.slice(0, tamanhoMax).trim() + "..." : limpo;
}

async function buscarPreview(link) {
  try {
    const resposta = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(link)}`);
    const json = await resposta.json();

    if (json.status === "success") {
      return {
        titulo: limitarTexto(json.data.title, 60),
        imagem: (json.data.image && json.data.image.url) || (json.data.logo && json.data.logo.url) || ""
      };
    }
  } catch (erro) {
    console.warn("Não foi possível buscar preview do link:", link, erro);
  }

  return null;
}

/* ==============================
   CRIAR CARD
============================== */

function criarCard(item, tipo, container) {
  const card = document.createElement("div");
  card.className = "card" + (item.fixado ? " fixado" : "");
  card.dataset.categoria = item.categoria || "";

  const precisaBuscarImagem = !item.imagem;
  const precisaBuscarTitulo = !item.titulo;
  const precisaBuscar = precisaBuscarImagem || precisaBuscarTitulo;

  card.innerHTML = `
    <div class="cardImgWrap">
      <img class="cardImg" src="${item.imagem || ""}" alt="${item.titulo || "Carregando..."}">
      ${precisaBuscarImagem ? '<div class="cardSkeleton"></div>' : ""}
      <span class="badge tipo">${tipo}</span>
      <div class="badgesDireita">
        ${item.vip ? '<span class="badge vip">★ VIP</span>' : ""}
        ${item.fixado ? '<span class="badge fixado">📌 Fixado</span>' : ""}
      </div>
    </div>

    <div class="cardInfo">
      <h3 class="cardTitulo">${item.titulo || "Carregando..."}</h3>

      <div class="cardTags">
        <span class="pill whatsapp">🟢 WhatsApp</span>
        ${item.categoria ? `<span class="pill categoria">${item.categoria}</span>` : ""}
      </div>

      <div class="cardButtons">
        <a class="btnEntrar" href="${item.link}" target="_blank">↗ Entrar</a>
        <button class="btnCopiar">⧉ Copiar</button>
      </div>
    </div>
  `;

  card.querySelector(".btnCopiar").addEventListener("click", () => {
    navigator.clipboard.writeText(item.link);
    const btn = card.querySelector(".btnCopiar");
    const textoOriginal = btn.textContent;
    btn.textContent = "Copiado!";
    setTimeout(() => (btn.textContent = textoOriginal), 1500);
  });

  container.appendChild(card);

  if (precisaBuscar) {
    buscarPreview(item.link).then((preview) => {
      const skeleton = card.querySelector(".cardSkeleton");
      if (skeleton) skeleton.remove();

      if (!preview) return;

      if (precisaBuscarImagem && preview.imagem) {
        card.querySelector(".cardImg").src = preview.imagem;
      }

      if (!item.titulo && preview.titulo) {
        card.querySelector(".cardTitulo").textContent = preview.titulo;
        card.querySelector(".cardImg").alt = preview.titulo;
      }
    });
  }

  return card;
}

/* ==============================
   CARROSSEL COM ARRASTE (mouse)
============================== */

function habilitarArrasto(el) {
  let isDown = false;
  let startX = 0;
  let scrollStart = 0;

  el.addEventListener("mousedown", (e) => {
    isDown = true;
    el.classList.add("arrastando");
    startX = e.pageX;
    scrollStart = el.scrollLeft;
  });

  window.addEventListener("mouseup", () => {
    isDown = false;
    el.classList.remove("arrastando");
  });

  window.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    e.preventDefault();
    const dx = e.pageX - startX;
    el.scrollLeft = scrollStart - dx;
  });
}

habilitarArrasto(canaisRow);
habilitarArrasto(gruposRow);

/* ==============================
   CARREGAR DADOS (fixados primeiro)
============================== */

function ordenarComFixados(lista) {
  return [...lista].sort((a, b) => (b.fixado ? 1 : 0) - (a.fixado ? 1 : 0));
}

function carregarLista(lista, tipo, container) {
  if (!Array.isArray(lista) || lista.length === 0) {
    const aviso = document.createElement("p");
    aviso.className = "carouselVazio";
    aviso.textContent = `Nenhum ${tipo.toLowerCase()} cadastrado ainda.`;
    container.appendChild(aviso);
    return;
  }

  ordenarComFixados(lista).forEach((item) => criarCard(item, tipo, container));
}

/* ==============================
   MATRIX (chuva vermelha)
============================== */

if (canvas) {
  const ctx = canvas.getContext("2d");

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const letras = "01ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const tamanho = 16;

  let colunas = Math.floor(canvas.width / tamanho);
  let gotas = Array(colunas).fill(1);

  function matrix() {
    ctx.fillStyle = "rgba(0,0,0,.08)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = tamanho + "px monospace";

    gotas.forEach((y, i) => {
      const txt = letras[Math.floor(Math.random() * letras.length)];
      const brilho = Math.random();

      if (brilho > 0.975) {
        ctx.fillStyle = "#ffffff";
      } else if (brilho > 0.5) {
        ctx.fillStyle = "#ff2020";
      } else {
        ctx.fillStyle = "#7a0000";
      }

      ctx.fillText(txt, i * tamanho, y * tamanho);

      if (y * tamanho > canvas.height && Math.random() > 0.975) {
        gotas[i] = 0;
      }

      gotas[i]++;
    });
  }

  setInterval(matrix, 35);

  window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    colunas = Math.floor(canvas.width / tamanho);
    gotas = Array(colunas).fill(1);
  });
}

/* ==============================
   INICIAR SITE (busca o config.json)
============================== */

async function iniciarSite() {
  try {
    const resposta = await fetch(`config.json?v=${Date.now()}`, { cache: "no-store" });
    config = await resposta.json();
  } catch (erro) {
    console.error("Não foi possível carregar config.json:", erro);
    return;
  }

  carregarConfig();
  configurarMusica();
  configurarFundo();

  criarBotaoFiltro("Todas", "todas");
  obterCategoriasUsadas().forEach((categoria) => criarBotaoFiltro(categoria, categoria));

  carregarLista(config.canais, "Canal", canaisRow);
  carregarLista(config.grupos, "Grupo", gruposRow);
}

iniciarSite();

console.log("✅ KnowS.exe carregado com sucesso");
