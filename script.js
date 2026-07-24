/* ==========================
        R.H.S PREMIUM v3
========================== */



// ==========================
// ENTRADA + MÚSICA
// ==========================


const entrar = document.getElementById("entrar");
const welcome = document.getElementById("welcome");
const site = document.getElementById("site");
const music = document.getElementById("music");


entrar.onclick = () => {

    music.play().catch(()=>{});

    welcome.style.display="none";

    site.style.display="block";

};






// ==========================
// MATRIX MINIMALISTA
// ==========================


const canvas = document.getElementById("matrix");
const ctx = canvas.getContext("2d");


function resize(){

canvas.width = innerWidth;
canvas.height = innerHeight;

}


resize();

window.onresize = resize;



const codigo = [

"R.H.S",
"system.online",
"loading...",
"groups.connect",
"partner.ok",
"0101"

];



let colunas = Math.floor(canvas.width / 120);

let drops=[];


for(let i=0;i<colunas;i++){

drops[i]=Math.random()*canvas.height;

}





function matrix(){


ctx.fillStyle="rgba(0,0,0,.08)";

ctx.fillRect(
0,
0,
canvas.width,
canvas.height
);



ctx.fillStyle="rgba(180,180,180,.35)";

ctx.font="14px monospace";



drops.forEach((y,i)=>{


let text =
codigo[
Math.floor(Math.random()*codigo.length)
];



ctx.fillText(
text,
i*120,
y
);



if(y > canvas.height){

drops[i]=0;

}



drops[i]+=2;


});


}



setInterval(matrix,60);








// ==========================
// BANCO
// ==========================


let dados =
JSON.parse(localStorage.getItem("rhs"))
||
{
grupos:[],
canais:[],
aliados:[],
admins:[]
};








// RENDER

function carregar(){

mostrarComunidades(dados.grupos, dados.canais);

mostrarAliados(dados.aliados);

carregarADM();

contador();

}


// AQUI VEM A NOVA FUNÇÃO

function mostrarComunidades(grupos, canais){

...
}


// DEPOIS CONTINUA:

function mostrarAliados(lista){

...
}







function mostrarCanais(lista){


canais.innerHTML="";


lista.forEach(item=>{


canais.innerHTML += criarCard(
item,
"📢"
);


});


}








function mostrarAliados(lista){


aliados.innerHTML="";


lista.forEach(item=>{


aliados.innerHTML += criarCard(
item,
"⭐"
);


});


}








function criarCard(item, icone){


return `

<div class="card premium-card">


${item.imagem ? 
`
<img 
src="${item.imagem}" 
class="card-img"
>
`
:
""
}



<div class="card-content">


<span class="tag">

${icone}

</span>



<h3>

${item.nome}

</h3>



<p>

${item.desc || "Comunidade R.H.S"}

</p>



<a 
href="${item.link}" 
target="_blank"
class="card-button"
>

Acessar →

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
.addEventListener("input",e=>{


let busca =
e.target.value.toLowerCase();



mostrarGrupos(

dados.grupos.filter(x=>

x.nome.toLowerCase()
.includes(busca)

)

);



mostrarCanais(

dados.canais.filter(x=>

x.nome.toLowerCase()
.includes(busca)

)

);



mostrarAliados(

dados.aliados.filter(x=>

x.nome.toLowerCase()
.includes(busca)

)

);



});









// ==========================
// FILTROS
// ==========================


function filtrar(tipo){



document.getElementById("areaGrupos")
.style.display =
(tipo=="canais" || tipo=="aliados")
?
"none":"block";



document.getElementById("areaCanais")
.style.display =
(tipo=="grupos" || tipo=="aliados")
?
"none":"block";



document.getElementById("areaAliados")
.style.display =
(tipo=="grupos" || tipo=="canais")
?
"none":"block";



}








// ==========================
// CONTADORES
// ==========================


function contador(){


totalGrupos.innerText =
dados.grupos.length;


totalCanais.innerText =
dados.canais.length;


totalAliados.innerText =
dados.aliados.length;


}









// ==========================
// ADM WHATSAPP
// ==========================


function carregarADM(){


admSelect.innerHTML="";


dados.admins.forEach((adm,i)=>{


admSelect.innerHTML += `

<option value="${i}">
${adm.nome}
</option>

`;


});


}





whatsapp.onclick=()=>{


let adm =
dados.admins[
admSelect.value
];



let msg =
mensagemParceria.value;



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
