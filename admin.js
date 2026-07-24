/* ==========================
        R.H.S ADM V6
========================== */


const SENHA = "RHS2026";


const API = "https://rhs-api.seudominio.workers.dev";



let dados = {

principal:{},

grupos:[],

canais:[],

vip:[],

parceiros:[]

};



let editando = null;







// ==========================
// LOGIN
// ==========================


function entrarADM(){


let senha =
document.getElementById("senha").value;



if(senha === SENHA){


document.getElementById("login").style.display="none";


document.getElementById("painel").style.display="block";


carregarBanco();


}

else{


alert("Senha incorreta");


}


}









// ==========================
// CARREGAR BANCO
// ==========================


async function carregarBanco(){


try{


let resposta =
await fetch("banco.json");


dados =
await resposta.json();



listar();


}


catch(e){


alert("Erro carregando banco");


}


}









// ==========================
// SALVAR NO GITHUB
// ==========================


async function publicar(){


try{


let resposta =
await fetch(API,{

method:"POST",

headers:{


"Content-Type":"application/json"


},


body:JSON.stringify({


senha:SENHA,


banco:dados


})


});



let resultado =
await resposta.json();



if(resultado.ok){


alert("Publicado no GitHub ✅");


}

else{


alert("Erro ao publicar");


}



}

catch(e){


alert("Worker offline");


}



}









// ==========================
// ADICIONAR ITEM
// ==========================


function salvarItem(){

let tipo = document.getElementById("tipo").value;


let item={

nome: document.getElementById("nome").value,

imagem: document.getElementById("imagem").value,

link: document.getElementById("link").value,

categoria: document.getElementById("categoria").value,

descricao: document.getElementById("descricao").value

};



if(!item.nome || !item.link){

alert("Preencha nome e link");

return;

}



dados[tipo].push(item);



listar();


publicar();


limpar();


alert("Publicado ✅");


}







if(editando !== null){


dados[tipo][editando]=item;


editando=null;


}

else{


dados[tipo].push(item);


}



listar();



publicar();



limpar();



}









// ==========================
// LISTAR
// ==========================


function listar(){



let area =
document.getElementById("listaAdmin");



if(!area)return;



area.innerHTML="";



[
"grupos",
"canais",
"vip",
"parceiros"

]

.forEach(tipo=>{



dados[tipo].forEach((item,index)=>{



area.innerHTML+=`


<div class="item">


<h3>${item.nome}</h3>


<p>

${tipo}

</p>



<button onclick="editarItem('${tipo}',${index})">

Editar

</button>



<button onclick="excluirItem('${tipo}',${index})">

Excluir

</button>



</div>


`;



});


});



}









// ==========================
// EDITAR
// ==========================


function editarItem(tipo,index){


let item =
dados[tipo][index];



document.getElementById("tipo").value=tipo;


nome.value=item.nome;


imagem.value=item.imagem;


link.value=item.link;


categoria.value=item.categoria;


descricao.value=item.descricao;



editando=index;



}









// ==========================
// EXCLUIR
// ==========================


function excluirItem(tipo,index){


dados[tipo].splice(index,1);



listar();


publicar();



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

// ==========================
// BUSCAR INFORMAÇÕES
// ==========================


async function buscarInfo(){


let linkAtual =
document.getElementById("link").value;



if(!linkAtual){


alert("Coloque um link primeiro");


return;


}


// Nome temporário baseado no link

let nomeGerado =
"Comunidade R.H.S";



document.getElementById("nome").value =
nomeGerado;



document.getElementById("descricao").value =
"Comunidade encontrada pelo sistema R.H.S";



alert("Dados preparados ✅");


         }

// ==========================
// BUSCAR FOTO PELO LINK
// ==========================


async function buscarFoto(){


let link = document.getElementById("link").value;



if(!link){

alert("Coloque o link primeiro");

return;

}



try{


let resposta = await fetch(

"https://api.microlink.io?url=" 
+
encodeURIComponent(link)

);



let dados = await resposta.json();



let imagem = 
dados.data?.image?.url;



if(imagem){


document.getElementById("imagem").value = imagem;


alert("Foto encontrada ✅");


}else{


alert("Não foi encontrada uma imagem nesse link");


}



}catch(erro){


console.log(erro);


alert("Erro ao buscar foto");


}


}
