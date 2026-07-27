/* ==========================================================
   R.H.S — BUSCA AUTOMÁTICA DE NOME E FOTO (WhatsApp)
   ==========================================================
   Como funciona:
   O WhatsApp expõe o nome e a foto de grupos/canais como
   metadados públicos (og:title / og:image) na própria página
   do link de convite. O navegador não consegue ler essa página
   direto (o WhatsApp não libera CORS), então usamos proxies de
   leitura pública para buscar o HTML e extrair só esses dois
   metadados.

   Nota: o corsproxy.io foi removido da lista de proxies — ele
   passou a exigir domínio cadastrado (API key) pra sites em
   produção fora de localhost/github.io, e nosso domínio (CNAME
   próprio) não entra na lista grátis dele, então sempre falhava.

   Se TODOS os proxies falharem, o motivo exato de cada um
   aparece na tela (campo de status), sem precisar abrir o
   console do navegador.
   ========================================================== */

const WHATSAPP_META_PROXIES = [
  (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
  (url) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
  (url) => `https://thingproxy.freeboard.io/fetch/${url}`
];

function extrairMetaTags(html) {
  const doc = new DOMParser().parseFromString(html, "text/html");

  const pegar = (seletor) => {
    const el = doc.querySelector(seletor);
    return el ? el.getAttribute("content") : null;
  };

  const titulo =
    pegar('meta[property="og:title"]') ||
    pegar('meta[name="twitter:title"]') ||
    (doc.querySelector("title") ? doc.querySelector("title").textContent : null);

  const imagem =
    pegar('meta[property="og:image"]') ||
    pegar('meta[name="twitter:image"]');

  return { titulo, imagem };
}

/**
 * Tenta buscar automaticamente o nome e a foto de um link de
 * grupo (chat.whatsapp.com/...) ou canal (whatsapp.com/channel/...).
 * Retorna { titulo, imagem, sucesso, erro }.
 * Se falhar em todos os proxies, "erro" traz o motivo de CADA UM,
 * pra dar pra ler direto na tela do painel sem precisar de F12.
 */
async function buscarMetadadosWhatsApp(link) {
  if (!link || !/whatsapp\.com/i.test(link)) {
    return { titulo: null, imagem: null, sucesso: false, erro: "Link inválido" };
  }

  const falhas = [];

  for (const montarProxy of WHATSAPP_META_PROXIES) {
    const proxyUrl = montarProxy(link);
    const nomeProxy = proxyUrl.split("/")[2]; // só o domínio, pra identificar no log
    try {
      const resposta = await fetch(proxyUrl, { signal: AbortSignal.timeout(12000) });
      if (!resposta.ok) {
        falhas.push(`${nomeProxy}: HTTP ${resposta.status}`);
        continue;
      }

      let html;
      if (proxyUrl.includes("allorigins.win/get")) {
        const json = await resposta.json();
        html = json.contents || "";
      } else {
        html = await resposta.text();
      }

      if (!html) {
        falhas.push(`${nomeProxy}: resposta vazia`);
        continue;
      }

      const { titulo, imagem } = extrairMetaTags(html);

      if (titulo || imagem) {
        return {
          titulo: titulo ? titulo.trim() : null,
          imagem: imagem ? imagem.trim() : null,
          sucesso: true
        };
      }
      falhas.push(`${nomeProxy}: OK (${html.length} chars) mas sem og:title/og:image`);
    } catch (e) {
      falhas.push(`${nomeProxy}: ${e.message}`);
      continue;
    }
  }

  return {
    titulo: null,
    imagem: null,
    sucesso: false,
    erro: "Falhou em todos: " + falhas.join(" | ")
  };
}
