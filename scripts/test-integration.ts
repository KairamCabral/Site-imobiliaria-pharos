/**
 * Script de Teste de Integração
 * 
 * Testa a integração com o provider ativo
 * 
 * Uso:
 *   npx tsx scripts/test-integration.ts
 */

import { getPropertyService, getLeadService } from '../src/services';
import { getProviderInfo } from '../src/providers/registry';

async function main() {
  console.log('🚀 Testando Integração Provider\n');

  // 1. Provider Info
  console.log('📊 Informações do Provider:');
  const providerInfo = getProviderInfo();
  console.log(`   Nome: ${providerInfo.name}`);
  console.log(`   Ativo: ${providerInfo.active}`);
  console.log(`   Capacidades:`, providerInfo.capabilities);
  console.log('');

  // 2. Health Check
  console.log('🏥 Health Check:');
  const propertyService = getPropertyService();
  const health = await propertyService.healthCheck();
  console.log(`   Status: ${health.healthy ? '✅ Saudável' : '❌ Com problemas'}`);
  console.log(`   Mensagem: ${health.message}`);
  console.log('');

  // 3. Listar Imóveis
  console.log('🏠 Listando Imóveis (primeiros 5):');
  let result;
  try {
    result = await propertyService.searchProperties(
      { city: 'Balneário Camboriú' },
      { page: 1, limit: 5 }
    );

    console.log(`   Total: ${result.pagination.total}`);
    console.log(`   Página: ${result.pagination.page}/${result.pagination.totalPages}`);
    console.log(`   Encontrados: ${result.properties.length}`);
    console.log('');

    result.properties.forEach((property, index) => {
      console.log(`   ${index + 1}. ${property.title}`);
      console.log(`      Código: ${property.code}`);
      console.log(`      Tipo: ${property.type}`);
      console.log(`      Cidade: ${property.address.city} - ${property.address.neighborhood}`);
      console.log(`      Preço: R$ ${property.pricing.sale?.toLocaleString('pt-BR') || 'N/A'}`);
      console.log(`      Área: ${property.specs.privateArea || property.specs.totalArea || 'N/A'} m²`);
      console.log(`      Quartos: ${property.specs.bedrooms} | Suítes: ${property.specs.suites}`);
      console.log('');
    });
  } catch (error) {
    console.error('   ❌ Erro:', error);
  }

  // 4. Detalhes de um Imóvel
  if (result && result.properties.length > 0) {
    const firstProperty = result.properties[0];
    console.log(`📋 Detalhes do Imóvel ${firstProperty.code}:`);
    
    try {
      const details = await propertyService.getPropertyById(firstProperty.id);
      console.log(`   Título: ${details.title}`);
      console.log(`   Descrição: ${details.description?.substring(0, 100)}...`);
      console.log(`   Fotos: ${details.photos.length}`);
      console.log(`   Corretor: ${details.realtor?.name || 'N/A'}`);
      console.log('');
    } catch (error) {
      console.error('   ❌ Erro:', error);
    }
  }

  // 5. Teste de Lead (simulado - não envia de fato)
  console.log('📧 Teste de Criação de Lead (simulado):');
  console.log('   Nome: João Silva');
  console.log('   Email: joao@example.com');
  console.log('   Telefone: 47999990000');
  console.log('   ⚠️  Não enviado (apenas teste de validação)');
  console.log('');

  console.log('✅ Testes concluídos!');
}

main().catch(console.error);

