/* ==========================================================
   R.H.S V5 — LÓGICA DO PAINEL ADMIN (via token do GitHub)
   ========================================================== */

function toast(msg){
  const el = document.getElementById("toast");
  if(!el) return;
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(el._t);
  el._t = setTimeout(()=>{ el.hidden = true; }, 3200);
}

let BANCO = null;

// ========== FUNÇÃO QUE ESTAVA FALTANDO ==========
function novoId(prefixo){
  return prefixo + "_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6);
}

/* ==========================================================
   LOGIN
   ========================================================== */
async function entrarADM(){
  const tokenInput = document.getElementById("token").value.trim();
  const erro = document.getElementById("loginErro");
  erro.hidden = true;

  if(!tokenInput){
    erro.textContent = "Cole o token antes de entrar.";
    erro.hidden = false;
    return;
  }

  ghSalvarToken(tokenInput);

  const teste = await ghTestarToken();
  if(!teste.ok){
    ghLimparToken();
    erro.textContent = teste.motivo;
    erro.hidden = false;
    return;
  }

  try{
    const resultado = await ghCarregar();
    BANCO = resultado.data;
  }catch(e){
    erro.textContent = "Token válido, mas não consegui carregar os dados: " + e.message;
    erro.hidden = false;
    return;
  }

  document.getElementById("login").hidden = true;
  document.getElementById("painel").hidden = false;
  document.getElementById("usuarioLogado").textContent = "Conectado via token do GitHub";
  carregarTudo();
}

function sair(){
  ghLimparToken();
  document.getElementById("login").hidden = false;
  document.getElementById("painel").hidden = true;
  document.getElementById("token").value = "";
}

(async function tentarSessaoAtiva(){
  if(!ghToken()) return;
  const teste = await ghTestarToken();
  if(!teste.ok) return;
  try{
    const resultado = await ghCarregar();
    BANCO = resultado.data;
    document.getElementById("login").hidden = true;
    document.getElementById("painel").hidden = false;
    document.getElementById("usuarioLogado").textContent = "Conectado via token do GitHub";
    carregarTudo();
  }catch(e){}
})();

async function salvarBanco(mensagem){
  try{
    await ghSalvar(BANCO, mensagem);
    return true;
  }catch(e){
    toast("Erro ao salvar no GitHub: " + e.message);
    return false;
  }
}

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
   BUSCA AUTOMÁTICA
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
  return titulo.replace(/\s*[-|]\s*WhatsApp.*$/i, "").trim();
}

["imagem","aliadoImagem"].forEach(id => {
  const el = document.getElementById(id);
  if(!el) return;
  el.addEventListener("input", () => {
    const preview = document.getElementById(id === "imagem" ? "previewImg" : "previewImgAliado");
    if(preview) preview.src = el.value || "img/default-avatar.svg";
  });
});

/* ==========================================================
   COMUNIDADES
   ========================================================== */
async function salvarComunidade(){
  const nome = document.getElementById("nome").value.trim();
  const link = document.getElementById("link").value.trim();
  if(!nome || !link){ toast("Preencha ao menos o nome e o link."); return; }

  const item = {
    id: novoId("com"),
    titulo: nome,
    imagem: document.getElementById("imagem").value.trim() || "",
    link,
    tipo: document.getElementById("tipo").value,
    categoria: document.getElementById("categoria").value,
    desc: document.getElementById("descricao").value.trim(),
    vip: document.getElementById("vip").checked,
    fixado: document.getElementById("fixado").checked,
    cliques: 0,
    criadoEm: Date.now()
  };

  BANCO.comunidades.push(item);
  toast("Salvando no GitHub...");
  const ok = await salvarBanco(`Adiciona comunidade: ${nome}`);
  if(!ok){ BANCO.comunidades.pop(); return; }

  toast("Comunidade publicada ✅");
  ["nome","link","imagem","descricao"].forEach(id => document.getElementById(id).value = "");
  document.getElementById("vip").checked = false;
  document.getElementById("fixado").checked = false;
  document.getElementById("previewImg").src = "img/default-avatar.svg";
  document.getElementById("statusBusca").textContent = "";
  listarComunidades();
}

function listarComunidades(){
  const area = document.getElementById("listaComunidades");
  const lista = BANCO.comunidades || [];
  document.getElementById("contComunidades").textContent = `(${lista.length})`;
  area.innerHTML = "";
  lista.slice().reverse().forEach(item => {
    area.innerHTML += `
      <div class="item-admin">
        <img src="${item.imagem || 'img/default-avatar.svg'}" onerror="this.src='img/default-avatar.svg'">
        <div class="info">
          <h3>${item.titulo} ${item.vip ? '⭐' : ''} ${item.fixado ? '📌' : ''}</h3>
          <p>${item.tipo} · ${item.categoria}</p>
        </div>
        <div class="acoes">
          <button class="icon-btn danger" onclick="excluirItem('comunidades','${item.id}')">🗑</button>
        </div>
      </div>`;
  });
}

async function excluirItem(colecao, id){
  if(!confirm("Tem certeza que quer excluir?")) return;
  const lista = BANCO[colecao] || [];
  const indice = lista.findIndex(i => i.id === id);
  if(indice === -1) return;
  const removido = lista.splice(indice, 1)[0];

  const ok = await salvarBanco(`Remove item de ${colecao}: ${removido.titulo || removido.nome || id}`);
  if(!ok){ lista.splice(indice, 0, removido); return; }

  toast("Excluído.");
  if(colecao === "comunidades") listarComunidades();
  if(colecao === "aliados") listarAliados();
  if(colecao === "admins") listarAdms();
}

/* ==========================================================
   ALIADOS
   ========================================================== */
