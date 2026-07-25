/* ==========================================================
   R.H.S — BANCO DE DADOS VIA GITHUB (sem Firebase)
   ==========================================================
   Como funciona:
   Todos os dados (comunidades, aliados, admins, configurações)
   ficam guardados em UM ÚNICO arquivo no seu repositório:
   data/db.json

   LEITURA (site público): busca esse arquivo direto, sem token,
   sem limite de acesso — é só um arquivo estático do GitHub Pages.

   ESCRITA (painel admin): usa um token do GitHub (que você cola
   na hora de entrar) pra criar um commit atualizando esse arquivo.
   O token nunca é salvo no código — fica só na memória do seu
   navegador enquanto a aba estiver aberta.

   Ajuste estes 3 valores se um dia mudar de repositório/branch:
   ========================================================== */

const GH_OWNER = "natankw";
const GH_REPO = "devnatan";
const GH_BRANCH = "main";
const GH_PATH = "data/db.json";

const DB_PADRAO = { comunidades: [], aliados: [], admins: [], config: {} };

function ghToken(){
  return sessionStorage.getItem("rhs_token") || "";
}
function ghSalvarToken(token){
  sessionStorage.setItem("rhs_token", token);
}
function ghLimparToken(){
  sessionStorage.removeItem("rhs_token");
}
function ghHeaders(){
  const headers = { "Accept": "application/vnd.github+json" };
  const t = ghToken();
  if(t) headers["Authorization"] = "token " + t;
  return headers;
}

function utf8ParaBase64(str){
  return btoa(unescape(encodeURIComponent(str)));
}
function base64ParaUtf8(str){
  return decodeURIComponent(escape(atob(str)));
}

function novoId(prefixo){
  return `${prefixo}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Busca o db.json diretamente do GitHub Pages (leitura pública,
 * sem token, sem limite de requisições). Usado pelo site (index.html).
 */
async function ghCarregarPublico(){
  const url = `data/db.json?t=${Date.now()}`;
  try{
    const resp = await fetch(url, { cache: "no-store" });
    if(!resp.ok) return structuredClone(DB_PADRAO);
    const data = await resp.json();
    data.comunidades = data.comunidades || [];
    data.aliados = data.aliados || [];
    data.admins = data.admins || [];
    data.config = data.config || {};
    return data;
  }catch(e){
    console.warn("Não foi possível carregar data/db.json:", e.message);
    return structuredClone(DB_PADRAO);
  }
}

/**
 * Busca o db.json via API do GitHub (precisa de token). Retorna
 * {data, sha}. Usado pelo painel admin, que precisa do sha pra
 * conseguir salvar depois.
 */
async function ghCarregar(){
  const url = `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/${GH_PATH}?ref=${GH_BRANCH}&t=${Date.now()}`;
  const resp = await fetch(url, { headers: ghHeaders() });

  if(resp.status === 404){
    return { data: structuredClone(DB_PADRAO), sha: null };
  }
  if(!resp.ok){
    const erro = await resp.json().catch(() => ({}));
    throw new Error(erro.message || `Erro ${resp.status} ao acessar o GitHub`);
  }
  const json = await resp.json();
  const conteudo = base64ParaUtf8(json.content.replace(/\n/g, ""));
  let data;
  try{ data = JSON.parse(conteudo); } catch(e){ data = structuredClone(DB_PADRAO); }
  data.comunidades = data.comunidades || [];
  data.aliados = data.aliados || [];
  data.admins = data.admins || [];
  data.config = data.config || {};
  return { data, sha: json.sha };
}

/**
 * Salva o db.json no GitHub (cria um commit). Busca o sha mais
 * recente antes de gravar, pra não sobrescrever uma alteração
 * feita em outra aba/dispositivo por engano.
 */
async function ghSalvar(data, mensagem){
  const atual = await ghCarregar();
  const conteudoBase64 = utf8ParaBase64(JSON.stringify(data, null, 2));

  const body = {
    message: mensagem || "Atualiza dados via painel R.H.S",
    content: conteudoBase64,
    branch: GH_BRANCH
  };
  if(atual.sha) body.sha = atual.sha;

  const url = `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/${GH_PATH}`;
  const resp = await fetch(url, {
    method: "PUT",
    headers: { ...ghHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if(!resp.ok){
    const erro = await resp.json().catch(() => ({}));
    throw new Error(erro.message || `Erro ${resp.status} ao salvar no GitHub`);
  }
  return true;
}

/**
 * Testa se o token colado no login tem acesso de escrita a este
 * repositório específico. Usado só na tela de login do admin.
 */
async function ghTestarToken(){
  const url = `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}`;
  let resp;
  try{
    resp = await fetch(url, { headers: ghHeaders() });
  }catch(e){
    return { ok: false, motivo: "Não foi possível conectar ao GitHub. Confira sua internet." };
  }
  if(resp.status === 401 || resp.status === 403){
    return { ok: false, motivo: "Token inválido, expirado, ou sem permissão nesse repositório." };
  }
  if(resp.status === 404){
    return { ok: false, motivo: "Repositório não encontrado — confira GH_OWNER/GH_REPO em js/github-db.js." };
  }
  if(!resp.ok){
    return { ok: false, motivo: `Erro ${resp.status} ao verificar o token.` };
  }
  const info = await resp.json();
  if(info.permissions && info.permissions.push === false){
    return { ok: false, motivo: "Esse token não tem permissão de escrita (push) nesse repositório." };
  }
  return { ok: true };
}
