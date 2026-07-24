/* ==========================
        R.H.S V5 SCRIPT
========================== */


let dados = {

grupos:[],
canais:[],
vip:[],
parceiros:[]

};




// ==========================
// ENTRADA + MÚSICA
// ==========================


const entrar = document.getElementById("entrar");

const music = document.getElementById("music");

const welcome = document.getElementById("welcome");

const site = document.getElementById("site");



if(entrar){


entrar.onclick = ()=>{


if(music){

music.play().catch(()=>{});

}


if(welcome){

welcome.style.display="none";

}


if(site){

site.style.display="block";

}


};


}








// ==========================
// MATRIX BRANCA
// ==========================


const canvas = document.getElementById("matrix");


if(canvas){


const ctx = canvas.getContext("2d");



function tamanho(){

canvas.width = innerWidth;

canvas.height = innerHeight;

}



tamanho();


window.addEventListener("resize",tamanho);



let textos=[

"R.H.S",

"0101",

"ONLINE",

"SYSTEM",

"COMMUNITY",

"VIP"

];



let colunas=Math.floor(canvas.width/120);

let gotas=[];



for(let i=0;i<colunas;i++){

gotas[i]=Math.random()*canvas.height;

}




function chuva(){


ctx.fillStyle="rgba(0,0,0,.08)";

ctx.fillRect(
0,
0,
canvas.width,
canvas.height
);



ctx.fillStyle="rgba(255,255,255,.25)";

ctx.font="14px monospace";



gotas.forEach((y,i)=>{


ctx.fillText(

textos[
Math.floor(Math.random()*textos.length)
],

i*120,

y

);



if(y > canvas.height){

gotas[i]=0;

}



gotas[i]+=1.5;



});


}



setInterval(chuva,60);


}









// ==========================
// CARREGAR BANCO
// ==========================


async function carregarBanco(){


try{


let resposta = await fetch("banco.json");


dados = await resposta.json();



renderizar();


}

catch(e){


console.log(
"Erro ao carregar banco:",
e
);


}



}









// ==========================
// RENDER
// ==========================


function renderizar(){


mostrarLista(
"grupos",
dados.grupos,
"👥"
);



mostrarLista(
"canais",
dados.canais,
"📢"
);



mostrarLista(
"vip",
dados.vip,
"⭐"
);



mostrarLista(
"parceiros",
dados.parceiros,
"🤝"
);



contadores();


}









function mostrarLista(id,lista,icone){


let area =
document.getElementById(id);



if(!area) return;


area.innerHTML="";



lista.forEach(item=>{


area.innerHTML += criarCard(
item,
icone
);



});


}









// ==========================
// CARD
// ==========================


function criarCard(item,icone){



return `


<div class="community-card">



<img

src="${item.imagem || "img/default.png"}"

class="community-img"

onerror="this.src='img/default.png'"

>




<div class="community-info">


<span>

${icone}

</span>



<h3>

${item.nome}

</h3>



<p>

${item.desc || "Comunidade R.H.S"}

</p>



<small>

${item.categoria || "Geral"}

</small>



<a

href="${item.link}"

target="_blank"

class="card-button"

>

Entrar →

</a>



</div>



</div>


`;



}









// ==========================
// PESQUISA
// ==========================


const pesquisa = document.getElementById("pesquisa");



if(pesquisa){



pesquisa.addEventListener("input",()=>{


let valor = pesquisa.value.toLowerCase();



["grupos","canais","vip","parceiros"]

.forEach(tipo=>{


let filtrado = dados[tipo].filter(item=>


item.nome
.toLowerCase()
.includes(valor)


);



mostrarLista(

tipo,

filtrado,

tipo==="grupos" ?

"👥"

:

tipo==="canais" ?

"📢"

:

tipo==="vip" ?

"⭐"

:

"🤝"

);



});



});



}









// ==========================
// FILTROS
// ==========================


function mostrarArea(tipo){



let areas=[

"grupos",

"canais",

"vip",

"parceiros"

];



areas.forEach(area=>{


let elemento =
document.getElementById(area);



if(!elemento) return;



elemento.parentElement.style.display="block";



});





if(tipo!=="todos"){



areas.forEach(area=>{


if(area!==tipo){


document
.getElementById(area)
.parentElement.style.display="none";


}



});


}



}









// ==========================
// CONTADORES
// ==========================


function contadores(){


let grupos =
document.getElementById("totalGrupos");


let canais =
document.getElementById("totalCanais");


let vip =
document.getElementById("totalVip");


let parceiros =
document.getElementById("totalParceiros");




if(grupos)

grupos.innerText=dados.grupos.length;



if(canais)

canais.innerText=dados.canais.length;



if(vip)

vip.innerText=dados.vip.length;



if(parceiros)

parceiros.innerText=dados.parceiros.length;



}








carregarBanco();
