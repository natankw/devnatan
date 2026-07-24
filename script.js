/* ==========================
        R.H.S PREMIUM v2
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
// MATRIX MINIMALISTA
// ==========================


const canvas =
document.getElementById("matrix");


const ctx =
canvas.getContext("2d");



function tamanhoCanvas(){

canvas.width =
window.innerWidth;


canvas.height =
window.innerHeight;

}


tamanhoCanvas();


window.onresize=tamanhoCanvas;



const textos = [

"R.H.S",
"system.online",
"connect",
"groups.load",
"partner.active",
"0101",
"security"

];



const fonte = 15;


let colunas =
Math.floor(canvas.width/fonte);


let linhas = [];


for(let i=0;i<colunas;i++){

linhas[i]=0;

}





function matrix(){


ctx.fillStyle="rgba(0,0,0,.08)";

ctx.fillRect(
0,
0,
canvas.width,
canvas.height
);



ctx.font =
fonte+"px monospace";


ctx.fillStyle=
"rgba(180,180,180,.45)";



linhas.forEach((y,i)=>{


let texto =
textos[
Math.floor(
Math.random()*textos.length
)
];



ctx.fillText(

texto,

i*fonte,

y

);



if(
y > canvas.height &&
Math.random()>0.97
){

linhas[i]=0;

}


linhas[i]+=fonte;


});


}



setInterval(matrix,80);









// ==========================
// BANCO
// ==========================


let dados =
JSON.parse(
localStorage.getItem("rhs")
)
||
{

grupos:[],
canais:[],
aliados:[],

admins:[

{
nome:"ADM R.H.S",
numero:"5591981520185"
}

]

};










// ==========================
// CARREGAR CARDS
// ==========================



function carregar(){



let grupos =
document.getElementById("grupos");


let canais =
document.getElementById("canais");


let aliados =
document.getElementById("aliados");



grupos.innerHTML="";

canais.innerHTML="";

aliados.innerHTML="";





dados.grupos.forEach(x=>{


grupos.innerHTML += card(

x.nome,

x.desc,

x.link

);


});





dados.canais.forEach(x=>{


canais.innerHTML += card(

x.nome,

x.desc,

x.link

);


});






dados.aliados.forEach(x=>{


aliados.innerHTML += `


<div class="card">


<h3>
⭐ ${x.nome}
</h3>


<p>
${x.desc || ""}
</p>


<a href="${x.link}" target="_blank">
Conhecer →
</a>


</div>


`;


});



animarNumeros();



carregarADM();


}







function card(nome,desc,link){


return `


<div class="card">


<h3>

${nome}

</h3>


<p>

${desc || ""}

</p>



<a href="${link}" target="_blank">

Entrar →

</a>



</div>


`;

}








// ==========================
// NUMEROS
// ==========================



function contador(id,valor){


let el =
document.getElementById(id);


let atual=0;



let timer =
setInterval(()=>{


atual++;


el.innerText=atual;



if(atual>=valor){

clearInterval(timer);

}


},20);



}





function animarNumeros(){


contador(
"totalGrupos",
dados.grupos.length
);


contador(
"totalCanais",
dados.canais.length
);


contador(
"totalAliados",
dados.aliados.length
);


}









// ==========================
// WHATSAPP PARCERIA
// ==========================



function carregarADM(){


let select =
document.getElementById("admSelect");



select.innerHTML="";



dados.admins.forEach((adm,i)=>{


select.innerHTML += `

<option value="${i}">
${adm.nome}
</option>

`;


});


}




document
.getElementById("whatsapp")
.onclick=()=>{


let adm =
dados.admins[
document.getElementById("admSelect").value
];



let msg =
document.getElementById("mensagemParceria").value;



let url =

"https://wa.me/"+

adm.numero+

"?text="+

encodeURIComponent(msg);



window.open(url,"_blank");


};








carregar();
