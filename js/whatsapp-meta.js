/* ==========================================================
   R.H.S — BUSCA AUTOMÁTICA DE NOME E FOTO (WhatsApp) V2
   ==========================================================
   Versão corrigida com múltiplos métodos de busca
   ========================================================== */

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

  // Limpa o link
  link = link.trim();
  if (!link.startsWith('http')) {
    link = 'https://' + link;
  }

  console.log('🔍 Buscando:', link);

  // Tenta múltiplos métodos
  const metodos = [
    // Método 1: Fetch direto com User-Agent (tenta primeiro)
    async () => {
      try {
        const response = await fetch(link, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8'
          }
        });
        const html = await response.text();
        return extrairMetadados(html);
      } catch (e) {
        console.log('Método 1 falhou:', e.message);
        return null;
      }
    },
    
    // Método 2: AllOrigins (fallback)
    async () => {
      try {
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(link)}`;
        const response = await fetch(proxyUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        const html = await response.text();
        return extrairMetadados(html);
      } catch (e) {
        console.log('Método 2 falhou:', e.message);
        return null;
      }
    },
    
    // Método 3: CodeTabs
    async () => {
      try {
        const proxyUrl = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(link)}`;
        const response = await fetch(proxyUrl);
        const html = await response.text();
        return extrairMetadados(html);
      } catch (e) {
        console.log('Método 3 falhou:', e.message);
        return null;
      }
    },
    
    // Método 4: ThingProxy
    async () => {
      try {
        const proxyUrl = `https://thingproxy.freeboard.io/fetch/${link}`;
        const response = await fetch(proxyUrl);
        const html = await response.text();
        return extrairMetadados(html);
      } catch (e) {
        console.log('Método 4 falhou:', e.message);
        return null;
      }
    },
    
    // Método 5: Iframe (último recurso)
    async () => {
      return new Promise((resolve) => {
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = link;
        iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts');
        
        const timeout = setTimeout(() => {
          try { document.body.removeChild(iframe); } catch(e) {}
          resolve(null);
        }, 8000);
        
        iframe.onload = function() {
          clearTimeout(timeout);
          try {
            const doc = iframe.contentDocument || iframe.contentWindow.document;
            const titulo = doc.querySelector('meta[property="og:title"]')?.getAttribute('content');
            const imagem = doc.querySelector('meta[property="og:image"]')?.getAttribute('content');
            try { document.body.removeChild(iframe); } catch(e) {}
            resolve({ titulo, imagem });
          } catch (e) {
            try { document.body.removeChild(iframe); } catch(e) {}
            resolve(null);
          }
        };
        
        iframe.onerror = function() {
          clearTimeout(timeout);
          try { document.body.removeChild(iframe); } catch(e) {}
          resolve(null);
        };
        
        document.body.appendChild(iframe);
      });
    }
  ];

  // Tenta cada método
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
      ultimoErro = e.message;
      continue;
    }
  }

  // Se chegou aqui, todos falharam
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
    // Tenta usar DOMParser
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
    // Fallback: usar regex
    console.log('Fallback para regex');
  }
  
  // Fallback com regex
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

// EXPORTS (se estiver usando módulos)
// export { buscarMetadadosWhatsApp, testarBuscaWhatsApp };
