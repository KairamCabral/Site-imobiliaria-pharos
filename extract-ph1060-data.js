/**
 * Script para extrair dados do PH1060 do console do navegador
 * 
 * COMO USAR:
 * 1. Abra http://localhost:3600
 * 2. Abra o DevTools Console (F12)
 * 3. Cole este script inteiro e pressione ENTER
 * 4. O JSON será copiado automaticamente para a área de transferência
 * 5. Cole (Ctrl+V) o resultado e me envie
 */

(async () => {
  try {
    console.log('%c🔍 BUSCANDO DADOS DO PH1060...', 'background: #0000ff; color: white; padding: 8px; font-weight: bold;');
    
    // Buscar diretamente da API
    const response = await fetch('/api/properties?city=Balneário Camboriú&limit=200');
    const data = await response.json();
    
    if (!data.success) {
      console.error('❌ Erro ao buscar dados:', data.error);
      return;
    }
    
    // Procurar pelo PH1060
    const ph1060 = data.data.find(imovel => imovel.id === 'PH1060' || imovel.codigo === 'PH1060');
    
    if (!ph1060) {
      console.error('❌ PH1060 não encontrado!');
      console.log('📋 Imóveis disponíveis:', data.data.map(i => i.id || i.codigo));
      return;
    }
    
    console.log('%c✅ PH1060 ENCONTRADO!', 'background: #00ff00; color: black; padding: 8px; font-weight: bold;');
    
    // Extrair TODOS os campos
    const jsonCompleto = JSON.stringify(ph1060, null, 2);
    
    // Copiar para área de transferência
    await navigator.clipboard.writeText(jsonCompleto);
    
    console.log('%c✅ JSON COPIADO PARA ÁREA DE TRANSFERÊNCIA!', 'background: #00ff00; color: black; padding: 8px; font-weight: bold;');
    console.log('📋 Agora cole (Ctrl+V) e me envie!');
    console.log('');
    console.log('%cPreview dos dados:', 'font-weight: bold; font-size: 14px;');
    console.log(ph1060);
    console.log('');
    console.log('%c🏷️ FLAGS encontradas:', 'font-weight: bold; font-size: 14px; color: #ff00ff;');
    console.log('superDestaque:', ph1060.superDestaque);
    console.log('destaque:', ph1060.destaque);
    console.log('destaqueWeb:', ph1060.destaqueWeb);
    console.log('temPlaca:', ph1060.temPlaca);
    console.log('exclusivo:', ph1060.exclusivo);
    console.log('exibirNoSite:', ph1060.exibirNoSite);
    console.log('lancamento:', ph1060.lancamento);
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
})();