async function salvarAliado(){
  const nome = document.getElementById("aliadoNome").value.trim();
  const link = document.getElementById("aliadoLink").value.trim();
  if(!nome || !link){ toast("Preencha ao menos o nome e o link."); return; }

  const item = {
    id: novoId("ali"),
    titulo: nome,
    imagem: document.getElementById("aliadoImagem").value.trim() || "",
    link,
    categoria: "Aliado",
    desc: document.getElementById("aliadoDesc").value.trim(),
    criadoEm: Date.now()
  };

  BANCO.aliados.push(item);
  const ok = await salvarBanco(`Adiciona aliado: ${nome}`);
  if(!ok){ BANCO.aliados.pop(); return; }

  toast("Aliado salvo ⭐");
  ["aliadoNome","aliadoLink","aliadoImagem","aliadoDesc"].forEach(id => document.getElementById(id).value = "");
  document.getElementById("previewImgAliado").src = "img/default-avatar.svg";
  listarAliados();
}

function listarAliados(){
  const area = document.getElementById("listaAliados");
  const lista = BANCO.aliados || [];
  area.innerHTML = "";
  lista.slice().reverse().forEach(item => {
    area.innerHTML += `
      <div class="item-admin">
        <img src="${item.imagem || 'img/default-avatar.svg'}" onerror="this.src='img/default-avatar.svg'">
        <div class="info"><h3>${item.titulo}</h3></div>
        <div class="acoes"><button class="icon-btn danger" onclick="excluirItem('aliados','${item.id}')">🗑</button></div>
      </div>`;
  });
}

/* ==========================================================
   ADMS
   ========================================================== */
async function addADM(){
  const nome = document.getElementById("admNome").value.trim();
  const numero = document.getElementById("admNumero").value.trim();
  if(!nome || !numero){ toast("Preencha nome e número."); return; }

  const item = { id: novoId("adm"), nome, numero };
  BANCO.admins.push(item);
  const ok = await salvarBanco(`Adiciona ADM: ${nome}`);
  if(!ok){ BANCO.admins.pop(); return; }

  toast("ADM salvo 🤝");
  document.getElementById("admNome").value = "";
  document.getElementById("admNumero").value = "";
  listarAdms();
}

function listarAdms(){
  const area = document.getElementById("listaAdms");
  const lista = BANCO.admins || [];
  area.innerHTML = "";
  lista.forEach(item => {
    area.innerHTML += `
      <div class="item-admin">
        <div class="info"><h3>${item.nome}</h3><p>${item.numero}</p></div>
        <div class="acoes"><button class="icon-btn danger" onclick="excluirItem('admins','${item.id}')">🗑</button></div>
      </div>`;
  });
}

/* ==========================================================
   CONFIG
   ========================================================== */
function carregarConfigForm(){
  const c = BANCO.config || {};
  document.getElementById("cfgNome").value = c.nome || "";
  document.getElementById("cfgLogo").value = c.logo || "";
  if(c.logo) document.getElementById("previewLogo").src = c.logo;
  document.getElementById("cfgDescricao").value = c.descricao || "";
  document.getElementById("cfgWhatsapp").value = c.whatsapp || "";
  document.getElementById("cfgMusica").value = c.musica || "";
  document.getElementById("cfgFooter").value = c.footer || "";
}

document.getElementById("cfgLogo").addEventListener("input", (e)=>{
  document.getElementById("previewLogo").src = e.target.value || "img/default-avatar.svg";
});

async function salvarConfig(){
  BANCO.config = {
    nome: document.getElementById("cfgNome").value.trim(),
    logo: document.getElementById("cfgLogo").value.trim(),
    descricao: document.getElementById("cfgDescricao").value.trim(),
    whatsapp: document.getElementById("cfgWhatsapp").value.trim(),
    musica: document.getElementById("cfgMusica").value.trim(),
    footer: document.getElementById("cfgFooter").value.trim()
  };
  const ok = await salvarBanco("Atualiza configurações do site");
  if(ok) toast("Configurações salvas ✅");
}

/* ==========================================================
   IMPORTAR
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
    status.textContent = `Buscando ${importados+1}/${todos.length}...`;

    let titulo = item.titulo || "";
    let imagem = item.imagem || "";

    if((!titulo || !imagem) && item.link){
      const meta = await buscarMetadadosWhatsApp(item.link);
      if(meta.sucesso){
        if(!titulo && meta.titulo) titulo = limparTituloWpp(meta.titulo);
        if(!imagem && meta.imagem){ imagem = meta.imagem; comFotoAutomatica++; }
      }
    }

    BANCO.comunidades.push({
      id: novoId("com"),
      titulo: titulo || (item.tipo === "canal" ? "Canal R.H.S" : "Grupo R.H.S"),
      imagem: imagem || "",
      link: item.link || "",
      tipo: item.tipo,
      categoria: item.categoria || "Geral",
      desc: "",
      vip: !!item.vip,
      fixado: !!item.fixado,
      cliques: 0,
      criadoEm: Date.now()
    });
    importados++;
  }

  status.className = "status-busca";
  status.textContent = "Salvando tudo no GitHub...";
  const ok = await salvarBanco(`Importa ${importados} comunidades do config.json antigo`);

  if(ok){
    status.className = "status-busca ok";
    status.textContent = `Importação concluída: ${importados} comunidades (${comFotoAutomatica} com foto/nome buscados automaticamente).`;
    document.getElementById("jsonAntigo").value = "";
    listarComunidades();
  }else{
    status.className = "status-busca erro";
    status.textContent = "Busquei os dados, mas não consegui salvar no GitHub. Tenta de novo.";
  }
}
