/* ==========================
      R.H.S SCRIPT
   ========================== */



// ==========================
// ENTRAR + MÚSICA
// ==========================


const entrar = document.getElementById("entrar");

const welcome = document.getElementById("welcome");

const site = document.getElementById("site");

const music = document.getElementById("music");



entrar.addEventListener("click",()=>{


    // libera música após clique

    music.play()
    .catch(()=>{});


    // remove tela inicial

    welcome.style.display="none";


    // mostra site

    site.style.display="block";


});







// ==========================
// MATRIX
// ==========================


const canvas = document.getElementById("matrix");

const ctx = canvas.getContext("2d");



canvas.width = window.innerWidth;

canvas.height = window.innerHeight;



const letras =
"R.H.S010101010101ABCDEFGHIJKLMNOPQRSTUVWXYZ";



const tamanho = 16;


let colunas =
canvas.width / tamanho;



let gotas = [];



for(let i=0;i<colunas;i++){

    gotas[i]=1;

}





function matrix(){


    ctx.fillStyle="rgba(0,0,0,0.08)";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );



    ctx.fillStyle="#ff0000";

    ctx.font =
    tamanho+"px monospace";



    for(let i=0;i<gotas.length;i++){


        let texto =
        letras[
        Math.floor(
        Math.random()*letras.length)
        ];



        ctx.fillText(
            texto,
            i*tamanho,
            gotas[i]*tamanho
        );



        if(
        gotas[i]*tamanho >
        canvas.height
        &&
        Math.random()>0.975
        ){

            gotas[i]=0;

        }


        gotas[i]++;

    }


}



setInterval(matrix,50);






window.addEventListener("resize",()=>{


canvas.width =
window.innerWidth;


canvas.height =
window.innerHeight;


});








// ==========================
// BANCO LOCAL
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
// CRIAR CARDS
// ==========================



function carregar(){


const grupos =
document.getElementById("grupos");


const canais =
document.getElementById("canais");


const aliados =
document.getElementById("aliados");





grupos.innerHTML="";


canais.innerHTML="";


aliados.innerHTML="";





dados.grupos.forEach(item=>{


grupos.innerHTML +=
`

<div class="card">

<h3>
${item.nome}
</h3>

<p>
${item.desc || ""}
</p>


<a href="${item.link}" target="_blank">

Entrar

</a>

</div>

`;



});







dados.canais.forEach(item=>{


canais.innerHTML +=
`

<div class="card">

<h3>
${item.nome}
</h3>

<p>
${item.desc || ""}
</p>


<a href="${item.link}" target="_blank">

Acessar

</a>

</div>

`;



});








dados.aliados.forEach(item=>{


aliados.innerHTML +=
`

<div class="card">

<h3>
⭐ ${item.nome}
</h3>


<p>
${item.desc || ""}
</p>


<a href="${item.link}" target="_blank">

Visitar

</a>


</div>

`;


});



carregarADM();


}








// ==========================
// PARCERIA WHATSAPP
// ==========================



function carregarADM(){



const select =
document.getElementById("admSelect");



select.innerHTML="";



dados.admins.forEach((adm,index)=>{


select.innerHTML +=
`

<option value="${index}">

${adm.nome}

</option>


`;



});


}






document
.getElementById("whatsapp")
.addEventListener("click",()=>{



let adm =
dados.admins[
document.getElementById("admSelect").value
];



let mensagem =
document.getElementById("mensagemParceria")
.value;



let link =

"https://wa.me/"+
adm.numero+
"?text="+
encodeURIComponent(mensagem);



window.open(link,"_blank");



});







carregar();
