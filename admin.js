/* ==========================
        R.H.S ADM
========================== */


const SENHA = "RHS2026";





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


document.getElementById("login").style.display="none";


document.getElementById("painel").style.display="block";



}else{


alert("Senha incorreta");


}


}









// GRUPO


function addGrupo(){


let dados=banco();



dados.grupos.push({

nome:
gNome.value,


link:
gLink.value,


desc:
gDesc.value


});



salvar(dados);



alert("Grupo salvo ✅");


limpar();


}









// CANAL


function addCanal(){


let dados=banco();



dados.canais.push({

nome:
cNome.value,


link:
cLink.value,


desc:
cDesc.value


});



salvar(dados);



alert("Canal salvo ✅");


limpar();


}









// ALIADO


function addAliado(){


let dados=banco();



dados.aliados.push({

nome:
aNome.value,


link:
aLink.value,


desc:
aDesc.value


});



salvar(dados);



alert("Aliado premium salvo ⭐");


limpar();


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


limpar();


}









function limpar(){


document
.querySelectorAll("input")
.forEach(item=>{


if(item.id !== "senha"){

item.value="";

}


});


}






function sair(){


location.reload();


}
