/* ==========================================================
   R.H.S - MAIN.JS
   Sistema principal
   ========================================================== */

"use strict";

let banco = {
  comunidades: [],
  aliados: [],
  adms: [],
  config: {}
};

let filtroTipo = "todos";
let filtroCategoria = "todas";

const $ = (e) => document.querySelector(e);

document.addEventListener("DOMContentLoaded", async () => {

  iniciarEntrada();

  await carregarBanco();

  aplicarConfiguracoes();

  renderizarComunidades();

  renderizarAliados();

  iniciarPesquisa();

  iniciarFiltros();

});

function iniciarEntrada(){

    const btn = $("#entrar");
    const welcome = $("#welcome");
    const site = $("#site");

    if(site){
        site.style.display="none";
        site.style.opacity="0";
    }

    if(!btn) return;

    btn.onclick=()=>{

        welcome.style.opacity="0";

        setTimeout(()=>{

            welcome.style.display="none";

            site.style.display="block";

            requestAnimationFrame(()=>{

                site.style.opacity="1";

            });

            iniciarMusica();

        },400);

    }

}

async function carregarBanco(){

    try{

        if(typeof carregarBancoGithub==="function"){

            banco = await carregarBancoGithub();

        }else{

            const req = await fetch("data/db.json?"+Date.now());

            banco = await req.json();

        }

    }catch(e){

        console.error(e);

        mostrarToast("Erro ao carregar banco.");

        banco={
            comunidades:[],
            aliados:[],
            adms:[],
            config:{}
        };

    }

}

function aplicarConfiguracoes(){

    if(!banco.config) return;

    if($("#siteDescricao"))
        $("#siteDescricao").textContent=banco.config.descricao||"";

    if($("#footerTexto"))
        $("#footerTexto").textContent=banco.config.footer||"";

    if($("#canalOficial"))
        $("#canalOficial").href=banco.config.whatsapp||"#";

    if($("#logoCanal") && banco.config.logo)
        $("#logoCanal").src=banco.config.logo;

    if($("#logoEntrada") && banco.config.logo)
        $("#logoEntrada").src=banco.config.logo;

}

function iniciarMusica(){

    const audio=$("#music");

    if(!audio) return;

    if(!banco.config?.musica) return;

    audio.src=banco.config.musica;

    audio.volume=.4;

    audio.play().catch(()=>{});

}
