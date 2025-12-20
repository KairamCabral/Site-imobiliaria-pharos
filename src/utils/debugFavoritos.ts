/**
 * PHAROS - DEBUG DE FAVORITOS
 * Utilitários para debugging do sistema de favoritos
 * Use no console do navegador
 */

/**
 * Limpa todos os favoritos salvos no localStorage
 */
export function limparFavoritos() {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('pharos_favoritos_guest');
  console.log('✅ Favoritos limpos com sucesso!');
}

/**
 * Mostra todos os favoritos salvos
 */
export function verFavoritos() {
  if (typeof window === 'undefined') return;
  
  const data = localStorage.getItem('pharos_favoritos_guest');
  if (!data) {
    console.log('❌ Nenhum favorito salvo');
    return;
  }
  
  const parsed = JSON.parse(data);
  console.log('📋 Favoritos salvos:', parsed);
  return parsed;
}

/**
 * Adiciona um favorito de teste
 */
export function adicionarFavoritoTeste(imovelId: string = 'imovel-001') {
  if (typeof window === 'undefined') return;
  
  const data = localStorage.getItem('pharos_favoritos_guest');
  const parsed = data ? JSON.parse(data) : { favoritos: [], colecoes: [] };
  
  const novoFavorito = {
    id: imovelId,
    savedAt: new Date().toISOString(),
    collectionId: 'default',
  };
  
  parsed.favoritos.push(novoFavorito);
  localStorage.setItem('pharos_favoritos_guest', JSON.stringify(parsed));
  
  console.log(`✅ Favorito ${imovelId} adicionado com sucesso!`);
  window.location.reload();
}

/**
 * Testa a conversão de IDs
 */
export function testarConversaoIds() {
  const testes = [
    { de: 'imovel-01', para: 'imovel-001' },
    { de: 'imovel-02', para: 'imovel-002' },
    { de: 'imovel-001', para: 'imovel-001' },
  ];
  
  console.log('🧪 Testando conversão de IDs:');
  
  testes.forEach(teste => {
    const resultado = teste.de.replace(/(\d{2})$/, (match) => match.padStart(3, '0'));
    const passou = resultado === teste.para;
    console.log(`${passou ? '✅' : '❌'} ${teste.de} → ${resultado} (esperado: ${teste.para})`);
  });
}

// Exportar para window em desenvolvimento
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).debugFavoritos = {
    limpar: limparFavoritos,
    ver: verFavoritos,
    adicionar: adicionarFavoritoTeste,
    testarIds: testarConversaoIds,
  };
  
  console.log(`
╔═══════════════════════════════════════════════╗
║  🔧 DEBUG FAVORITOS PHAROS                    ║
╠═══════════════════════════════════════════════╣
║  Use no console:                              ║
║                                               ║
║  debugFavoritos.limpar()                      ║
║    → Limpa todos os favoritos                 ║
║                                               ║
║  debugFavoritos.ver()                         ║
║    → Mostra favoritos salvos                  ║
║                                               ║
║  debugFavoritos.adicionar('imovel-001')       ║
║    → Adiciona um favorito de teste            ║
║                                               ║
║  debugFavoritos.testarIds()                   ║
║    → Testa conversão de IDs                   ║
╚═══════════════════════════════════════════════╝
  `);
}

