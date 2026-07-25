/* ==========================================================
   R.H.S V5 — LÓGICA DO PAINEL ADMIN
   ========================================================== */

function toast(msg){
  const el = document.getElementById("toast");
  if(!el) return;
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(el._t);
  el._t = setTimeout(()=>{ el.hidden = true; }, 3200);
}

/* ==========================================================
   AUTENTICAÇÃO
   ========================================================== */
function entrarADM(){
  const erro = document.getElementById("loginErro");
  erro.hidden = true;

  if(typeof auth === "undefined" || !auth){
    erro.textContent = "O Firebase não carregou corretamente. Confira js/firebase-config.js.";
    erro.hidden = false;
    return;
  }

  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value;

  auth.signInWithEmailAndPassword(email, senha)
    .catch((e) => {
      erro.textContent = traduzirErroAuth(e.code);
      erro.hidden = false;
    });
}

function traduzirErroAuth(codigo){
  const mapa = {
    "auth/invalid-email": "E-mail inválido.",
    "auth/user-not-found": "Usuário não encontrado.",
    "auth/wrong-password": "Senha incorreta.",
    "auth/invalid-credential": "E-mail ou senha incorretos.",
    "auth/too-many-requests": "Muitas tentativas. Aguarde um pouco."
  };
  return mapa[codigo] || "Não foi possível entrar. Verifique os dados.";
}

function sair(){ auth.signOut(); }

auth.onAuthStateChanged((user) => {
  if(user){
    document.getElementById("login").hidden = true;
    document.getElementById("painel").hidden = false;
    document.getElementById("usuarioLogado").textContent = user.email;
    carregarTudo();
  }else{
    document.getElementById("login").hidden = false;
    document.getElementById("painel").hidden = true;
  }
});

/* ==========================================================
   ABAS
   ========================================================== */
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach(p => p.hidden = true);
    btn.classList.add("active");
    document.getElementById("tab-" + btn.dataset.tab).hidden = false;
  });
});

function carregarTudo(){
  listarComunidades();
  listarAliados();
  listarAdms();
  carregarConfigForm();
}

/* ==========================================================
   BUSCA AUTOMÁTICA (usa js/whatsapp-meta.js)
   ========================================================== */
async function buscarAutomatico(){
  const link = document.getElementById("link").value.trim();
  await executarBusca(link, "nome", "imagem", "previewImg", "statusBusca", "btnBuscarAuto");
}
async function buscarAutomaticoAliado(){
  const link = document.getElementById("aliadoLink").value.trim();
  await executarBusca(link, "aliadoNome", "aliadoImagem", "previewImgAliado", null, null);
}

async function executarBusca(link, campoNomeId, campoImgId, previewId, statusId, botaoId){
  if(!link){ toast("Cole um link primeiro."); return; }
  const status = statusId ? document.getElementById(statusId) : null;
  const botao = botaoId ? document.getElementById(botaoId) : null;

  if(botao){ botao.disabled = true; botao.textContent = "Buscando..."; }
  if(status){ status.className = "status-busca"; status.textContent = "Buscando nome e foto no WhatsApp..."; }

  const resultado = await buscarMetadadosWhatsApp(link);

  if(botao){ botao.disabled = false; botao.textContent = "🔎 Buscar automaticamente"; }

  if(resultado.sucesso){
    if(resultado.titulo) document.getElementById(campoNomeId).value = limparTituloWpp(resultado.titulo);
    if(resultado.imagem){
      document.getElementById(campoImgId).value = resultado.imagem;
      const preview = document.getElementById(previewId);
      if(preview) preview.src = resultado.imagem;
    }
    if(status){ status.className = "status-busca ok"; status.textContent = "Encontrado! Revise antes de publicar."; }
  }else{
    if(status){ status.className = "status-busca erro"; status.textContent = resultado.erro || "Não encontrado. Preencha manualmente."; }
  }
}

function limparTituloWpp(titulo){
  // remove sufixos comuns tipo "| WhatsApp Group" etc.
  return titulo.replace(/\s*[-|]\s*WhatsApp.*$/i, "").trim();
}

// atualiza preview ao colar uma URL de imagem manualmente
["imagem","aliadoImagem"].forEach(id => {
  const el = document.getElementById(id);
  if(!el) return;
  el.addEventListener("input", () => {
    const preview = document.getElementById(id === "imagem" ? "previewImg" : "previewImgAliado");
    if(preview) preview.src = el.value || "img/default-avatar.svg";
  });
});

