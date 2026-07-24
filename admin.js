/* ==========================
        R.H.S ADM V5
========================== */


const SENHA = "RHS2026";


let dados = {

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
// BANCO
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


alert("Erro ao carregar banco.json");


}



}








// ==========================
// SALVAR ITEM
// ==========================


function salvarItem(){



let tipo =
document.getElementById("tipo").value;



let item = {


nome:
document.getElementById("nome").value,


imagem:
document.getElementById("imagem").value,


link:
document.getElementById("link").value,


categoria:
document.getElementById("categoria").value,


desc:
document.getElementById("descricao").value


};






if(!item.nome || !item.link){


alert("Preencha nome e link");


return;


}







if(editando !== null){



dados[tipo][editando] = item;


editando=null;



}

else{


dados[tipo].push(item);


}







listar();


limpar();



alert("Salvo ✅");



}









// ==========================
// LISTAR
// ==========================


function listar(){



let area =
document.getElementById("listaAdmin");



if(!area)return;



area.innerHTML="";



let categorias=[

"grupos",

"canais",

"vip",

"parceiros"

];




categorias.forEach(tipo=>{



dados[tipo].forEach((item,index)=>{



area.innerHTML += `


<div class="item">


<h3>

${item.nome}

</h3>


<p>

${tipo}

- ${item.categoria}

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


document.getElementById("nome").value=item.nome;


document.getElementById("imagem").value=item.imagem;


document.getElementById("link").value=item.link;


document.getElementById("categoria").value=item.categoria;


document.getElementById("descricao").value=item.desc;



editando=index;



}









// ==========================
// EXCLUIR
// ==========================


function excluirItem(tipo,index){



dados[tipo].splice(index,1);



listar();



}








// ==========================
// LIMPAR
// ==========================


function limpar(){


document.getElementById("nome").value="";


document.getElementById("imagem").value="";


document.getElementById("link").value="";


document.getElementById("descricao").value="";


}








function sair(){


location.reload();


}
