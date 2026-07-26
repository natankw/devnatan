// ============================================================
// GITHUB LOADER — Lê e escreve o db.json direto no repo
// ============================================================

const GH_REPO = "natankw/devnatan";
const GH_FILE = "data/db.json";
const GH_BRANCH = "main";

function ghToken(){
  return sessionStorage.getItem("gh_token") || "";
}

function ghSalvarToken(token){
  sessionStorage.setItem("gh_token", token);
}

function ghLimparToken(){
  sessionStorage.removeItem("gh_token");
}

async function ghTestarToken(){
  const token = ghToken();
  if(!token) return { ok: false, motivo: "Token não fornecido." };

  try{
    const resp = await fetch(`https://api.github.com/repos/${GH_REPO}`, {
      headers: { Authorization: `token ${token}` }
    });
    if(resp.status === 401) return { ok: false, motivo: "Token inválido ou expirado." };
    if(!resp.ok) return { ok: false, motivo: `Erro ${resp.status}: ${resp.statusText}` };
    return { ok: true };
  }catch(e){
    return { ok: false, motivo: "Erro de rede: " + e.message };
  }
}

async function ghCarregar(){
  const token = ghToken();
  const url = `https://api.github.com/repos/${GH_REPO}/contents/${GH_FILE}?ref=${GH_BRANCH}`;

  const resp = await fetch(url, {
    headers: { Authorization: `token ${token}` }
  });

  if(!resp.ok) throw new Error(`Não foi possível carregar ${GH_FILE}: ${resp.status}`);

  const dados = await resp.json();
  const conteudo = atob(dados.content);
  const json = JSON.parse(conteudo);

  return {
    sha: dados.sha,
    data: json
  };
}

async function ghSalvar(data, mensagem = "Atualiza dados via admin"){
  const token = ghToken();
  if(!token) throw new Error("Token não fornecido.");

  // Pega o sha atual
  const url = `https://api.github.com/repos/${GH_REPO}/contents/${GH_FILE}?ref=${GH_BRANCH}`;
  const resp = await fetch(url, {
    headers: { Authorization: `token ${token}` }
  });

  if(!resp.ok) throw new Error(`Não foi possível ler ${GH_FILE} para salvar: ${resp.status}`);

  const dados = await resp.json();
  const sha = dados.sha;

  const conteudo = btoa(JSON.stringify(data, null, 2));

  const payload = {
    message: mensagem,
    content: conteudo,
    sha: sha,
    branch: GH_BRANCH
  };

  const respSalvar = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `token ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if(!respSalvar.ok) throw new Error(`Erro ao salvar: ${respSalvar.status}`);
  return await respSalvar.json();
}