/* ==========================================================
   COMUNIDADES — CRUD
   ========================================================== */
async function salvarComunidade(){
  const nome = document.getElementById("nome").value.trim();
  const link = document.getElementById("link").value.trim();
  if(!nome || !link){ toast("Preencha ao menos o nome e o link."); return; }

  const item = {
    titulo: nome,
    imagem: document.getElementById("imagem").value.trim() || "",
    link,
    tipo: document.getElementById("tipo").value,
    categoria: document.getElementById("categoria").value,
    desc: document.getElementById("descricao").value.trim(),
    vip: document.getElementById("vip").checked,
    fixado: document.getElementById("fixado").checked,
    cliques: 0,
    criadoEm: firebase.firestore.FieldValue.serverTimestamp()
  };

  try{
    await db.collection("comunidades").add(item);
    toast("Comunidade publicada ✅");
    ["nome","link","imagem","descricao"].forEach(id => document.getElementById(id).value = "");
    document.getElementById("vip").checked = false;
    document.getElementById("fixado").checked = false;
    document.getElementById("previewImg").src = "img/default-avatar.svg";
    document.getElementById("statusBusca").textContent = "";
    listarComunidades();
  }catch(e){
    toast("Erro ao publicar: " + e.message);
  }
}

async function listarComunidades(){
  const area = document.getElementById("listaComunidades");
  const snap = await db.collection("comunidades").orderBy("criadoEm","desc").get();
  document.getElementById("contComunidades").textContent = `(${snap.size})`;
  area.innerHTML = "";
  snap.docs.forEach(doc => {
    const item = doc.data();
    area.innerHTML += `
      <div class="item-admin">
        <img src="${item.imagem || 'img/default-avatar.svg'}" onerror="this.src='img/default-avatar.svg'">
        <div class="info">
          <h3>${item.titulo} ${item.vip ? '⭐' : ''} ${item.fixado ? '📌' : ''}</h3>
          <p>${item.tipo} · ${item.categoria} · ${item.cliques || 0} entradas</p>
        </div>
        <div class="acoes">
          <button class="icon-btn danger" onclick="excluirItem('comunidades','${doc.id}')" title="Excluir">🗑</button>
        </div>
      </div>`;
  });
}

async function excluirItem(colecao, id){
  if(!confirm("Tem certeza que quer excluir?")) return;
  await db.collection(colecao).doc(id).delete();
  toast("Excluído.");
  if(colecao === "comunidades") listarComunidades();
  if(colecao === "aliados") listarAliados();
  if(colecao === "admins") listarAdms();
}

/* ==========================================================
   ALIADOS — CRUD
   ========================================================== */
async function salvarAliado(){
  const nome = document.getElementById("aliadoNome").value.trim();
  const link = document.getElementById("aliadoLink").value.trim();
  if(!nome || !link){ toast("Preencha ao menos o nome e o link."); return; }

  const item = {
    titulo: nome,
    imagem: document.getElementById("aliadoImagem").value.trim() || "",
    link,
    categoria: "Aliado",
    desc: document.getElementById("aliadoDesc").value.trim(),
    cliques: 0,
    criadoEm: firebase.firestore.FieldValue.serverTimestamp()
  };

  try{
    await db.collection("aliados").add(item);
    toast("Aliado salvo ⭐");
    ["aliadoNome","aliadoLink","aliadoImagem","aliadoDesc"].forEach(id => document.getElementById(id).value = "");
    document.getElementById("previewImgAliado").src = "img/default-avatar.svg";
    listarAliados();
  }catch(e){
    toast("Erro ao salvar: " + e.message);
  }
}

async function listarAliados(){
  const area = document.getElementById("listaAliados");
  const snap = await db.collection("aliados").orderBy("criadoEm","desc").get();
  area.innerHTML = "";
  snap.docs.forEach(doc => {
    const item = doc.data();
    area.innerHTML += `
      <div class="item-admin">
        <img src="${item.imagem || 'img/default-avatar.svg'}" onerror="this.src='img/default-avatar.svg'">
        <div class="info"><h3>${item.titulo}</h3><p>${item.cliques || 0} entradas</p></div>
        <div class="acoes"><button class="icon-btn danger" onclick="excluirItem('aliados','${doc.id}')">🗑</button></div>
      </div>`;
  });
}

