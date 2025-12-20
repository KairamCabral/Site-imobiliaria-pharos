#!/usr/bin/env node

/**
 * Health Check: Endpoint /imoveis/fotos do Vista
 * 
 * Testa se o endpoint de galeria completa está disponível.
 * Útil para rodar diariamente (cron) e detectar quando o Vista habilitar.
 * 
 * Uso:
 *   node scripts/health-check-fotos.js
 * 
 * Exit codes:
 *   0 = Endpoint OK (galeria funcionando)
 *   1 = Endpoint com erro (404, 500, etc.)
 */

require('dotenv').config({ path: '.env.local' });

const VISTA_BASE_URL = process.env.VISTA_BASE_URL || 'https://gabarito-rest.vistahost.com.br';
const VISTA_API_KEY = process.env.VISTA_API_KEY;

// Códigos de teste (ajuste conforme seus imóveis)
const TEST_CODES = [
  { original: 'PH742', numeric: '742' },
  { original: 'PH1060', numeric: '1060' },
  { original: 'PH800', numeric: '800' },
];

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
};

async function testFotosEndpoint(codigo) {
  const url = `${VISTA_BASE_URL}/imoveis/fotos?key=${VISTA_API_KEY}&imovel=${codigo}`;
  
  try {
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(10000), // 10s timeout
    });

    const data = await response.json();
    const total = data.total || 0;

    return {
      codigo,
      status: response.status,
      ok: response.ok,
      total,
      success: response.ok && total > 0,
    };
  } catch (error) {
    return {
      codigo,
      status: 0,
      ok: false,
      total: 0,
      success: false,
      error: error.message,
    };
  }
}

async function main() {
  console.log(`${colors.blue}╔════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.blue}║  Health Check: Vista /imoveis/fotos        ║${colors.reset}`);
  console.log(`${colors.blue}╚════════════════════════════════════════════╝${colors.reset}`);
  console.log();

  if (!VISTA_API_KEY) {
    console.error(`${colors.red}✗ Erro: VISTA_API_KEY não configurada${colors.reset}`);
    console.log(`${colors.gray}  Configure em .env.local${colors.reset}`);
    process.exit(1);
  }

  console.log(`${colors.gray}Base URL: ${VISTA_BASE_URL}${colors.reset}`);
  console.log(`${colors.gray}Key (terminação): ...${VISTA_API_KEY.slice(-4)}${colors.reset}`);
  console.log(`${colors.gray}Testando ${TEST_CODES.length} códigos...${colors.reset}`);
  console.log();

  const results = [];

  for (const { original, numeric } of TEST_CODES) {
    console.log(`${colors.blue}→ Testando ${original} (numérico: ${numeric})${colors.reset}`);
    
    // Testar código numérico primeiro
    const resultNumeric = await testFotosEndpoint(numeric);
    console.log(`  ${resultNumeric.success ? colors.green + '✓' : colors.red + '✗'} Numérico (${numeric}): ${resultNumeric.status} - ${resultNumeric.total} fotos${colors.reset}`);
    
    if (resultNumeric.error) {
      console.log(`    ${colors.gray}Erro: ${resultNumeric.error}${colors.reset}`);
    }
    
    results.push(resultNumeric);
    
    // Se numérico falhar, testar string original
    if (!resultNumeric.success) {
      const resultOriginal = await testFotosEndpoint(original);
      console.log(`  ${resultOriginal.success ? colors.green + '✓' : colors.red + '✗'} Original (${original}): ${resultOriginal.status} - ${resultOriginal.total} fotos${colors.reset}`);
      
      if (resultOriginal.error) {
        console.log(`    ${colors.gray}Erro: ${resultOriginal.error}${colors.reset}`);
      }
      
      results.push(resultOriginal);
    }
    
    console.log();
  }

  // Resumo
  const successful = results.filter(r => r.success).length;
  const total = results.length;

  console.log(`${colors.blue}════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}Resumo:${colors.reset}`);
  console.log(`  Total de testes: ${total}`);
  console.log(`  ${colors.green}Sucesso: ${successful}${colors.reset}`);
  console.log(`  ${colors.red}Falhas: ${total - successful}${colors.reset}`);
  console.log();

  if (successful > 0) {
    console.log(`${colors.green}✓ Endpoint /imoveis/fotos está funcionando!${colors.reset}`);
    console.log(`${colors.yellow}⚠️ Ative FOTOS_ENDPOINT_ENABLED=true no .env.local${colors.reset}`);
    process.exit(0);
  } else {
    console.log(`${colors.red}✗ Endpoint /imoveis/fotos não está disponível${colors.reset}`);
    console.log(`${colors.gray}  Aguardando ativação pelo suporte do Vista${colors.reset}`);
    process.exit(1);
  }
}

main().catch(error => {
  console.error(`${colors.red}✗ Erro fatal:${colors.reset}`, error);
  process.exit(1);
});

