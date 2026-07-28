/* ==========================================================
   R.H.S — BUSCA AUTOMÁTICA DE NOME E FOTO (WhatsApp) V3
   ==========================================================
   Corrigido: método direto sempre falhava por causa de CORS
   (o navegador bloqueia fetch pro domínio do WhatsApp, então
   nunca ia funcionar). Agora usa serviços feitos pra isso
   (microlink) antes de tentar proxies genéricos, com timeout
   em cada tentativa pra não travar em "Buscando...".
   ========================================================== */

const WPP_TIMEOUT_MS = 9000;

async function fetchComTimeout(url, opcoes = {}, ms = WPP_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    const resp = await fetch(url, { ...opcoes, signal: controller.signal });
    return resp;
  } finally {
    clearTimeout(timer);
  }
}

function resolverUrlImagem(imagem, linkOriginal) {
  if (!imagem) return null;
  try {
    return new URL(imagem, linkOriginal).href;
  } catch (e) {
    return imagem;
  }
}

// ==========================================================
// FUNÇÃO PRINCIPAL - Busca metadados do WhatsApp
// ==========================================================
async function buscarMetadadosWhatsApp(link) {
  if (!link || !/whatsapp\.com/i.test(link)) {
    return {
      titulo: null,
      imagem: null,
      sucesso: false,
      erro: "Link inválido"
    };
  }

  link = link.trim();
  if (!link.startsWith('http')) {
    link = 'https://' + link;
  }

  console.log('🔍 Buscando:', link);

  const metodos = [
    // Método 1: microlink.io — API feita pra extrair metadados (og:title/og:image),
    // já renderiza a página e devolve JSON pronto. É o mais confiável.
    async () => {
      const api = `https://api.microlink.io/?url=${encodeURIComponent(link)}&meta=true`;
      const resp = await fetchComTimeout(api);
      if (!resp.ok) throw new Error(`microlink respondeu ${resp.status}`);
      const json = await resp.json();
      if (json.status !== "success") return null;
      const titulo = json.data?.title || null;
      const imagem = json.data?.image?.url || json.data?.logo?.url || null;
      if (!titulo && !imagem) return null;
      return { titulo, imagem: resolverUrlImagem(imagem, link) };
    },

    // Método 2: corsproxy.io (fallback rápido e geralmente estável)
    async () => {
      const proxyUrl = `https://corsproxy.io/?url=${encodeURIComponent(link)}`;
      const resp = await fetchComTimeout(proxyUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      });
      const html = await resp.text();
      const meta = extrairMetadados(html);
      if (!meta) return null;
      return { titulo: meta.titulo, imagem: resolverUrlImagem(meta.imagem, link) };
    },

    // Método 3: AllOrigins (fallback)
    async () => {
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(link)}`;
      const resp = await fetchComTimeout(proxyUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      });
      const html = await resp.text();
      const meta = extrairMetadados(html);
      if (!meta) return null;
      return { titulo: meta.titulo, imagem: resolverUrlImagem(meta.imagem, link) };
    },

    // Método 4: CodeTabs
    async () => {
      const proxyUrl = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(link)}`;
      const resp = await fetchComTimeout(proxyUrl);
      const html = await resp.text();
      const meta = extrairMetadados(html);
      if (!meta) return null;
      return { titulo: meta.titulo, imagem: resolverUrlImagem(meta.imagem, link) };
    },

    // Método 5: Fetch direto (só funciona se o navegador/extensão liberar CORS;
    // deixado por último porque normalmente é bloqueado)
    async () => {
      const resp = await fetchComTimeout(link, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8'
        }
      });
      const html = await resp.text();
      const meta = extrairMetadados(html);
      if (!meta) return null;
      return { titulo: meta.titulo, imagem: resolverUrlImagem(meta.imagem, link) };
    }
  ];

  let ultimoErro = null;
  for (let i = 0; i < metodos.length; i++) {
    try {
      console.log(`🔄 Tentando método ${i + 1}/${metodos.length}...`);
      const resultado = await metodos[i]();

      if (resultado && (resultado.titulo || resultado.imagem)) {
        console.log(`✅ Método ${i + 1} funcionou!`);
        return {
          titulo: resultado.titulo ? resultado.titulo.trim() : null,
          imagem: resultado.imagem ? resultado.imagem.trim() : null,
          sucesso: true
        };
      }
    } catch (e) {
      console.log(`Método ${i + 1} falhou:`, e.message);
      ultimoErro = e.name === 'AbortError' ? 'tempo esgotado' : e.message;
      continue;
    }
  }

  return {
    titulo: null,
    imagem: null,
    sucesso: false,
    erro: `Não foi possível obter os dados. Último erro: ${ultimoErro || 'todos os métodos falharam'}`
  };
}

// ==========================================================
// FUNÇÃO AUXILIAR - Extrai metadados do HTML
// ==========================================================
function extrairMetadados(html) {
  if (!html || html.length < 100) return null;

  try {
    const doc = new DOMParser().parseFromString(html, "text/html");

    const titulo =
      doc.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
      doc.querySelector('meta[name="twitter:title"]')?.getAttribute('content') ||
      doc.querySelector('title')?.textContent ||
      null;

    const imagem =
      doc.querySelector('meta[property="og:image"]')?.getAttribute('content') ||
      doc.querySelector('meta[name="twitter:image"]')?.getAttribute('content') ||
      null;

    if (titulo || imagem) {
      return { titulo, imagem };
    }
  } catch (e) {
    console.log('Fallback para regex');
  }

  const tituloMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["']/i);
  const imagemMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']*)["']/i);

  return {
    titulo: tituloMatch ? tituloMatch[1] : null,
    imagem: imagemMatch ? imagemMatch[1] : null
  };
}

// ==========================================================
// FUNÇÃO PARA TESTAR (opcional)
// ==========================================================
async function testarBuscaWhatsApp(link) {
  console.log('🚀 Testando busca para:', link);
  const resultado = await buscarMetadadosWhatsApp(link);
  console.log('📊 Resultado:', resultado);

  if (resultado.sucesso) {
    console.log('✅ Nome:', resultado.titulo);
    console.log('✅ Foto:', resultado.imagem);
  } else {
    console.log('❌ Erro:', resultado.erro);
  }

  return resultado;
}
