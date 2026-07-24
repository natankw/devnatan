"use strict";

/* ===================================================
   KNOWS.exe
   PARTE 1
=================================================== */

/* ========= ELEMENTOS ========= */

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
const aliadosRow = document.getElementById("aliadosRow");

const filtrosEl = document.getElementById("filtros");
const searchEl = document.getElementById("search");

const topButton = document.getElementById("topButton");

const bgAudio = document.getElementById("bgAudio");
const musicButton = document.getElementById("musicButton");

const bgVideo = document.getElementById("bgVideo");
const videoOverlay = document.getElementById("videoOverlay");

const canvas = document.getElementById("matrix");

/* ========= BEM VINDO ========= */

const welcomeScreen = document.getElementById("welcomeScreen");
const welcomeLogo = document.getElementById("welcomeLogo");
const welcomeTitle = document.getElementById("welcomeTitle");
const welcomeText = document.getElementById("welcomeText");
const enterSite = document.getElementById("enterSite");

/* ========= PARCERIA ========= */

const admSelect = document.getElementById("admSelect");
const btnParceria = document.getElementById("btnParceria");

/* ========= VARIÁVEIS ========= */

let config = null;
let categoriaAtiva = "todas";

/* ===================================================
   LOADER
=================================================== */

window.addEventListener("load", () => {

    setTimeout(() => {

        loader.style.opacity = "0";
        loader.style.pointerEvents = "none";

        setTimeout(() => {

            loader.remove();

        },700);

    },1200);

});

/* ===================================================
   CONFIG
=================================================== */

function carregarConfig(){

    document.title = config.site.nome;

    navLogo.src=config.site.logo;
    loaderLogo.src=config.site.logo;
    footerLogo.src=config.site.logo;

    avatar.src=config.site.avatar;

    navNome.textContent=config.site.nome;
    loaderNome.textContent=config.site.nome;
    siteNome.textContent=config.site.nome;
    footerNome.textContent=config.site.nome;

    bio.textContent=config.site.descricao;
    footerText.textContent=config.footer.texto;

    btnWhatsapp.href=config.site.whatsapp;

    if(welcomeLogo){

        welcomeLogo.src=config.site.logo;
        welcomeTitle.textContent="Bem-vindo";
        welcomeText.textContent=config.site.descricao;

    }

    copyButton.onclick=()=>{

        navigator.clipboard.writeText(config.site.whatsapp);

        copyButton.innerText="Copiado!";

        setTimeout(()=>{

            copyButton.innerText="Copiar Link";

        },1500);

    };

}

/* ===================================================
   MÚSICA
=================================================== */

function configurarMusica(){

    if(!config.site.musica){

        musicButton.style.display="none";
        return;

    }

    bgAudio.src=config.site.musica;
    bgAudio.loop=true;
    bgAudio.volume=config.site.volume || 0.5;

    musicButton.style.display="flex";

    musicButton.innerHTML="🔇";

    if(enterSite){

        enterSite.onclick=async()=>{

            welcomeScreen.classList.add("hide");

            try{

                await bgAudio.play();

                musicButton.innerHTML="🎵";

            }catch(e){

                console.log(e);

            }

        };

    }

    musicButton.onclick=()=>{

        if(bgAudio.paused){

            bgAudio.play();
            musicButton.innerHTML="🎵";

        }else{

            bgAudio.pause();
            musicButton.innerHTML="🔇";

        }

    };

}

/* ===================================================
   FILTROS
=================================================== */

function criarBotaoFiltro(nome, valor){

    const botao=document.createElement("button");

    botao.className="filtro";
    botao.innerText=nome;

    if(valor==="todas")
        botao.classList.add("ativo");

    botao.onclick=()=>{

        document
        .querySelectorAll(".filtro")
        .forEach(btn=>btn.classList.remove("ativo"));

        botao.classList.add("ativo");

        categoriaAtiva=valor;

        aplicarFiltros();

    };

    filtrosEl.appendChild(botao);

}

function obterCategoriasUsadas(){

    const lista=[

        ...(config.canais||[]),
        ...(config.grupos||[]),
        ...(config.aliados||[])

    ];

    return [...new Set(

        lista
        .map(x=>x.categoria)
        .filter(Boolean)

    )];

}

