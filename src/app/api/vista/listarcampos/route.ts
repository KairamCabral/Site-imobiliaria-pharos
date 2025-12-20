import { NextResponse } from 'next/server';
import { getVistaClient } from '@/providers/vista/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const client = getVistaClient();
    const response = await client.get<any>('/imoveis/listarcampos');
    const data = response?.data || {};

    const keys = Object.keys(data).sort();
    const match = (pattern: RegExp) => keys.filter((key) => pattern.test(key));

    return NextResponse.json({
      success: true,
      total: keys.length,
      keys,
      highlights: {
        obra: match(/obra/i),
        construcao: match(/constr/i),
        lancamento: match(/lanc/i),
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: String(error?.message || error),
    }, { status: 500 });
  }
}
