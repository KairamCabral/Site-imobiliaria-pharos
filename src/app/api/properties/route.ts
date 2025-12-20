/**
 * API Route: /api/properties
 * 
 * Endpoint para listagem de imóveis
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPropertyService } from '@/services';
import { adaptPropertiesToImoveis, adaptPropertyToImovel } from '@/utils/propertyAdapter';
import type { PropertyFilters, Pagination } from '@/domain/models';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    
    // Log dos parâmetros recebidos
    if (process.env.NODE_ENV === 'development') {
      console.log('\n🔍 [API /properties] Parâmetros recebidos:');
      const params: Record<string, string[]> = {};
      searchParams.forEach((value, key) => {
        if (!params[key]) params[key] = [];
        params[key].push(value);
      });
      console.table(params);
    }
    
    // Parse filtros
    const filters: PropertyFilters = {};
    // Flags especiais
    if (searchParams.has('isExclusive')) {
      filters.isExclusive = ['1','true','sim','yes'].includes(String(searchParams.get('isExclusive')).toLowerCase());
    }
    if (searchParams.has('isLaunch')) {
      filters.isLaunch = ['1','true','sim','yes'].includes(String(searchParams.get('isLaunch')).toLowerCase());
    }
    if (searchParams.has('superHighlight')) {
      filters.superHighlight = ['1','true','sim','yes'].includes(String(searchParams.get('superHighlight')).toLowerCase());
    }
    
    // Cidade(s) - aceita slug ou nome
    if (searchParams.has('city')) {
      const RAW_TO_NAME: Record<string, string> = {
        'balneario camboriu': 'Balneário Camboriú',
        'balneario-camboriu': 'Balneário Camboriú',
        'itajai': 'Itajaí',
        'camboriu': 'Camboriú',
        'itapema': 'Itapema',
      };
      const normalizeCity = (v: string) => {
        const key = v.toLowerCase().replace(/[-_]/g, ' ').trim();
        return RAW_TO_NAME[key] || v;
      };
      const all = searchParams.getAll('city').map(normalizeCity);
      filters.city = all.length > 1 ? all : all[0];
    }

    if (searchParams.has('state')) {
      const states = searchParams
        .getAll('state')
        .flatMap(v => v.split(','))
        .map(v => v.trim().toUpperCase())
        .filter(Boolean);
      if (states.length === 1) {
        filters.state = states[0];
      } else if (states.length > 1) {
        filters.state = states;
      }
    }
    
    if (searchParams.has('neighborhood')) {
      // Suporta múltiplos: neighborhood=Centro&neighborhood=Barra%20Sul ou CSV
      const raw = searchParams.getAll('neighborhood');
      const parts = raw.flatMap(v => v.split(',')).map(s => s.trim()).filter(Boolean);
      filters.neighborhood = parts.length > 1 ? parts : parts[0];
    }
    
    if (searchParams.has('type')) {
      // Suporta múltiplos: type=apartamento&type=cobertura&type=diferenciado ou CSV
      const raw = searchParams.getAll('type');
      const types = raw
        .flatMap(v => v.split(','))
        .map(s => s.trim().toLowerCase())
        .filter(Boolean);

      // Enviar todos os tipos para o provider (incluindo 'diferenciado')
      if (types.length === 1) {
        filters.type = types[0] as any;
      } else if (types.length > 1) {
        filters.type = types as any;
      }
    }
    
    // Finalidade (venda/aluguel)
    if (searchParams.has('purpose')) {
      const p = (searchParams.get('purpose') || '').toLowerCase();
      filters.purpose = (p === 'aluguel' || p === 'venda') ? p as any : undefined;
    }
    
    // Status da Obra (lançamento, em construção, pronto, pré-lançamento)
    if (searchParams.has('status')) {
      const raw = searchParams.getAll('status');
      const statuses = raw
        .flatMap(v => v.split(','))
        .map(s => s.trim().toLowerCase())
        .filter(Boolean);

      const obraStatusAllow = new Set(['pre-lancamento', 'lancamento', 'construcao', 'pronto']);
      const obraStatuses = statuses.filter(status => obraStatusAllow.has(status));
      const generalStatuses = statuses.filter(status => !obraStatusAllow.has(status));

      if (obraStatuses.length === 1) {
        filters.obraStatus = obraStatuses[0] as any;
      } else if (obraStatuses.length > 1) {
        filters.obraStatus = obraStatuses as any;
      }

      if (generalStatuses.length === 1) {
        filters.status = generalStatuses[0] as any;
      } else if (generalStatuses.length > 1) {
        filters.status = generalStatuses as any;
      }
    }
    
    if (searchParams.has('minPrice')) {
      filters.minPrice = Number(searchParams.get('minPrice'));
    }
    
    if (searchParams.has('maxPrice')) {
      filters.maxPrice = Number(searchParams.get('maxPrice'));
    }
    
    if (searchParams.has('minBedrooms')) {
      filters.minBedrooms = Number(searchParams.get('minBedrooms'));
    }
    
    if (searchParams.has('minSuites')) {
      filters.minSuites = Number(searchParams.get('minSuites'));
    }
    
    if (searchParams.has('minBathrooms')) {
      filters.minBathrooms = Number(searchParams.get('minBathrooms'));
    }
    
    if (searchParams.has('minParkingSpots')) {
      filters.minParkingSpots = Number(searchParams.get('minParkingSpots'));
    }
    
    if (searchParams.has('minArea')) {
      filters.minArea = Number(searchParams.get('minArea'));
    }
    
    if (searchParams.has('maxArea')) {
      filters.maxArea = Number(searchParams.get('maxArea'));
    }

    // Dormitórios/Suítes/Vagas - exatos (1,2,3) e 4+
    const parseExactMulti = (name: string): number[] => {
      const vals = searchParams.getAll(name);
      return vals
        .flatMap(v => v.split(','))
        .map(v => v.trim())
        .filter(Boolean)
        .map(Number)
        .filter(n => !isNaN(n) && n >= 1 && n <= 3);
    };

    const parseFourPlus = (name: string): boolean => {
      const v = searchParams.get(name);
      return v === '1' || v === 'true' || v === 'sim';
    };

    const bedroomsExact = parseExactMulti('bedroomsExact');
    if (bedroomsExact.length > 0) {
      filters.bedroomsExact = bedroomsExact;
      console.log('%c[API /properties] 🛏️ QUARTOS EXATOS:', 'background: #00cc99; color: white; font-weight: bold; padding: 2px;', bedroomsExact);
    }
    if (parseFourPlus('bedroomsFourPlus')) {
      filters.bedroomsFourPlus = true;
      console.log('%c[API /properties] 🛏️ QUARTOS 4+:', 'background: #00cc99; color: white; font-weight: bold; padding: 2px;', 'SIM');
    }

    const suitesExact = parseExactMulti('suitesExact');
    if (suitesExact.length > 0) filters.suitesExact = suitesExact;
    if (parseFourPlus('suitesFourPlus')) filters.suitesFourPlus = true;

    const parkingExact = parseExactMulti('parkingExact');
    if (parkingExact.length > 0) filters.parkingExact = parkingExact;
    if (parseFourPlus('parkingFourPlus')) filters.parkingFourPlus = true;
    
    if (searchParams.has('sortBy')) {
      filters.sortBy = searchParams.get('sortBy') as any;
    }
    
    if (searchParams.has('sortOrder')) {
      filters.sortOrder = searchParams.get('sortOrder') as any;
    }

    if (searchParams.has('updatedSince')) {
      const date = new Date(String(searchParams.get('updatedSince')));
      if (!isNaN(date.getTime())) {
        filters.updatedSince = date;
      }
    }
    
    // Código do imóvel (busca exata)
    if (searchParams.has('codigo')) {
      const rawCodigo = searchParams.get('codigo') || '';
      const normalizedCodigo = rawCodigo.trim().toUpperCase();
      if (normalizedCodigo) {
        filters.propertyCode = normalizedCodigo;
      }
    }
    
    // Empreendimento (busca parcial)
    if (searchParams.has('empreendimento')) {
      filters.buildingName = searchParams.get('empreendimento')!;
    }
    
    // Características do imóvel
    if (searchParams.has('caracImovel')) {
      const values = searchParams.getAll('caracImovel');
      filters.caracteristicasImovel = values;
    }
    
    // Características da localização → traduz para Bairro/Distância quando aplicável
    if (searchParams.has('caracLocalizacao')) {
      const values = searchParams.getAll('caracLocalizacao');
      const bairrosReconhecidos = new Set([
        'Centro','Barra Sul','Barra Norte','Pioneiros','Nações','Praia Brava','Fazenda'
      ]);
      const bairrosSelecionados: string[] = [];
      values.forEach((v) => {
        const label = String(v).trim();
        if (bairrosReconhecidos.has(label)) {
          bairrosSelecionados.push(label);
          return;
        }
        // Itens como "Frente Mar" e "Quadra Mar" serão filtrados em memória
      });
      if (bairrosSelecionados.length > 0) {
        if (Array.isArray(filters.neighborhood)) {
          filters.neighborhood = [...filters.neighborhood, ...bairrosSelecionados];
        } else if (typeof filters.neighborhood === 'string') {
          filters.neighborhood = [filters.neighborhood, ...bairrosSelecionados];
        } else {
          filters.neighborhood = bairrosSelecionados.length > 1 ? bairrosSelecionados : bairrosSelecionados[0];
        }
      }
      // Ainda mantemos o array bruto para logs/debug se necessário
      filters.caracteristicasLocalizacao = values;
    }
    
    // Características do empreendimento
    if (searchParams.has('caracEmpreendimento')) {
      const values = searchParams.getAll('caracEmpreendimento');
      filters.caracteristicasEmpreendimento = values;
    }
    
    // Distância do mar (pegar primeiro valor se houver múltiplos)
    if (searchParams.has('distanciaMar')) {
      const values = searchParams.getAll('distanciaMar');
      if (values.length > 0) {
        filters.distanciaMarRange = values[0] as any;
      }
    }
    
    // Parse paginação
    const pagination: Pagination = {
      page: searchParams.has('page') ? Number(searchParams.get('page')) : 1,
      limit: searchParams.has('limit') ? Number(searchParams.get('limit')) : 20,
    };

    const MAX_LIMIT = 200;
    if (pagination.limit > MAX_LIMIT) {
      pagination.limit = MAX_LIMIT;
    }
    if (pagination.limit < 1) {
      pagination.limit = 1;
    }
    if (pagination.page < 1) {
      pagination.page = 1;
    }
    
    // Log dos filtros processados
    if (process.env.NODE_ENV === 'development') {
      console.log('\n✅ [API /properties] Filtros processados:');
      console.log('PropertyFilters:', JSON.stringify(filters, null, 2));
      console.log('Pagination:', pagination);
    }
    
    // Busca imóveis
    const propertyService = getPropertyService();
    const { result, cache } = await propertyService.searchProperties(filters, pagination);
    
    // Adapta para formato da UI
    const includeObraDebug = searchParams.has('debugObra');
    const obraStats = includeObraDebug
      ? result.properties.reduce<Record<string, number>>((acc, property) => {
          const status = (property as any).obraStatus || 'indefinido';
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {})
      : undefined;

    const imoveis = includeObraDebug
      ? result.properties.map(property => {
          const adapted = adaptPropertyToImovel(property);
          const raw = (property as any)?.providerData?.raw || {};
          return {
            ...adapted,
            _obraDebug: {
              statusObraRaw: raw.StatusObra,
              statusDaObra: raw.StatusDaObra,
              statusEmpreendimento: raw.StatusEmpreendimento,
              lancamentoRaw: raw.Lancamento,
              statusRaw: raw.Status,
              anoEntrega: raw.AnoEntrega,
              anoConstrucao: raw.AnoConstrucao,
              candidates: (property as any)?.providerData?.obraStatusCandidates,
              keysObra: Object.keys(raw).filter((key) => key.toLowerCase().includes('obra')),
              matchesConstr: Object.entries(raw)
                .filter(([_, value]) => typeof value === 'string' && value.toLowerCase().includes('constr'))
                .map(([key, value]) => ({ key, value })),
              rawStatusFields: Object.fromEntries(
                Object.entries(raw).filter(([key]) => key.toLowerCase().includes('status'))
              ),
            },
          };
        })
      : adaptPropertiesToImoveis(result.properties);

    const headers = new Headers();
    headers.set('x-cache-status', cache.hit ? 'HIT' : 'MISS');
    headers.set('x-cache-layer', cache.layer);
    headers.set('x-cache-ttl', cache.ttl.toString());
    headers.set('x-cache-expires', new Date(cache.expiresAt).toISOString());
    if (cache.fetchedAt) {
      headers.set('x-cache-fetched-at', new Date(cache.fetchedAt).toISOString());
    }
    headers.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
    headers.set('Vary', 'accept, accept-encoding');

    return NextResponse.json({
      success: true,
      data: imoveis,
      pagination: result.pagination,
      obraDebugStats: obraStats,
      meta: {
        cache: {
          status: cache.hit ? 'HIT' : 'MISS',
          layer: cache.layer,
          expiresAt: cache.expiresAt,
          ttl: cache.ttl,
          fetchedAt: cache.fetchedAt,
        },
      },
    }, { headers });
  } catch (error: any) {
    console.error('[API Error]:', error.message);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao buscar imóveis',
        message: error.message || 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}

