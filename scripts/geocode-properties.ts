/**
 * Script para Geocodificar Todos os Imóveis
 * Roda em background para adicionar coordenadas a imóveis
 * 
 * Uso:
 * npx tsx scripts/geocode-properties.ts
 * 
 * Ou adicione ao package.json:
 * "geocode": "tsx scripts/geocode-properties.ts"
 */

import { geocodeBatch } from '../src/lib/geocoding/geocodingService';

// Interface simplificada de propriedade
interface Property {
  id: string;
  codigo: string;
  endereco: string;
  cidade: string;
  estado: string;
  latitude?: number | null;
  longitude?: number | null;
}

/**
 * Função principal
 */
async function main() {
  console.log('🗺️  Script de Geocoding em Massa');
  console.log('=====================================\n');
  
  // TODO: Integrar com seu serviço de dados
  // Exemplo de como buscar propriedades (adapte conforme seu sistema)
  
  console.log('⚠️  ATENÇÃO: Este é um script de exemplo.');
  console.log('   Você precisa adaptar a função fetchProperties() para buscar');
  console.log('   dados do seu sistema (Vista CRM, banco de dados, etc.)\n');
  
  // Exemplo com dados mockados
  const properties: Property[] = [
    {
      id: 'PH123',
      codigo: 'PH123',
      endereco: 'Av. Atlântica, 100',
      cidade: 'Balneário Camboriú',
      estado: 'SC',
    },
    {
      id: 'PH456',
      codigo: 'PH456',
      endereco: 'Rua 1926, 200',
      cidade: 'Balneário Camboriú',
      estado: 'SC',
    },
    // Adicione mais propriedades aqui...
  ];
  
  console.log(`📦 Total de imóveis: ${properties.length}\n`);
  
  // Filtrar apenas os que não têm coordenadas
  const needsGeocoding = properties.filter(
    p => !p.latitude || !p.longitude
  );
  
  console.log(`🔍 Imóveis sem coordenadas: ${needsGeocoding.length}`);
  console.log(`✅ Imóveis já geocodificados: ${properties.length - needsGeocoding.length}\n`);
  
  if (needsGeocoding.length === 0) {
    console.log('✨ Todos os imóveis já têm coordenadas!');
    return;
  }
  
  // Confirmar execução
  console.log('⏳ Iniciando geocoding...\n');
  
  // Preparar dados para batch
  const batch = needsGeocoding.map(p => ({
    id: p.id,
    address: p.endereco,
    city: p.cidade,
    state: p.estado,
  }));
  
  // Processar em chunks de 50 (para não sobrecarregar)
  const CHUNK_SIZE = 50;
  const chunks: typeof batch[] = [];
  
  for (let i = 0; i < batch.length; i += CHUNK_SIZE) {
    chunks.push(batch.slice(i, i + CHUNK_SIZE));
  }
  
  console.log(`📦 Processando ${chunks.length} chunks de ${CHUNK_SIZE} imóveis\n`);
  
  let totalSuccess = 0;
  let totalFailed = 0;
  
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    
    console.log(`\n🔄 Processando chunk ${i + 1}/${chunks.length} (${chunk.length} imóveis)...`);
    
    try {
      const results = await geocodeBatch(chunk);
      
      // Aqui você salvaria no banco de dados
      // Exemplo:
      for (const result of results) {
        console.log(
          `  ✅ ${result.id}: [${result.latitude.toFixed(6)}, ${result.longitude.toFixed(6)}]` +
          ` (${result.confidence}, ${result.source})`
        );
        
        // TODO: Salvar no banco de dados
        // await savePropertyCoordinates(result.id, result.latitude, result.longitude);
      }
      
      totalSuccess += results.length;
      
      // Aguardar 1 segundo entre chunks para não sobrecarregar
      if (i < chunks.length - 1) {
        console.log('   ⏳ Aguardando 1s antes do próximo chunk...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
    } catch (error) {
      console.error(`  ❌ Erro no chunk ${i + 1}:`, error);
      totalFailed += chunk.length;
    }
  }
  
  // Resumo final
  console.log('\n=====================================');
  console.log('🎉 Geocoding Concluído!\n');
  console.log(`✅ Sucesso: ${totalSuccess} imóveis`);
  console.log(`❌ Falhas: ${totalFailed} imóveis`);
  console.log(`📊 Taxa de sucesso: ${((totalSuccess / batch.length) * 100).toFixed(1)}%`);
  console.log('\n⚠️  LEMBRE-SE: Você precisa implementar a persistência no banco de dados!');
}

// Executar
main().catch(error => {
  console.error('\n❌ Erro fatal:', error);
  process.exit(1);
});

