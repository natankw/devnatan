/* ==========================
        R.H.S ADM V4
========================== */



const SENHA = "RHS2026";





// ==========================
// BANCO
// ==========================


function banco(){


return JSON.parse(

localStorage.getItem("rhs")

)

||

{

comunidades:[],

aliados:[],

admins:[]

};


}




function salvar(dados){


localStorage.setItem(

"rhs",

JSON.stringify(dados)

);


}









// ==========================
// LOGIN
// ==========================


function entrarADM(){



let senha =

document.getElementById("senha").value;



if(senha === SENHA){



document.getElementById("login").style.display="none";


document.getElementById("painel").style.display="block";


listar();



}else{


alert("Senha incorreta");


}



}









// ==========================
// SALVAR COMUNIDADE
// ==========================


function salvarComunidade(){



let dados = banco();



let item = {


nome:

nome.value,


imagem:

imagem.value || "img/default.png",


link:

link.value,


tipo:

tipo.value,


categoria:

categoria.value,


desc:

descricao.value



};




dados.comunidades.push(item);



salvar(dados);



alert("Comunidade publicada ✅");



limpar();


listar();



}









// ==========================
// SALVAR ALIADO
// ==========================


function salvarAliado(){



let dados = banco();



let item = {



nome:

aliadoNome.value,


imagem:

aliadoImagem.value || "img/default.png",


link:

aliadoLink.value,


desc:

aliadoDesc.value,


categoria:

"Aliado"



};





dados.aliados.push(item);



salvar(dados);



alert("Aliado salvo ⭐");



listar();



}









// ==========================
// ADM PARCERIA
// ==========================


function addADM(){



let dados=banco();



dados.admins.push({


nome:

admNome.value,


numero:

admNumero.value



});



salvar(dados);



alert("ADM salvo 🤝");



admNome.value="";

admNumero.value="";


}









// ==========================
// LISTAR
// ==========================


function listar(){



let area =

document.getElementById("listaAdmin");



area.innerHTML="";



let dados=banco();





dados.comunidades.forEach((item,index)=>{



area.innerHTML += `


<div class="item">


<h3>

${item.nome}

</h3>


<p>

${item.tipo}

-

${item.categoria}

</p>



<button onclick="excluirComunidade(${index})">

Excluir

</button>



</div>


`;



});






dados.aliados.forEach((item,index)=>{



area.innerHTML += `


<div class="item">


<h3>

⭐ ${item.nome}

</h3>


<button onclick="excluirAliado(${index})">

Excluir

</button>


</div>


`;



});



}









// ==========================
// EXCLUIR
// ==========================


function excluirComunidade(index){


let dados=banco();



dados.comunidades.splice(index,1);



salvar(dados);



listar();


}







function excluirAliado(index){


let dados=banco();



dados.aliados.splice(index,1);



salvar(dados);



listar();


}









// ==========================
// LIMPAR
// ==========================


function limpar(){



nome.value="";

imagem.value="";

link.value="";

descricao.value="";


}








function sair(){


location.reload();


}
