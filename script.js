/* ==========================
        R.H.S V6 SCRIPT
========================== */


let dados = {};




// ==========================
// ENTRADA + MÚSICA
// ==========================


const entrar = document.getElementById("entrar");
const welcome = document.getElementById("welcome");
const site = document.getElementById("site");
const music = document.getElementById("music");


if(entrar){

entrar.onclick = ()=>{

if(music){

music.play().catch(()=>{});

}

welcome.style.display="none";

site.style.display="block";

};

}








// ==========================
// MATRIX BRANCA
// ==========================


const canvas = document.getElementById("matrix");


if(canvas){


const ctx = canvas.getContext("2d");


function resize(){

canvas.width = innerWidth;

canvas.height = innerHeight;

}


resize();


window.onresize = resize;



let textos=[

"R.H.S",
"0101",
"SYSTEM",
"ONLINE",
"COMMUNITY",
"VIP"

];



let gotas=[];


let colunas=Math.floor(canvas.width/120);



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


async function iniciar(){

try{

let salvo = localStorage.getItem("rhs");


if(salvo){

dados = JSON.parse(salvo);

}else{


let res = await fetch("banco.json");

dados = await res.json();


}


carregarPrincipal();

carregarCards();


}
catch(err){

console.log(err);

}

}

catch(err){


console.log(err);


}



}









// ==========================
// CANAL PRINCIPAL
// ==========================


function carregarPrincipal(){



if(!dados.principal)return;



let img =
document.getElementById("logoPrincipal");


let nome =
document.getElementById("nomePrincipal");


let link =
document.getElementById("linkPrincipal");



if(img)

img.src =
dados.principal.imagem;



if(nome)

nome.innerText =
dados.principal.nome;



if(link){


link.href =
dados.principal.link;



}



}









// ==========================
// CARDS
// ==========================


function carregarCards(){


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



}









function mostrarLista(id,lista,icone){



let area =
document.getElementById(id);



if(!area)return;



area.innerHTML="";



lista.forEach(item=>{


area.innerHTML += criarCard(
item,
icone
);



});


}









function criarCard(item,icone){



return `


<div class="community-card">


<img

src="${item.imagem || 'img/default.png'}"

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

${item.descricao || "Comunidade R.H.S"}

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


const pesquisa =
document.getElementById("pesquisa");



if(pesquisa){


pesquisa.addEventListener("input",()=>{


let busca =
pesquisa.value.toLowerCase();



["grupos","canais","vip","parceiros"]

.forEach(tipo=>{



let filtrados =
dados[tipo].filter(item=>


item.nome
.toLowerCase()
.includes(busca)


);



mostrarLista(

tipo,

filtrados,

tipo=="grupos" ? "👥" :

tipo=="canais" ? "📢" :

tipo=="vip" ? "⭐" :

"🤝"

);



});



});


}









iniciar();
