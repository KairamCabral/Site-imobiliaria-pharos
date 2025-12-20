/**
 * API Route: /api/properties/[id]
 * 
 * Busca imóvel no Vista CRM + galeria completa
 * - Detalhes: via listagem
 * - Fotos: via /imoveis/fotos com código numérico
 * - CDN: https://cdn.vistahost.com.br/gabarito/vista.imobi/fotos/{CODIGO}/{ARQUIVO}.jpg
 * - Cache 30 min, logs detalhados
 */

import { NextResponse } from "next/server";
import { getPropertyService } from '@/services';
import { buscarEmpreendimentoPorId as buscarEmpreendimentoCompleto } from '@/data/empreendimentos';
import { buscarEmpreendimentoPorNome as mapEmpreendimentoPorNome } from '@/data/empreendimentosMapping';

export const dynamic = 'force-dynamic';
export const revalidate = 1800; // 30 minutos

const VISTA_BASE_URL = process.env.VISTA_BASE_URL || 'https://gabarito-rest.vistahost.com.br';
const VISTA_API_KEY = process.env.VISTA_API_KEY || '';
const VISTA_TENANT = 'gabarito'; // Extraído do base URL
const FOTOS_ENDPOINT_ENABLED = process.env.FOTOS_ENDPOINT_ENABLED === 'true';

type PropertyPhoto = {
  id: string;
  url: string;
  thumbnail?: string;
  isHighlight?: boolean;
  order: number;
  title?: string;
  description?: string;
};

/**
 * Remapeia URLs antigas do Vista para o CDN
 * Útil quando o Vista retorna URLs do tipo www.vistasoft.com.br/sandbox/...
 */
function toCDN(url: string, codigo: string): string {
  if (!url || url.includes('cdn.vistahost.com.br')) {
    return url; // Já é CDN ou vazio
  }
  
  try {
    // Extrair o nome do arquivo (basename)
    const basename = url.split('/').pop();
    if (!basename) return url;
    
    // Reconstruir URL no formato CDN
    return `https://cdn.vistahost.com.br/${VISTA_TENANT}/vista.imobi/fotos/${codigo}/${basename}`;
  } catch (error) {
    console.warn(`[toCDN] Falha ao remapear URL: ${url}`, error);
    return url; // Retorna original em caso de erro
  }
}

/**
 * Busca fotos do Vista usando código numérico
 * ⚠️ Requer FOTOS_ENDPOINT_ENABLED=true
 */
