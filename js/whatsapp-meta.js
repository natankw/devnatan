/* ==========================================================
   R.H.S — BUSCA AUTOMÁTICA DE NOME E FOTO (WhatsApp)
   ==========================================================
   Como funciona:
   O WhatsApp expõe o nome e a foto de grupos/canais como
   metadados públicos (og:title / og:image) na própria página
   do link de convite — é a MESMA informação que aparece quando
   alguém cola o link numa conversa e vê a pré-visualização.

   O navegador não consegue ler essa página direto (o WhatsApp
   não libera CORS), então usamos proxies de leitura pública
   pra buscar o HTML e extrair só esses dois metadados.

   Agora com MAIS proxies de reserva — se um cair, tenta o
   próximo automaticamente, então a chance de falhar é bem menor.
   ========================================================== */

const WHATSAPP_META_PROXIES = [
  (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
  (url) => `https://corsproxy.io/?url=${encodeURIComponent(url)}`,
  (url) => `https://thingproxy.freeboard.io/fetch/${url}`,
  (url) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`
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
    try {
      const proxyUrl = montarProxy(link);
      const resposta = await fetch(proxyUrl, { signal: AbortSignal.timeout(12000) });
      if (!resposta.ok) continue;

      // O endpoint "get" do allorigins retorna JSON com o html dentro,
      // os outros retornam o HTML puro direto.
      let html;
      if (proxyUrl.includes("allorigins.win/get")) {
        const json = await resposta.json();
        html = json.contents || "";
      } else {
        html = await resposta.text();
      }

      if (!html) continue;

      const { titulo, imagem } = extrairMetaTags(html);

      if (titulo || imagem) {
        return {
          titulo: titulo ? titulo.trim() : null,
          imagem: imagem ? imagem.trim() : null,
          sucesso: true
        };
      }
    } catch (e) {
      // tenta o próximo proxy da lista
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
