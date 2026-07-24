export default {
async fetch(request, env){

if(request.method !== "POST"){

return new Response(
"R.H.S API ONLINE"
);

}



const body = await request.json();



if(body.senha !== env.SENHA){

return new Response(
"Senha incorreta",
{
status:403
}
);

}



const github = await fetch(

`https://api.github.com/repos/${env.USUARIO}/${env.REPO}/contents/banco.json`

,{

headers:{

"Authorization":
`Bearer ${env.TOKEN}`,

"User-Agent":
"RHS-ADMIN"

}

}

);



const arquivo = await github.json();



const novoBanco =
btoa(
JSON.stringify(
body.banco,
null,
2
)
);



const atualizar = await fetch(

`https://api.github.com/repos/${env.USUARIO}/${env.REPO}/contents/banco.json`

,{

method:"PUT",

headers:{

"Authorization":
`Bearer ${env.TOKEN}`,

"User-Agent":
"RHS-ADMIN",

"Content-Type":
"application/json"

},

body:JSON.stringify({

message:
"Atualização R.H.S ADM",

content:
novoBanco,

sha:
arquivo.sha

})

}

);



return new Response(

JSON.stringify({

ok:true

}),

{

headers:{

"Content-Type":
"application/json"

}

}

);


}

}
