/**
 * API Debug Vista
 */

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const steps: any[] = [];
  
  try {
    // Step 1: Importar config
    steps.push({ step: 1, name: 'Import config', status: 'starting' });
    const { VISTA_CONFIG } = await import('@/config/providers');
    steps.push({ step: 1, name: 'Import config', status: 'ok', config: { baseUrl: VISTA_CONFIG.baseUrl, hasKey: !!VISTA_CONFIG.apiKey } });
    
    // Step 2: Importar registry
    steps.push({ step: 2, name: 'Import registry', status: 'starting' });
    const { getListingProvider } = await import('@/providers/registry');
    steps.push({ step: 2, name: 'Import registry', status: 'ok' });
    
    // Step 3: Criar provider
    steps.push({ step: 3, name: 'Create provider', status: 'starting' });
    const provider = getListingProvider();
    steps.push({ step: 3, name: 'Create provider', status: 'ok', provider: provider.getName() });
    
    // Step 4: Test health
    steps.push({ step: 4, name: 'Health check', status: 'starting' });
    const health = await provider.healthCheck();
    steps.push({ step: 4, name: 'Health check', status: 'ok', health });
    
    // Step 5: List properties (limit 1)
    steps.push({ step: 5, name: 'List 1 property', status: 'starting' });
    const result = await provider.listProperties({}, { page: 1, limit: 1 });
    steps.push({ step: 5, name: 'List 1 property', status: 'ok', count: result.properties.length, pagination: result.pagination });
    
    // Step 6: Test adapter
    steps.push({ step: 6, name: 'Test adapter', status: 'starting' });
    const { adaptPropertiesToImoveis } = await import('@/utils/propertyAdapter');
    const adapted = adaptPropertiesToImoveis(result.properties);
    steps.push({ step: 6, name: 'Test adapter', status: 'ok', count: adapted.length });
    
    return NextResponse.json({
      success: true,
      message: 'Todos os passos funcionaram!',
      steps,
    });
  } catch (error: any) {
    steps.push({
      name: 'ERROR',
      status: 'failed',
      error: error.message,
      stack: error.stack
    });
    
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        steps,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}

