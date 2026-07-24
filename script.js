/* ==========================
        R.H.S V4 SCRIPT FIX
========================== */


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

if(welcome){
welcome.style.display="none";
}

if(site){
site.style.display="block";
}

};

}






// ==========================
// MATRIX
// ==========================


const canvas = document.getElementById("matrix");


if(canvas){


const ctx = canvas.getContext("2d");


function resize(){

canvas.width = innerWidth;
canvas.height = innerHeight;

}


resize();

window.addEventListener("resize",resize);



const letras=[
"R.H.S",
"0101",
"system",
"online",
"community",
"01"
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
letras[Math.floor(Math.random()*letras.length)],
i*120,
y
);



if(y>canvas.height){

gotas[i]=0;

}


gotas[i]+=1.5;


});


}


setInterval(chuva,50);


}








// ==========================
// BANCO
// ==========================


let dados = JSON.parse(
localStorage.getItem("rhs")
)
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


mostrarComunidades(
dados.comunidades
);


mostrarAliados(
dados.aliados
);


carregarADM();


contador();


}








// ==========================
// COMUNIDADES
// ==========================


function mostrarComunidades(lista){


const area =
document.getElementById("comunidades");


if(!area) return;


area.innerHTML="";



lista.forEach(item=>{


area.innerHTML += criarCard(

item,

item.tipo==="canal"

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


const area =
document.getElementById("parceiros");


if(!area) return;


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

onerror="this.src='img/default.png'"

>



<div class="community-info">


<span>
${icone}
</span>


<h3>
${item.nome || "Comunidade"}
</h3>



<p>
${item.desc || "Comunidade R.H.S"}
</p>



<small>
${item.categoria || "Geral"}
</small>



<a

href="${item.link || '#'}"

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


pesquisa.addEventListener("input",(e)=>{


let busca =
e.target.value.toLowerCase();



let resultado =
dados.comunidades.filter(item=>

item.nome
.toLowerCase()
.includes(busca)

);



mostrarComunidades(resultado);



});


}









// ==========================
// FILTRO
// ==========================


function filtrar(tipo){


if(tipo==="todos"){

mostrarComunidades(
dados.comunidades
);

return;

}



mostrarComunidades(

dados.comunidades.filter(item=>

item.tipo===tipo

)

);


}









// ==========================
// CONTADORES
// ==========================


function contador(){


let a =
document.getElementById("totalComunidades");


let b =
document.getElementById("totalAliados");


let c =
document.getElementById("totalParceiros");



if(a)
a.innerText=dados.comunidades.length;


if(b)
b.innerText=dados.aliados.length;


if(c)
c.innerText=dados.admins.length;


}









// ==========================
// ADM WHATSAPP
// ==========================


function carregarADM(){


const select =
document.getElementById("admSelect");


if(!select) return;


select.innerHTML="";



dados.admins.forEach((adm,index)=>{


select.innerHTML += `

<option value="${index}">
${adm.nome}
</option>

`;

});


}









const whatsapp =
document.getElementById("whatsapp");


if(whatsapp){


whatsapp.onclick=()=>{


let adm =
dados.admins[
document.getElementById("admSelect").value
];



if(!adm){

alert("Nenhum ADM cadastrado");

return;

}



let msg =
document.getElementById("mensagemParceria").value;



window.open(

"https://wa.me/"+
adm.numero+
"?text="+
encodeURIComponent(msg)

);


};


}








carregar();