/* ===================================================
   PESQUISA
=================================================== */

searchEl.addEventListener("input", aplicarFiltros);

function aplicarFiltros(){

    const texto=searchEl.value.toLowerCase().trim();

    document.querySelectorAll(".card").forEach(card=>{

        const nome=card.innerText.toLowerCase();

        const categoria=card.dataset.categoria||"";

        const okTexto=nome.includes(texto);

        const okCategoria=

            categoriaAtiva==="todas" ||

            categoria===categoriaAtiva;

        card.style.display=

            okTexto && okCategoria

            ? "flex"

            : "none";

    });

}

/* ===================================================
   PREVIEW AUTOMÁTICA
=================================================== */

function limitarTexto(txt,max){

    if(!txt) return "";

    txt=txt.replace(/\s+/g," ").trim();

    if(txt.length<=max)
        return txt;

    return txt.substring(0,max)+"...";

}

async function buscarPreview(link){

    try{

        const req=await fetch(

            "https://api.microlink.io/?url="+

            encodeURIComponent(link)

        );

        const json=await req.json();

        if(json.status==="success"){

            return{

                titulo:limitarTexto(json.data.title,60),

                imagem:

                    json.data.image?.url ||

                    json.data.logo?.url ||

                    ""

            };

        }

    }catch(e){

        console.log(e);

    }

    return null;

}

/* ===================================================
   CRIAR CARD
=================================================== */

function criarCard(item,tipo,container){

    const card=document.createElement("div");

    card.className="card";

    if(item.fixado)
        card.classList.add("fixado");

    if(tipo==="Aliado")
        card.classList.add("aliado");

    card.dataset.categoria=item.categoria||"";

    card.innerHTML=`

    <div class="cardImgWrap">

        <img class="cardImg"
             src="${item.imagem||""}"
             alt="${item.titulo||""}">

        ${!item.imagem
            ?'<div class="cardSkeleton"></div>'
            :''}

        <span class="badge tipo">${tipo}</span>

        <div class="badgesDireita">

            ${item.vip
                ?'<span class="badge vip">★ VIP</span>'
                :''}

            ${item.fixado
                ?'<span class="badge fixado">📌</span>'
                :''}

        </div>

    </div>

    <div class="cardInfo">

        <h3 class="cardTitulo">

            ${item.titulo||"Carregando..."}

        </h3>

        <div class="cardTags">

            <span class="pill whatsapp">
                🟢 WhatsApp
            </span>

            ${
                item.categoria
                ?`<span class="pill categoria">${item.categoria}</span>`
                :""
            }

        </div>

        <div class="cardButtons">

            <a
               class="btnEntrar"
               href="${item.link}"
               target="_blank">

               Entrar

            </a>

            <button class="btnCopiar">

                Copiar

            </button>

        </div>

    </div>
    `;

    card.querySelector(".btnCopiar").onclick=()=>{

        navigator.clipboard.writeText(item.link);

        const btn=card.querySelector(".btnCopiar");

        btn.innerHTML="Copiado!";

        setTimeout(()=>{

            btn.innerHTML="Copiar";

        },1500);

    };

    container.appendChild(card);

    if(!item.imagem||!item.titulo){

        buscarPreview(item.link).then(preview=>{

            if(!preview)
                return;

            const img=card.querySelector(".cardImg");

            const titulo=card.querySelector(".cardTitulo");

            const skeleton=
                card.querySelector(".cardSkeleton");

            if(skeleton)
                skeleton.remove();

            if(!item.imagem && preview.imagem)
                img.src=preview.imagem;

            if(!item.titulo && preview.titulo)
                titulo.innerHTML=preview.titulo;

        });

    }

}

/* ===================================================
   CARROSSEL
=================================================== */

function habilitarArrasto(el){

    if(!el) return;

    let pressionado=false;
    let inicioX=0;
    let scrollInicial=0;

    el.addEventListener("mousedown",(e)=>{

        pressionado=true;

        el.classList.add("arrastando");

        inicioX=e.pageX;

        scrollInicial=el.scrollLeft;

    });

    window.addEventListener("mouseup",()=>{

        pressionado=false;

        el.classList.remove("arrastando");

    });

    window.addEventListener("mousemove",(e)=>{

        if(!pressionado) return;

        e.preventDefault();

        const distancia=e.pageX-inicioX;

        el.scrollLeft=scrollInicial-distancia;

    });

}