async function fetchVistaPhotos(codigoOriginal: string, codigoNumerico: string): Promise<PropertyPhoto[]> {
  // Se o endpoint não está habilitado, retornar vazio imediatamente
  if (!FOTOS_ENDPOINT_ENABLED) {
    console.log('[fetchVistaPhotos] Endpoint desabilitado (FOTOS_ENDPOINT_ENABLED=false). Pulando tentativa.');
    return [];
  }

  const tentativas = [
    { codigo: codigoNumerico, label: 'numérico' },
    { codigo: codigoOriginal, label: 'original' },
  ];

  for (const { codigo, label } of tentativas) {
    try {
      const url = `${VISTA_BASE_URL}/imoveis/fotos?key=${VISTA_API_KEY}&imovel=${encodeURIComponent(codigo)}`;
      
      console.log(`[fetchVistaPhotos] Tentando com código ${label}: ${codigo}`);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        next: { revalidate: 1800 },
      });

      if (!response.ok) {
        console.warn(`[fetchVistaPhotos] ${label} retornou ${response.status}`);
        continue;
      }

      const data = await response.json();
      const total = data.total || 0;
      
      console.log(`[fetchVistaPhotos] ${label} retornou ${total} fotos`);
      
      if (total === 0) continue;

      // Converter objeto numerado em array
      const photos: PropertyPhoto[] = [];
      
      Object.keys(data).forEach(key => {
        if (key === 'total' || !data[key] || typeof data[key] !== 'object') return;

        const foto = data[key];
        
        // Usar URLs do Vista (podem ser CDN ou vistasoft.com.br)
        let rawUrl = foto.FotoGrande || foto.Foto || foto.FotoMedia || '';
        if (!rawUrl) return;

        // Normalizar para HTTPS e remapear para CDN se necessário
        rawUrl = rawUrl.trim().replace(/^http:/i, 'https:');
        const urlFinal = toCDN(rawUrl, codigoNumerico);
        
        let rawThumb = foto.FotoPequena || foto.FotoMedia || foto.Foto || '';
        rawThumb = rawThumb.trim().replace(/^http:/i, 'https:');
        const thumbFinal = toCDN(rawThumb, codigoNumerico);

        photos.push({
          id: foto.Codigo?.toString() || key,
          url: urlFinal,
          thumbnail: thumbFinal,
          isHighlight: String(foto.Destaque || '').toLowerCase() === 'sim',
          order: Number(foto.Ordem) || parseInt(key) || 999,
          title: foto.Titulo?.trim() || '',
          description: foto.Descricao?.trim() || '',
        });
      });

      // Ordenar APENAS por Ordem (capa primeiro = ordem menor)
      photos.sort((a, b) => a.order - b.order);

      console.log(`[fetchVistaPhotos] ✓ ${photos.length} fotos processadas (código ${label}: ${codigo})`);
      return photos;

    } catch (error: any) {
      console.error(`[fetchVistaPhotos] Erro com ${label} (${codigo}):`, error.message);
      continue;
    }
  }

  console.warn(`[fetchVistaPhotos] Nenhuma foto encontrada para ${codigoOriginal}/${codigoNumerico}`);
  return [];
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();

  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { message: 'Imóvel não informado' },
        { status: 400 }
      );
    }

    const codigoOriginal = String(id).trim();
    const codigoNumerico = id.replace(/[^\d]/g, ''); // Extrair apenas números

    console.log(`[API /properties/${id}] ===== INÍCIO =====`);
    console.log(`[API /properties/${id}] Código: "${codigoOriginal}"`);

    // Buscar imóvel diretamente usando o service
    const propertyService = getPropertyService();
    const property = await propertyService.getPropertyById(id);

    // Validar se o imóvel foi encontrado com dados mínimos
    if (!property || !property.id || property.id === 'undefined' || !property.code || property.code === 'undefined') {
      console.warn(`[API /properties/${id}] ⚠️  Imóvel retornou dados inválidos ou vazios`);
      return NextResponse.json(
        { message: `Imóvel ${id} não encontrado no Vista CRM` },
        { status: 404 }
      );
    }

    console.log(`[API /properties/${id}] ✓ Imóvel encontrado: ${property.title} (${property.code})`);

    // Buscar GALERIA COMPLETA usando sistema de múltiplos fallbacks
    console.log(`[API /properties/${id}] Buscando galeria completa com fallbacks...`);
    
    let finalPhotos: any[] = [];
    let photosSource = 'none';
    
    // Tentativa 1: Endpoint /imoveis/fotos (se habilitado)
    if (FOTOS_ENDPOINT_ENABLED) {
      const vistaPhotos = await fetchVistaPhotos(codigoOriginal, codigoNumerico);
      
      if (vistaPhotos.length > 0) {
        finalPhotos = vistaPhotos.map(p => ({
          url: p.url,
          thumbnail: p.thumbnail || p.url,
          isHighlight: p.isHighlight,
          order: p.order,
          title: p.title,
          description: p.description,
        }));
        photosSource = 'vista-fotos';
        console.log(`[API /properties/${id}] ✓ Fotos via /imoveis/fotos: ${finalPhotos.length}`);
      }
    }
    
    // Tentativa 2: Usar getPropertyPhotos do Provider (com múltiplos fallbacks internos)
    if (finalPhotos.length === 0) {
      try {
        console.log(`[API /properties/${id}] Tentando via Provider.getPropertyPhotos...`);
        const providerResult: any = await propertyService.provider.getPropertyPhotos(id);
        
        // Provider retorna { photos, source }
        if (providerResult && typeof providerResult === 'object' && 'photos' in providerResult) {
          if (providerResult.photos && providerResult.photos.length > 0) {
            finalPhotos = providerResult.photos;
            photosSource = providerResult.source || 'vista-provider';
            console.log(`[API /properties/${id}] ✓ Fotos via Provider: ${finalPhotos.length} (source: ${providerResult.source})`);
          }
        }
      } catch (error) {
        console.warn(`[API /properties/${id}] Provider.getPropertyPhotos falhou:`, error);
      }
    }
    
    // Fallback 3: Usar fotos da listagem (FotoDestaque)
    if (finalPhotos.length === 0 && property.photos && property.photos.length > 0) {
      finalPhotos = property.photos;
      photosSource = 'fallback-listagem';
      console.log(`[API /properties/${id}] ⚠️  Usando fallback: fotos da listagem (${finalPhotos.length})`);
    }

    const photosMock = finalPhotos.length === 0;
    const galleryMissing = finalPhotos.length <= 1;

    // Enriquecer com dados de Empreendimento (quando possível)
    let buildingDetails: any = undefined;
    try {
      const raw: any = (property as any)?.providerData?.raw || {};
      const byId = property.buildingId ? buscarEmpreendimentoCompleto(property.buildingId) : undefined;
      if (byId) {
        buildingDetails = byId;
      } else if (property.buildingName) {
        const mapped = mapEmpreendimentoPorNome(property.buildingName);
        if (mapped?.id) {
          buildingDetails = buscarEmpreendimentoCompleto(mapped.id);
        }
      }

      // Mesclar informações vindas diretamente do Vista (caso existam)
      // Descrição do empreendimento: preferir campo dedicado; fallback: extrair de DescricaoWeb
      const extractDescricaoFromTexto = (texto: string): string | undefined => {
        if (!texto) return undefined;
        const t = String(texto);
        // recortes por cabeçalhos comuns
        const markerEmp = /(\n|\r|^)\s*O\s+EMPREENDIMENTO\s*(\n|\r)/i;
        const markerLazer = /(\n|\r)\s*(ÁREA|AREA)\s+DE\s+LAZER\s*(\n|\r)/i;
        const start = t.search(markerEmp);
        if (start === -1) return undefined;
        const after = t.slice(start).replace(markerEmp, '');
        const endIdx = after.search(markerLazer);
        const section = endIdx !== -1 ? after.slice(0, endIdx) : after.split(/\n{2,}/)[0] || after;
        const cleaned = section.replace(/\r/g, '').trim();
        return cleaned || undefined;
      };

      const vistaDescricao = String(raw.DescricaoEmpreendimento || '').trim() || extractDescricaoFromTexto(raw.DescricaoWeb || '');
      const vistaConstrutora = String(raw.Construtora || '').trim();
      const vistaImoveisPorAndar = raw.ImoveisPorAndar || raw.Imoveis_por_andar || raw.ImovelPorAndar;

      // Features/infraestrutura marcadas no Vista (preferir objeto InfraEstrutura)
      const featuresFromVista: string[] = [];
      const infraObj = raw.InfraEstrutura || raw.Infraestrutura || {};
      if (infraObj && typeof infraObj === 'object') {
        Object.keys(infraObj).forEach((key) => {
          const val = infraObj[key];
          const on = val === true || String(val).toLowerCase() === 'sim' || Number(val) > 0;
          if (!on) return;
          // Label humano com correções de acento mais comuns
          let label = key
            .replace(/De /g, 'de ')
            .replace(/Salao/gi, 'Salão')
            .replace(/Espaco/gi, 'Espaço')
            .replace(/Condominio/gi, 'Condomínio')
            .replace(/Quadra Tenis/gi, 'Quadra de Tênis')
            .replace(/Salao Festas/gi, 'Salão de Festas')
            .replace(/Salao Jogos/gi, 'Salão de Jogos')
            .replace(/Piscina Aquecida/gi, 'Piscina aquecida')
            .replace(/Sala Fitness/gi, 'Academia');
          // Normalizações simples de caixa
          label = label.replace(/\s+/g, ' ').trim();
          featuresFromVista.push(label);
        });
      }

      // Complementar com alguns booleans top-level (caso InfraEstrutura não esteja disponível)
      if (featuresFromVista.length === 0) {
        const fallbackKeys = ['Academia','Piscina','PiscinaAquecida','SalaoFestas','Playground','Cinema','Rooftop','SalaDeJogos','Sauna','Quadra','EspacoGourmet'];
        fallbackKeys.forEach((k) => {
          const v = raw[k] ?? raw[String(k).replace(/\s+/g, '')];
          if (v === true || String(v).toLowerCase() === 'sim' || Number(v) > 0) {
            featuresFromVista.push(k.replace(/Salao/gi,'Salão').replace(/Espaco/gi,'Espaço'));
          }
        });
      }

      // Tentar inferir "imóveis por andar" a partir de texto (ex.: "2 apartamentos por andar")
      let imoveisPorAndarParsed: number | undefined = undefined;
      try {
        const texto = [raw.DescricaoEmpreendimento, raw.DescricaoWeb, raw.Descricao].filter(Boolean).join('\n');
        const m1 = texto.match(/(\d+)\s+(apartamentos?|im[óo]veis?)\s+por\s+andar/iu);
        if (m1) {
          imoveisPorAndarParsed = Number(m1[1]);
        }
      } catch {}

      const merged: any = buildingDetails ? { ...buildingDetails } : { name: property.buildingName };
      if (vistaDescricao) merged.descricao = merged.descricao || vistaDescricao;
      if (vistaConstrutora) merged.construtora = merged.construtora || vistaConstrutora;
      if (vistaImoveisPorAndar) merged.imoveisPorAndar = Number(vistaImoveisPorAndar) || imoveisPorAndarParsed || undefined;
      if (!merged.imoveisPorAndar && imoveisPorAndarParsed) merged.imoveisPorAndar = imoveisPorAndarParsed;
      if (featuresFromVista.length > 0) merged.features = Array.from(new Set([...(merged.features || []), ...featuresFromVista]));
      buildingDetails = merged;
    } catch (e) {
      console.warn(`[API /properties/${id}] Falha ao resolver empreendimento:`, (e as any)?.message);
    }

    // Sugerir imóveis relacionados com ordenação inteligente
    let relatedProperties: any[] = [];
    try {
      const normalize = (value?: string | null): string => {
        if (!value) return '';
        return String(value)
          .normalize('NFD')
          .replace(/\p{Diacritic}/gu, '')
          .toLowerCase()
          .trim();
      };

      const toNumber = (value: any): number | undefined => {
        if (typeof value === 'number' && Number.isFinite(value)) return value;
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : undefined;
      };

      const computeRelativeDiff = (base?: number, candidate?: number): number => {
        if (typeof base !== 'number' || !Number.isFinite(base) || base <= 0) {
          return Number.MAX_SAFE_INTEGER;
        }
        if (typeof candidate !== 'number' || !Number.isFinite(candidate)) {
          return Number.MAX_SAFE_INTEGER;
        }
        return Math.abs(candidate - base) / Math.max(base, 1);
      };

      const computeAbsDiff = (base?: number, candidate?: number): number => {
        if (typeof base !== 'number' || !Number.isFinite(base)) {
          return Number.MAX_SAFE_INTEGER;
        }
        if (typeof candidate !== 'number' || !Number.isFinite(candidate)) {
          return Number.MAX_SAFE_INTEGER;
        }
        return Math.abs(candidate - base);
      };

      const baseNeighborhood = normalize(property.address?.neighborhood);
      const baseCity = normalize(property.address?.city);
      const baseBuilder = normalize(
        property.builderName ||
        (property.buildingDetails as any)?.construtora ||
        (property.providerData as any)?.raw?.Construtora
      );
      const baseBuildingId = property.buildingId ? String(property.buildingId) : undefined;
      const baseBuildingName = normalize(property.buildingName || (property.buildingDetails as any)?.name);
      const basePrice = toNumber(property.pricing?.sale);
      const baseArea = toNumber(property.specs?.privateArea);
      const baseSuites = toNumber(property.specs?.suites);
      const baseParking = toNumber(property.specs?.parkingSpots);

      const candidateMap = new Map<string, any>();
      const pushCandidates = (list: any[]) => {
        list.forEach((candidate: any) => {
          if (!candidate || candidate.id === property.id) return;
          if (candidate.showOnWebsite === false) return;
          if (!candidateMap.has(candidate.id)) {
            candidateMap.set(candidate.id, candidate);
          }
        });
      };

      const { result: baseResult } = await propertyService.searchProperties(
        {
          city: property.address?.city,
          neighborhood: property.address?.neighborhood,
          type: property.type as any,
          sortBy: 'updatedAt',
          sortOrder: 'desc',
        },
        { page: 1, limit: 80 }
      );
      pushCandidates(baseResult.properties);

      if (candidateMap.size < 8 && property.address?.city) {
        const { result: cityResult } = await propertyService.searchProperties(
          {
            city: property.address?.city,
            type: property.type as any,
            sortBy: 'updatedAt',
            sortOrder: 'desc',
          },
          { page: 1, limit: 80 }
        );
        pushCandidates(cityResult.properties);
      }

      if (candidateMap.size < 8) {
        const { result: typeResult } = await propertyService.searchProperties(
          {
            type: property.type as any,
            sortBy: 'updatedAt',
            sortOrder: 'desc',
          },
          { page: 1, limit: 80 }
        );
        pushCandidates(typeResult.properties);
      }

      const candidates = Array.from(candidateMap.values());

      const scored = candidates.map((candidate) => {
        const candidateNeighborhood = normalize(candidate.address?.neighborhood);
        const candidateCity = normalize(candidate.address?.city);
        const candidateBuilder = normalize(
          candidate.builderName ||
          (candidate.buildingDetails as any)?.construtora ||
          (candidate.providerData as any)?.raw?.Construtora
        );
        const candidateBuildingId = candidate.buildingId ? String(candidate.buildingId) : undefined;
        const candidateBuildingName = normalize(candidate.buildingName);

        const sameBuilding = Boolean(
          (baseBuildingId && candidateBuildingId && baseBuildingId === candidateBuildingId) ||
          (baseBuildingName && candidateBuildingName && baseBuildingName === candidateBuildingName)
        );
        const sameNeighborhood = Boolean(baseNeighborhood && candidateNeighborhood && baseNeighborhood === candidateNeighborhood);
        const sameCity = Boolean(baseCity && candidateCity && baseCity === candidateCity);
        const sameBuilder = Boolean(baseBuilder && candidateBuilder && baseBuilder === candidateBuilder);

        const candidatePrice = toNumber(candidate.pricing?.sale) || toNumber(candidate.pricing?.rent);
        const candidateArea = toNumber(candidate.specs?.privateArea) || toNumber(candidate.specs?.totalArea);
        const candidateSuites = toNumber(candidate.specs?.suites);
        const candidateParking = toNumber(candidate.specs?.parkingSpots);

        const priceDiff = computeRelativeDiff(basePrice, candidatePrice);
        const areaDiff = computeRelativeDiff(baseArea, candidateArea);
        const suitesDiff = computeAbsDiff(baseSuites, candidateSuites);
        const parkingDiff = computeAbsDiff(baseParking, candidateParking);

        const priceScore = priceDiff === Number.MAX_SAFE_INTEGER ? 0 : Math.max(0, 40 - priceDiff * 200);
        const areaScore = areaDiff === Number.MAX_SAFE_INTEGER ? 0 : Math.max(0, 25 - areaDiff * 150);
        const suitesScore = suitesDiff === Number.MAX_SAFE_INTEGER ? 0 : Math.max(0, 15 - suitesDiff * 7);
        const parkingScore = parkingDiff === Number.MAX_SAFE_INTEGER ? 0 : Math.max(0, 15 - parkingDiff * 7);

        let locationScore = 0;
        if (sameBuilding) locationScore += 120;
        if (sameNeighborhood) locationScore += 60;
        else if (!sameNeighborhood && sameCity) locationScore += 30;
        if (sameBuilder || sameBuilding) locationScore += 35;

        const totalScore = locationScore + priceScore + areaScore + suitesScore + parkingScore;
        const updatedValue = candidate.updatedAt ? new Date(candidate.updatedAt).getTime() : 0;

        return {
          candidate,
          score: totalScore,
          updatedValue,
          meta: {
            sameBuilding,
            sameNeighborhood,
            sameCity,
            sameBuilder,
            priceDiff,
            areaDiff,
            suitesDiff,
            parkingDiff,
            priceScore,
            areaScore,
            suitesScore,
            parkingScore,
          },
        };
      });

      scored.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return b.updatedValue - a.updatedValue;
      });

      const ranked = scored.filter(item => item.score > 0);
      const fallbackList = ranked.length > 0 ? ranked : scored;

      relatedProperties = fallbackList.slice(0, 12).map(({ candidate, score, meta }) => ({
        id: candidate.id,
        code: candidate.code,
        slug: candidate.slug || candidate.id,
        title: candidate.title,
        address: candidate.address,
        pricing: candidate.pricing,
        specs: candidate.specs,
        type: candidate.type,
        photos: candidate.photos?.slice(0, 3) || [],
        builderName: candidate.builderName,
        buildingName: candidate.buildingName,
        score,
        ...(process.env.NODE_ENV === 'development' ? { similarityMeta: meta } : {}),
      }));
    } catch (e) {
      console.warn(`[API /properties/${id}] Falha ao montar relacionados:`, (e as any)?.message);
    }

    const duration = Date.now() - startTime;
    console.log(`[API /properties/${id}] ✓ Concluído em ${duration}ms - ${finalPhotos.length} fotos (source: ${photosSource}, mock: ${photosMock})`);

    // Telemetria: registrar quando galeria está ausente/incompleta
    if (galleryMissing) {
      console.warn(`[TELEMETRY] photo_gallery_missing - Imóvel ${id} com apenas ${finalPhotos.length} foto(s) (source: ${photosSource})`);
    }

    // Montar resposta
    const response: any = {
      ...property,
      photos: finalPhotos, // Galeria completa do Vista
      photosMock, // Flag para o front exibir placeholder
      galleryMissing, // Flag para o front exibir CTA WhatsApp
      buildingDetails: buildingDetails ? {
        id: buildingDetails.id,
        name: buildingDetails.nome || property.buildingName,
        descricao: buildingDetails.descricao,
        construtora: buildingDetails.construtora,
        imoveisPorAndar: buildingDetails.imoveisPorAndar,
        features: buildingDetails.features,
        diferenciais: buildingDetails.diferenciais,
        areasComuns: buildingDetails.areasComuns,
        lazer: buildingDetails.lazer,
        imagemCapa: buildingDetails.imagemCapa,
        slug: buildingDetails.slug,
      } : (property.buildingName ? { name: property.buildingName } : undefined),
      relatedProperties,
      meta: {
        photoCount: finalPhotos.length,
        duration,
        codigoVista: property.code,
        codigoNumerico,
        photosSource,
        fotosEndpointEnabled: FOTOS_ENDPOINT_ENABLED,
      }
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 's-maxage=1800, stale-while-revalidate=60',
      },
    });

  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error('[API /properties] ===== ERRO =====');
    console.error('Nome:', error.name);
    console.error('Mensagem:', error.message);
    console.error('Duração:', duration + 'ms');

    const msg = String(error?.message || '');
    const isNotFound = msg.includes('não encontrado') || msg.includes('HTTP 404');
    const isAuth = msg.includes('HTTP 401') || msg.includes('HTTP 403');

    if (isNotFound) {
      return NextResponse.json(
        { message: 'Imóvel não encontrado' },
        { status: 404 }
      );
    }

    if (isAuth) {
      return NextResponse.json(
        { message: 'Falha de autenticação no Vista CRM', error: msg },
        { status: 502 }
      );
    }

    return NextResponse.json(
      {
        message: 'Erro ao buscar imóvel',
        error: msg || 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}
