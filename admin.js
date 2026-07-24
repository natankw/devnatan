/* ==========================
        R.H.S ADM v2
========================== */


const SENHA = "RHS2026";




// BANCO


function banco(){

return JSON.parse(
localStorage.getItem("rhs")
)
||
{

grupos:[],
canais:[],
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








// LOGIN


function entrarADM(){


let senha =
document.getElementById("senha").value;



if(senha === SENHA){


login.style.display="none";

painel.style.display="block";


listarItens();


}else{


alert("Senha incorreta");


}


}









// SALVAR ITEM


function salvarItem(){


let dados=banco();



let tipo =
document.getElementById("tipo").value;



let item = {

nome:
nome.value,

link:
link.value,

desc:
descricao.value,

categoria:
categoria.value,

tipo:
tipo.value

};




dados[tipo].push(item);



salvar(dados);



alert("Publicado com sucesso ✅");



limpar();


listarItens();


}









// LISTAR NO ADM


function listarItens(){


let area =
document.getElementById("listaAdmin");


area.innerHTML="";



let dados=banco();



["grupos","canais","aliados"]
.forEach(tipo=>{



dados[tipo].forEach((item,index)=>{



area.innerHTML += `


<div class="card">


<h3>

${item.nome}

</h3>


<p>
${tipo}
</p>


<button onclick="excluir('${tipo}',${index})">

Excluir

</button>



</div>


`;



});



});


}









// EXCLUIR


function excluir(tipo,index){


let dados=banco();



dados[tipo].splice(index,1);



salvar(dados);



listarItens();



}









// ADM PARCERIA


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









function limpar(){


nome.value="";

imagem.value="";

link.value="";

descricao.value="";


}







function sair(){

location.reload();

}
