/* ==========================================================
   R.H.S — BUSCA AUTOMÁTICA DE NOME E FOTO (WhatsApp) V2
   ==========================================================
   CORREÇÕES:
   - Adicionado User-Agent realista
   - Suporte a redirecionamentos
   - Múltiplos métodos de extração
   - Fallback para imagem via CSS
   - Tratamento de erros melhorado
   ========================================================== */

const WHATSAPP_META_PROXIES = [
  // Proxy 1: AllOrigins (mais estável)
  (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  
  // Proxy 2: CodeTabs
  (url) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
  
  // Proxy 3: ThingProxy
  (url) => `https://thingproxy.freeboard.io/fetch/${url}`,
  
  // Proxy 4: CorsProxy (nova versão)
  (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`
];

// User-Agents realistas para evitar bloqueio
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
];

function extrairMetaTags(html) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  
  // Função melhorada para buscar múltiplos seletores
  const pegar = (seletores) => {
    if (typeof seletores === 'string') seletores = [seletores];
    
    for (const seletor of seletores) {
      try {
        const el = doc.querySelector(seletor);
        if (el) {
          const content = el.getAttribute('content') || el.textContent || el.src;
          if (content && content.trim()) return content.trim();
        }
      } catch (e) { continue; }
    }
    return null;
  };

  // BUSCA TÍTULO - Múltiplas fontes
  const titulo = pegar([
    'meta[property="og:title"]',
    'meta[name="twitter:title"]',
    'title',
    'h1[class*="title"]',
    'h1[class*="name"]',
    'div[class*="title"]',
    'span[class*="name"]'
  ]);

  // BUSCA IMAGEM - Múltiplas fontes
  let imagem = pegar([
    'meta[property="og:image"]',
    'meta[property="og:image:secure_url"]',
    'meta[name="twitter:image"]',
    'meta[name="twitter:image:src"]',
    'link[rel="image_src"]',
    'img[class*="avatar"]',
    'img[class*="image"]',
    'img[class*="photo"]',
    'img[src*="whatsapp"]'
  ]);

  // Se encontrou imagem relativa, converte para absoluta
  if (imagem && !imagem.startsWith('http')) {
    if (imagem.startsWith('//')) {
      imagem = 'https:' + imagem;
    } else if (imagem.startsWith('/')) {
      imagem = 'https://whatsapp.com' + imagem;
    }
  }

  // Tenta extrair imagem do CSS (background-image)
  if (!imagem) {
    const styleTags = doc.querySelectorAll('style');
    for (const style of styleTags) {
      const content = style.textContent;
      const match = content.match(/background-image:\s*url\(["']?([^"']*)["']?\)/i);
      if (match && match[1]) {
        imagem = match[1];
        break;
      }
    }
  }

  return { titulo, imagem };
}

async function buscarMetadadosWhatsApp(link) {
  if (!link || !/whatsapp\.com/i.test(link)) {
    return { 
      titulo: null, 
      imagem: null, 
      sucesso: false, 
      erro: "Link inválido" 
    };
  }

  // Limpa e formata o link
  link = link.trim();
  if (!link.startsWith('http')) {
    link = 'https://' + link;
  }

  const falhas = [];
  let melhorTitulo = null;
  let melhorImagem = null;

  for (const montarProxy of WHATSAPP_META_PROXIES) {
    const proxyUrl = montarProxy(link);
    const nomeProxy = new URL(proxyUrl).hostname;
    
    try {
      console.log(`🔍 Tentando ${nomeProxy}...`);

      // Escolhe um User-Agent aleatório
      const userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

      const resposta = await fetch(proxyUrl, { 
        signal: AbortSignal.timeout(15000),
        headers: {
          'User-Agent': userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1'
        }
      });

      if (!resposta.ok) {
        falhas.push(`${nomeProxy}: HTTP ${resposta.status}`);
        continue;
      }

      let html;
      const contentType = resposta.headers.get('content-type') || '';

      if (contentType.includes('application/json')) {
        const json = await resposta.json();
        html = json.contents || json.data || JSON.stringify(json);
      } else {
        html = await resposta.text();
      }

      if (!html || html.length < 100) {
        falhas.push(`${nomeProxy}: resposta vazia ou muito curta`);
        continue;
      }

      // Extrai metadados
      const { titulo, imagem } = extrairMetaTags(html);

      // Guarda o melhor resultado encontrado
      if (titulo && !melhorTitulo) melhorTitulo = titulo;
      if (imagem && !melhorImagem) melhorImagem = imagem;

      // Se encontrou TÍTULO E IMAGEM, sucesso total!
      if (titulo && imagem) {
        console.log(`✅ Sucesso completo com ${nomeProxy}`);
        return {
          titulo: titulo.trim(),
          imagem: imagem.trim(),
          sucesso: true,
          fonte: nomeProxy
        };
      }

      // Se encontrou só título ou só imagem, continua tentando
      if (titulo || imagem) {
        falhas.push(`${nomeProxy}: encontrado ${titulo ? 'título' : ''} ${imagem ? 'imagem' : ''}`);
        continue;
      }

      falhas.push(`${nomeProxy}: nenhum metadado encontrado`);

    } catch (e) {
      console.warn(`❌ Falha em ${nomeProxy}:`, e.message);
      falhas.push(`${nomeProxy}: ${e.message}`);
    }

    // Delay entre tentativas para não sobrecarregar
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Se encontrou pelo menos título, retorna com o que tem
  if (melhorTitulo || melhorImagem) {
    return {
      titulo: melhorTitulo || 'Grupo WhatsApp',
      imagem: melhorImagem || null,
      sucesso: true,
      parcial: !(melhorTitulo && melhorImagem),
      erro: melhorImagem ? null : 'Imagem não encontrada'
    };
  }

  // Falha total
  return {
    titulo: null,
    imagem: null,
    sucesso: false,
    erro: `Falhou em todos os proxies: ${falhas.join(' | ')}`
  };
}

// ==========================================================
// FUNÇÃO DE TESTE COM LOG DETALHADO
// ==========================================================
async function testarBusca(link) {
  console.log('🚀 Iniciando busca por:', link);
  console.log('⏳ Aguarde...');
  
  const inicio = Date.now();
  const resultado = await buscarMetadadosWhatsApp(link);
  const tempo = ((Date.now() - inicio) / 1000).toFixed(2);
  
  console.log('📊 Resultado em', tempo, 'segundos:');
  console.log('✅ Sucesso:', resultado.sucesso);
  if (resultado.titulo) console.log('📝 Título:', resultado.titulo);
  if (resultado.imagem) console.log('🖼️ Imagem:', resultado.imagem);
  if (resultado.erro) console.log('❌ Erro:', resultado.erro);
  
  return resultado;
}

// ==========================================================
// FUNÇÃO PARA USAR NO SEU APP
// ==========================================================
async function buscarDados(link) {
  const resultado = await buscarMetadadosWhatsApp(link);
  
  if (resultado.sucesso) {
    return {
      nome: resultado.titulo || 'Grupo WhatsApp',
      foto: resultado.imagem || null,
      sucesso: true
    };
  } else {
    return {
      nome: null,
      foto: null,
      sucesso: false,
      erro: resultado.erro
    };
  }
}

// EXPORTS (se estiver usando módulos)
// export { buscarMetadadosWhatsApp, testarBusca, buscarDados };
