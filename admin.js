/* ==========================
        R.H.S ADM
========================== */


const SENHA = "RHS2026";



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







// ==========================
// GRUPOS
// ==========================



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



alert("Grupo adicionado!");



limpar();


}








// ==========================
// CANAIS
// ==========================



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



alert("Canal adicionado!");



limpar();


}









// ==========================
// ALIADOS
// ==========================



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



alert("Aliado salvo ⭐");



limpar();


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



alert("ADM salvo!");



limpar();


}









function limpar(){


document
.querySelectorAll("input")
.forEach(i=>{


if(i.id!="senha"){

i.value="";

}


});


}







function sair(){


location.reload();


}
