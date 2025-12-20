/**
 * Debug Enrichment Process
 */

import { NextResponse } from 'next/server';
import { getVistaClient } from '@/providers/vista/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  const logs: string[] = [];
  
  try {
    const client = getVistaClient();
    
    // Passo 1: Buscar lista básica
    logs.push('1. Buscando lista básica...');
    const listResponse = await client.get('/imoveis/listar', {
      pesquisa: { paginacao: { pagina: 1, quantidade: 1 } },
      showtotal: 1
    });
    
    const basicProperties: any[] = [];
    Object.keys(listResponse.data as Record<string, any>).forEach(key => {
      if (!['total', 'paginas', 'pagina', 'quantidade'].includes(key)) {
        const imovel = (listResponse.data as Record<string, any>)[key];
        if (imovel && imovel.Codigo) {
          basicProperties.push(imovel);
        }
      }
    });
    
    logs.push(`2. Encontrados ${basicProperties.length} imóveis básicos`);
    logs.push(`3. Primeiro código: ${basicProperties[0]?.Codigo}`);
    
    // Passo 2: Buscar detalhes do primeiro
    if (basicProperties.length > 0) {
      const codigo = basicProperties[0].Codigo;
      
      logs.push(`4. Buscando detalhes de ${codigo}...`);
      
      const pesquisa = {
        fields: [
          'Codigo', 'ValorVenda', 'Dormitorios', 'Suites',
          'Vagas', 'AreaTotal', 'FotoDestaque'
        ]
      };
      
      const detailsResponse = await client.get('/imoveis/detalhes', {
        imovel: codigo,
        pesquisa: pesquisa
      });
      
      const details = detailsResponse.data as any;
      
      logs.push(`5. Detalhes retornados:`);
      logs.push(`   - ValorVenda: ${details.ValorVenda}`);
      logs.push(`   - Dormitorios: ${details.Dormitorios}`);
      logs.push(`   - AreaTotal: ${details.AreaTotal}`);
      
      // Passo 3: Mesclar
      const merged = { ...basicProperties[0], ...details };
      
      logs.push(`6. Dados mesclados:`);
      logs.push(`   - Codigo: ${merged.Codigo}`);
      logs.push(`   - ValorVenda: ${merged.ValorVenda}`);
      logs.push(`   - Dormitorios: ${merged.Dormitorios}`);
      
      return NextResponse.json({
        success: true,
        logs,
        basic: {
          Codigo: basicProperties[0].Codigo,
          temValorVenda: !!basicProperties[0].ValorVenda
        },
        details: {
          Codigo: details.Codigo,
          ValorVenda: details.ValorVenda,
          Dormitorios: details.Dormitorios
        },
        merged: {
          Codigo: merged.Codigo,
          ValorVenda: merged.ValorVenda,
          Dormitorios: merged.Dormitorios
        }
      });
    }
    
    return NextResponse.json({ success: false, error: 'Nenhum imóvel encontrado', logs });
    
  } catch (error: any) {
    logs.push(`ERRO: ${error.message}`);
    return NextResponse.json({ success: false, error: error.message, logs, stack: error.stack }, { status: 500 });
  }
}