habilitarArrasto(canaisRow);
habilitarArrasto(gruposRow);
habilitarArrasto(aliadosRow);

/* ===================================================
   LISTAS
=================================================== */

function ordenarComFixados(lista){

    return [...lista].sort(

        (a,b)=>(b.fixado?1:0)-(a.fixado?1:0)

    );

}

function carregarLista(lista,tipo,container){

    if(!container) return;

    container.innerHTML="";

    if(!Array.isArray(lista) || lista.length===0){

        container.innerHTML=`
        <p class="carouselVazio">
        Nenhum ${tipo.toLowerCase()} cadastrado.
        </p>`;

        return;

    }

    ordenarComFixados(lista).forEach(item=>{

        criarCard(item,tipo,container);

    });

}

/* ===================================================
   PARCERIAS
=================================================== */

function carregarParcerias(){

    if(!admSelect) return;

    admSelect.innerHTML="";

    if(!config.adms) return;

    config.adms.forEach(adm=>{

        const option=document.createElement("option");

        option.value=adm.link;

        option.textContent=adm.nick;

        admSelect.appendChild(option);

    });

    if(btnParceria){

        btnParceria.onclick=()=>{

            const url=admSelect.value;

            if(url){

                window.open(url,"_blank");

            }

        };

    }

                }

/* ===================================================
   MATRIX
=================================================== */

if (canvas) {

    const ctx = canvas.getContext("2d");

    function resizeMatrix() {

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

    }

    resizeMatrix();

    const letras =
        "01ABCDEFGHIJKLMNOPQRSTUVWXYZ#$%&@<>[]{}";

    const tamanho = 16;

    let colunas = Math.floor(canvas.width / tamanho);

    let gotas = Array(colunas).fill(1);

    function desenharMatrix() {

        ctx.fillStyle = "rgba(0,0,0,.05)";
        ctx.fillRect(0,0,canvas.width,canvas.height);

        ctx.font = tamanho + "px monospace";

        for(let i=0;i<gotas.length;i++){

            const letra =
                letras[
                    Math.floor(
                        Math.random()*letras.length
                    )
                ];

            const brilho=Math.random();

            if(brilho>.96){

                ctx.fillStyle="#ffffff";

            }else if(brilho>.55){

                ctx.fillStyle="#ff2b2b";

            }else{

                ctx.fillStyle="#8b0000";

            }

            ctx.fillText(

                letra,

                i*tamanho,

                gotas[i]*tamanho

            );

            if(

                gotas[i]*tamanho >

                canvas.height &&

                Math.random()>0.98

            ){

                gotas[i]=0;

            }

            gotas[i]++;

        }

    }

    setInterval(desenharMatrix,30);

    window.addEventListener("resize",()=>{

        resizeMatrix();

        colunas=Math.floor(canvas.width/tamanho);

        gotas=Array(colunas).fill(1);

    });

}

/* ===================================================
   TOPO
=================================================== */

window.addEventListener("scroll",()=>{

    topButton.style.display=

        window.scrollY>250

        ? "flex"

        : "none";

});

topButton.onclick=()=>{

    window.scrollTo({

        top:0,

        behavior:"smooth"

    });

};

/* ===================================================
   INICIAR
=================================================== */

async function iniciarSite(){

    try{

        const req=await fetch(

            "config.json?v="+Date.now(),

            {

                cache:"no-store"

            }

        );

        config=await req.json();

    }catch(e){

        console.error(e);

        return;

    }

    carregarConfig();

    configurarMusica();

    configurarFundo();

    criarBotaoFiltro("Todas","todas");

    obterCategoriasUsadas()

    .forEach(cat=>{

        criarBotaoFiltro(cat,cat);

    });

    carregarLista(

        config.canais,

        "Canal",

        canaisRow

    );

    carregarLista(

        config.grupos,

        "Grupo",

        gruposRow

    );

    carregarLista(

        config.aliados || [],

        "Aliado",

        aliadosRow

    );

    carregarParcerias();

}

iniciarSite();

console.log("✅ KNOWS.exe iniciado.");
