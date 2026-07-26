/* ==========================================================
   R.H.S — BUSCA AUTOMÁTICA DE NOME E FOTO (WhatsApp)
   ==========================================================
   Nota: o corsproxy.io foi removido da lista — ele passou a
   exigir domínio cadastrado (API key) pra sites em produção
   fora de localhost/github.io, e nosso domínio (CNAME próprio)
   não entra nessa lista grátis, então ele sempre falhava.
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
 * Retorna { titulo, imagem, sucesso }.
 */
async function buscarMetadadosWhatsApp(link) {
  if (!link || !/whatsapp\.com/i.test(link)) {
    return { titulo: null, imagem: null, sucesso: false, erro: "Link inválido" };
  }

  for (const montarProxy of WHATSAPP_META_PROXIES) {
    const proxyUrl = montarProxy(link);
    try {
      const resposta = await fetch(proxyUrl, { signal: AbortSignal.timeout(12000) });
      if (!resposta.ok) {
        console.warn("[whatsapp-meta] proxy falhou:", proxyUrl, "status:", resposta.status);
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
        console.warn("[whatsapp-meta] proxy retornou vazio:", proxyUrl);
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
      console.warn("[whatsapp-meta] HTML ok mas sem og:title/og:image:", proxyUrl);
    } catch (e) {
      console.warn("[whatsapp-meta] erro de rede/timeout:", proxyUrl, e.message);
      continue;
    }
  }

  return {
    titulo: null,
    imagem: null,
    sucesso: false,
    erro: "Não foi possível buscar automaticamente. Preencha manualmente."
  };
}