/* ==========================================================
   ADMS DE PARCERIA
   ========================================================== */
async function addADM(){
  const nome = document.getElementById("admNome").value.trim();
  const numero = document.getElementById("admNumero").value.trim();
  if(!nome || !numero){ toast("Preencha nome e número."); return; }
  await db.collection("admins").add({ nome, numero });
  toast("ADM salvo 🤝");
  document.getElementById("admNome").value = "";
  document.getElementById("admNumero").value = "";
  listarAdms();
}

async function listarAdms(){
  const area = document.getElementById("listaAdms");
  const snap = await db.collection("admins").get();
  area.innerHTML = "";
  snap.docs.forEach(doc => {
    const item = doc.data();
    area.innerHTML += `
      <div class="item-admin">
        <div class="info"><h3>${item.nome}</h3><p>${item.numero}</p></div>
        <div class="acoes"><button class="icon-btn danger" onclick="excluirItem('admins','${doc.id}')">🗑</button></div>
      </div>`;
  });
}

/* ==========================================================
   CONFIGURAÇÕES DO SITE
   ========================================================== */
async function carregarConfigForm(){
  const doc = await db.collection("config").doc("site").get();
  if(!doc.exists) return;
  const c = doc.data();
  document.getElementById("cfgNome").value = c.nome || "";
  document.getElementById("cfgDescricao").value = c.descricao || "";
  document.getElementById("cfgWhatsapp").value = c.whatsapp || "";
  document.getElementById("cfgMusica").value = c.musica || "";
  document.getElementById("cfgFooter").value = c.footer || "";
}

async function salvarConfig(){
  await db.collection("config").doc("site").set({
    nome: document.getElementById("cfgNome").value.trim(),
    descricao: document.getElementById("cfgDescricao").value.trim(),
    whatsapp: document.getElementById("cfgWhatsapp").value.trim(),
    musica: document.getElementById("cfgMusica").value.trim(),
    footer: document.getElementById("cfgFooter").value.trim()
  }, { merge: true });
  toast("Configurações salvas ✅");
}

/* ==========================================================
   IMPORTAR CONFIG.JSON ANTIGO
   ========================================================== */
async function importarConfigAntigo(){
  const texto = document.getElementById("jsonAntigo").value.trim();
  const status = document.getElementById("statusImportacao");
  if(!texto){ toast("Cole o JSON antigo primeiro."); return; }

  let dados;
  try{ dados = JSON.parse(texto); }
  catch(e){ status.className = "status-busca erro"; status.textContent = "JSON inválido: " + e.message; return; }

  const canais = (dados.canais || []).map(c => ({ ...c, tipo: "canal" }));
  const grupos = (dados.grupos || []).map(g => ({ ...g, tipo: "grupo" }));
  const todos = [...canais, ...grupos];

  if(todos.length === 0){ status.textContent = "Nenhum grupo/canal encontrado no JSON."; return; }

  let importados = 0, comFotoAutomatica = 0;
  for(const item of todos){
    status.className = "status-busca";
    status.textContent = `Importando ${importados+1}/${todos.length}...`;

    let titulo = item.titulo || "";
    let imagem = item.imagem || "";

    if((!titulo || !imagem) && item.link){
      const meta = await buscarMetadadosWhatsApp(item.link);
      if(meta.sucesso){
        if(!titulo && meta.titulo) titulo = limparTituloWpp(meta.titulo);
        if(!imagem && meta.imagem){ imagem = meta.imagem; comFotoAutomatica++; }
      }
    }

    await db.collection("comunidades").add({
      titulo: titulo || (item.tipo === "canal" ? "Canal R.H.S" : "Grupo R.H.S"),
      imagem: imagem.startsWith("uploads/") ? imagem : imagem,
      link: item.link || "",
      tipo: item.tipo,
      categoria: item.categoria || "Geral",
      desc: "",
      vip: !!item.vip,
      fixado: !!item.fixado,
      cliques: 0,
      criadoEm: firebase.firestore.FieldValue.serverTimestamp()
    });
    importados++;
  }

  status.className = "status-busca ok";
  status.textContent = `Importação concluída: ${importados} comunidades (${comFotoAutomatica} com foto/nome buscados automaticamente).`;
  document.getElementById("jsonAntigo").value = "";
  listarComunidades();
       }
