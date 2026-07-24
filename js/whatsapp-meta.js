/* ==========================================================
   R.H.S — BUSCA AUTOMÁTICA DE NOME E FOTO (WhatsApp)
   ==========================================================
   Como funciona:
   O WhatsApp expõe o nome e a foto de grupos/canais como
   metadados públicos (og:title / og:image) na própria página
   do link de convite — é a MESMA informação que aparece quando
   alguém cola o link numa conversa e vê a pré-visualização.

   O navegador não consegue ler essa página direto (o WhatsApp
   não libera CORS), então usamos um proxy de leitura pública
   para buscar o HTML e extrair só esses dois metadados.

   Limitações honestas:
   - Depende de serviços de terceiros (os proxies abaixo) que
     podem ficar fora do ar ou limitar o número de pedidos.
   - Se o WhatsApp mudar a página, a extração pode falhar.
   - Por isso, a busca automática SEMPRE deixa os campos de
     nome/foto editáveis manualmente como reserva.
   ========================================================== */

const WHATSAPP_META_PROXIES = [
  (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url) => `https://corsproxy.io/?url=${encodeURIComponent(url)}`
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
      const resposta = await fetch(montarProxy(link), { signal: AbortSignal.timeout(9000) });
      if (!resposta.ok) continue;

      const html = await resposta.text();
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
