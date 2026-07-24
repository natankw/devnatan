/* ==========================
        R.H.S V4 SCRIPT
========================== */



// ==========================
// ENTRADA + MÚSICA
// ==========================


const entrar = document.getElementById("entrar");

const welcome = document.getElementById("welcome");

const site = document.getElementById("site");

const music = document.getElementById("music");



entrar.onclick = ()=>{


music.play().catch(()=>{});


welcome.style.display="none";


site.style.display="block";


};








// ==========================
// MATRIX BRANCA LEVE
// ==========================


const canvas = document.getElementById("matrix");

const ctx = canvas.getContext("2d");



function resize(){

canvas.width = innerWidth;

canvas.height = innerHeight;

}



resize();


window.onresize = resize;




const letras = [

"R.H.S",

"0101",

"system",

"online",

"community",

"partner",

"01"

];



let tamanho = 120;


let colunas = Math.floor(canvas.width / tamanho);


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


let texto =
letras[
Math.floor(Math.random()*letras.length)
];



ctx.fillText(
texto,
i*tamanho,
y
);



if(y > canvas.height){

gotas[i]=0;

}



gotas[i]+=1.5;


});



}



setInterval(chuva,50);










// ==========================
// BANCO
// ==========================



let dados =

JSON.parse(localStorage.getItem("rhs"))

||

{

comunidades:[],

aliados:[],

admins:[]

};









// ==========================
// CARREGAR
// ==========================


function carregar(){


mostrarComunidades(dados.comunidades);


mostrarAliados(dados.aliados);


carregarADM();


contador();


}










// ==========================
// COMUNIDADES
// ==========================


function mostrarComunidades(lista){



let area = document.getElementById("comunidades");


area.innerHTML="";



lista.forEach(item=>{


area.innerHTML += criarCard(

item,

item.tipo === "canal"

?

"📢"

:

"👥"

);


});



}











// ==========================
// ALIADOS
// ==========================


function mostrarAliados(lista){


let area = document.getElementById("parceiros");


area.innerHTML="";



lista.forEach(item=>{


area.innerHTML += criarCard(

item,

"⭐"

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

src="${item.imagem || 'img/default.png'}"

class="community-img"

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


document
.getElementById("pesquisa")
.addEventListener("input",(e)=>{


let busca =

e.target.value.toLowerCase();



let resultado = dados.comunidades.filter(item=>


item.nome.toLowerCase().includes(busca)


);



mostrarComunidades(resultado);



});









// ==========================
// FILTROS
// ==========================



function filtrar(tipo){



if(tipo==="todos"){


mostrarComunidades(dados.comunidades);


return;

}



let lista = dados.comunidades.filter(item=>{


return item.tipo === tipo;


});



mostrarComunidades(lista);


}









// ==========================
// CONTADORES
// ==========================


function contador(){



document.getElementById("totalComunidades").innerText =

dados.comunidades.length;



document.getElementById("totalAliados").innerText =

dados.aliados.length;



document.getElementById("totalParceiros").innerText =

dados.admins.length;



}









// ==========================
// PARCERIA WHATSAPP
// ==========================


function carregarADM(){



let select = document.getElementById("admSelect");


select.innerHTML="";



dados.admins.forEach((adm,index)=>{


select.innerHTML += `

<option value="${index}">

${adm.nome}

</option>

`;



});



}






document.getElementById("whatsapp").onclick=()=>{



let adm =

dados.admins[
document.getElementById("admSelect").value
];



let msg =

document.getElementById("mensagemParceria").value;



window.open(

"https://wa.me/"

+

adm.numero

+

"?text="

+

encodeURIComponent(msg)

);



};







carregar();
