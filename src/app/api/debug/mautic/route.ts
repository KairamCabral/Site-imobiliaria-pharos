/**
 * Debug Endpoint - Mautic Integration
 * 
 * Testa conexão e funcionalidade da integração com Mautic
 */

import { NextResponse } from 'next/server';
import { MauticProvider } from '@/providers/mautic';
import type { LeadInput } from '@/domain/models';

export const dynamic = 'force-dynamic';

export async function GET() {
  const debug: any = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  };

  try {
    // 1. Verifica configuração
    const configured = !!process.env.MAUTIC_BASE_URL;
    
    debug.mautic = {
      configured,
      baseUrl: process.env.MAUTIC_BASE_URL || 'não configurado',
      authType: process.env.MAUTIC_AUTH_TYPE || 'basic',
      username: process.env.MAUTIC_API_USERNAME ? '***' : 'não configurado',
      password: process.env.MAUTIC_API_PASSWORD ? '***' : 'não configurado',
      timeout: process.env.MAUTIC_TIMEOUT_MS || '30000',
    };

    if (!configured) {
      return NextResponse.json({
        success: false,
        message: 'Mautic não configurado. Adicione MAUTIC_BASE_URL ao .env.local',
        debug,
      }, { status: 400 });
    }

    // 2. Testa conexão (health check)
    const provider = new MauticProvider();
    const healthy = await provider.healthCheck();

    debug.health = {
      healthy,
      message: healthy ? 'Conexão OK' : 'Falha na conexão',
    };

    if (!healthy) {
      return NextResponse.json({
        success: false,
        message: 'Não foi possível conectar ao Mautic. Verifique credenciais e URL.',
        debug,
      }, { status: 503 });
    }

    // 3. Testa criação de contato
    const testLead: LeadInput = {
      name: `Teste Debug ${new Date().getTime()}`,
      email: `teste_${new Date().getTime()}@pharosnegocios.com.br`,
      phone: '(48) 99999-9999',
      message: 'Contato de teste criado via endpoint de debug',
      intent: 'info',
      source: 'other', // Debug endpoint
      metadata: {
        test: true,
        created_via: 'debug_endpoint',
      },
    };

    const leadResult = await provider.createLead(testLead);

    debug.test = {
      leadCreated: leadResult.success,
      leadId: leadResult.leadId,
      message: leadResult.message,
      errors: leadResult.errors,
    };

    // 4. Resultado final
    const allOk = configured && healthy && leadResult.success;

    return NextResponse.json({
      success: allOk,
      message: allOk 
        ? '✅ Integração Mautic funcionando perfeitamente!'
        : '⚠️ Há problemas na integração. Veja detalhes abaixo.',
      debug,
      recommendations: allOk ? [
        'Integração OK! Próximos passos:',
        '1. Configurar campos personalizados no Mautic (veja docs/MAUTIC-SETUP.md)',
        '2. Criar campanhas de boas-vindas',
        '3. Configurar segmentação automática',
        '4. Testar formulários em produção',
      ] : [
        'Problemas detectados:',
        !configured && 'Adicione MAUTIC_BASE_URL ao .env.local',
        !healthy && 'Verifique credenciais (username/password)',
        !leadResult.success && `Erro ao criar contato: ${leadResult.message}`,
      ].filter(Boolean),
    });

  } catch (error: any) {
    console.error('[Debug Mautic] Error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Erro ao testar integração Mautic',
      error: error.message,
      debug,
    }, { status: 500 });
  }
}

/**
 * POST - Teste customizado
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const provider = new MauticProvider();
    const result = await provider.createLead(body);
    
    return NextResponse.json({
      success: result.success,
      message: result.message,
      leadId: result.leadId,
      errors: result.errors,
    });
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: 'Erro ao processar requisição',
      error: error.message,
    }, { status: 400 });
  }
}

