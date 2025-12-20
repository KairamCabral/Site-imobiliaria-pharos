/**
 * API Route de teste com dados mockados
 */

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Dados mockados simples
    const mockData = [
      {
        id: "1",
        codigo: "TEST-001",
        slug: "apartamento-teste",
        titulo: "Apartamento Teste",
        endereco: {
          rua: "Rua Teste",
          numero: "100",
          bairro: "Centro",
          cidade: "Balneário Camboriú",
          estado: "SC",
          cep: "88330-000"
        },
        preco: 1000000,
        quartos: 3,
        suites: 2,
        banheiros: 2,
        vagasGaragem: 2,
        areaTotal: 100,
        areaPrivativa: 90,
        galeria: ["https://via.placeholder.com/800x600"],
        tipo: "apartamento",
        finalidade: "venda",
        status: "disponivel",
        destaque: true,
        caracteristicas: ["Vista mar", "Mobiliado"],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    return NextResponse.json({
      success: true,
      data: mockData,
      pagination: {
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1
      }
    });
  } catch (error: any) {
    console.error('[API /properties-mock] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

