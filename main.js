/* ==========================================================
   BUSCA AUTOMÁTICA DO WHATSAPP (integrado ao painel)
   ========================================================== */

// Função que vai ser chamada pelo botão "Buscar automaticamente"
async function buscarAutomaticamente() {
  // Procura o campo de input do link
  const linkInput = document.getElementById('linkInput') || document.querySelector('input[placeholder*="Link do grupo"]');
  const nomeInput = document.getElementById('nomeComunidade') || document.querySelector('input[placeholder*="Nome da comunidade"]');
  const fotoInput = document.getElementById('fotoComunidade') || document.querySelector('input[placeholder*="Foto (URL)"]');
  
  if (!linkInput) {
    console.error('❌ Campo de link não encontrado!');
    toast('Erro: campo de link não encontrado');
    return;
  }
  
  const link = linkInput.value.trim();
  if (!link) {
    toast('⚠️ Cole um link do WhatsApp primeiro');
    return;
  }
  
  if (!link.includes('whatsapp.com')) {
    toast('⚠️ Link inválido. Use um link do WhatsApp');
    return;
  }
  
  toast('🔍 Buscando dados...');
  
  try {
    const resultado = await buscarMetadadosWhatsApp(link);
    
    if (resultado.sucesso) {
      if (resultado.titulo && nomeInput) {
        nomeInput.value = resultado.titulo;
      }
      if (resultado.imagem && fotoInput) {
        fotoInput.value = resultado.imagem;
      }
      toast('✅ Dados encontrados!');
      console.log('📊 Dados obtidos:', resultado);
    } else {
      toast('❌ ' + resultado.erro);
      console.error('❌ Erro na busca:', resultado.erro);
    }
  } catch (error) {
    toast('❌ Erro: ' + error.message);
    console.error('❌ Erro:', error);
  }
}

// Procura o botão "Buscar automaticamente" e adiciona o evento
document.addEventListener('DOMContentLoaded', function() {
  // Procura por qualquer botão que tenha "Buscar automaticamente" ou "🔎"
  const botoes = document.querySelectorAll('button');
  let botaoBusca = null;
  
  for (const btn of botoes) {
    if (btn.textContent.includes('Buscar automaticamente') || 
        btn.textContent.includes('🔎') ||
        btn.id === 'btnBuscar') {
      botaoBusca = btn;
      break;
    }
  }
  
  if (botaoBusca) {
    console.log('✅ Botão de busca encontrado!');
    botaoBusca.addEventListener('click', buscarAutomaticamente);
  } else {
    console.warn('⚠️ Botão "Buscar automaticamente" não encontrado');
  }
});

// Função para testar no console
window.testarBusca = async function(link) {
  if (!link) {
    link = prompt('Cole o link do WhatsApp:');
  }
  if (!link) return;
  
  console.log('🚀 Testando busca para:', link);
  const resultado = await buscarMetadadosWhatsApp(link);
  console.log('📊 Resultado:', resultado);
  
  if (resultado.sucesso) {
    console.log('✅ Nome:', resultado.titulo);
    console.log('✅ Foto:', resultado.imagem);
    alert(`✅ Encontrado!\n\nNome: ${resultado.titulo}\nFoto: ${resultado.imagem}`);
  } else {
    console.log('❌ Erro:', resultado.erro);
    alert(`❌ Falhou!\n\nErro: ${resultado.erro}`);
  }
  
  return resultado;
};
