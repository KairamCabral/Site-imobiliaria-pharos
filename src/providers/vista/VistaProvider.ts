/**
 * Vista Provider
 * 
 * Implementação da interface IListingProvider para Vista CRM
 * 
 * IMPORTANTE - Status da Obra:
 * - Campo correto: "Situacao" (não StatusObra)
 * - Valores: "Pré-Lançamento", "Lançamento", "Em Construção", "Pronto"
 * - Confirmado pelo suporte Vista em 12/12/2024
 */

import type {
  Property,
  PropertyList,
  PropertyFilters,
  Pagination,
  Photo,
  LeadInput,
  LeadResult,
} from '@/domain/models';
import type {
  IListingProvider,
  ProviderCapabilities,
  ProviderError,
} from '@/domain/contracts';
import { getVistaClient } from './client';
import type {
  VistaListResponse,
  VistaImovel,
  VistaPesquisa,
  VistaEmpreendimentoListResponse,
  VistaEmpreendimento,
} from './types';
import { mapVistaToProperty, mapLeadToVista, mapVistaLeadResponse, mapVistaToEmpreendimento } from '@/mappers/vista';
import { toVistaType, toVistaPurpose, toVistaDate } from '@/mappers/normalizers';
import { mapUItoVista, logCaracteristicasMapping } from '@/mappers/normalizers/caracteristicas';
import { detailsCache, photosCache } from './cache';
import { monitorarQualidade } from '@/utils/monitorQualidade';
import { validarListaImoveis, exibirSumarioValidacao, exibirRelatorioValidacao } from '@/utils/validarDadosImovel';
import type { Empreendimento } from '@/types';

const normalizeText = (valor?: string | null) =>
  String(valor ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

export class VistaProvider implements IListingProvider {
  private client = getVistaClient();
  private static listarCamposCache: any | null = null;
  private static availableFieldsSet: Set<string> | null = null;
  private static normalizedFieldMap: Map<string, string> | null = null;
  private static blockedFields: Set<string> = new Set();
  private readonly MIN_GALLERY_PHOTOS = 3; // Exige pelo menos 3 fotos para considerar galeria completa
  private readonly MAX_HYDRATE_PROPERTIES = 18;

  private static setListarCamposCache(data: any): void {
    VistaProvider.listarCamposCache = data;
    VistaProvider.refreshFieldMetadataFromCache();
  }

  private static refreshFieldMetadataFromCache(): void {
    const cache = VistaProvider.listarCamposCache;
    if (!cache || typeof cache !== 'object') {
      VistaProvider.availableFieldsSet = null;
      VistaProvider.normalizedFieldMap = null;
      return;
    }

    const normalizedSet = new Set<string>();
    const normalizedMap = new Map<string, string>();

    Object.keys(cache).forEach((key) => {
      const normalized = VistaProvider.normalizeFieldKey(key);
      if (normalized) {
        normalizedSet.add(normalized);
        normalizedMap.set(normalized, key);
      }
    });

    VistaProvider.availableFieldsSet = normalizedSet;
    VistaProvider.normalizedFieldMap = normalizedMap;
  }

  private static normalizeFieldKey(field: string): string {
    return String(field ?? '').trim().toLowerCase();
  }

  private static blockVistaField(field: string): void {
    const normalized = VistaProvider.normalizeFieldKey(field);
    if (!normalized) {
      return;
    }

    const variants = new Set<string>([normalized]);
    const compact = normalized.replace(/\s+/g, '');
    if (compact && compact !== normalized) {
      variants.add(compact);
    }

    variants.forEach((key) => {
      if (!key || VistaProvider.blockedFields.has(key)) {
        return;
      }
      VistaProvider.blockedFields.add(key);
    });

    VistaProvider.availableFieldsSet?.delete(normalized);
    if (VistaProvider.normalizedFieldMap?.has(normalized)) {
      VistaProvider.normalizedFieldMap.delete(normalized);
    }
  }

  private static decodeVistaMessage(message: string): string {
    if (!message) return '';
    return message.replace(/\\u([0-9a-f]{4})/gi, (_, code) =>
      String.fromCharCode(parseInt(code, 16))
    );
  }

  private isFieldBlocked(field: string): boolean {
    const normalized = VistaProvider.normalizeFieldKey(field);
    if (!normalized) return false;
    if (VistaProvider.blockedFields.has(normalized)) {
      return true;
    }
    const compact = normalized.replace(/\s+/g, '');
    if (compact && VistaProvider.blockedFields.has(compact)) {
      return true;
    }
    return false;
  }

  private extractUnavailableFieldFromError(error: any): string | null {
    const raw = typeof error?.message === 'string' ? error.message : '';
    if (!raw) return null;
    const decoded = VistaProvider.decodeVistaMessage(raw);
    const match = decoded.match(/campo\s+([\w\s]+?)\s+n[aã]o\s+est[áa]\s+dispon/i);
    if (!match) return null;
    const candidate = match[1]?.replace(/[\[\]'"]/g, '').trim();
    if (!candidate) return null;
    return this.resolveVistaFieldName([candidate], { fallbackToFirst: true }) || candidate;
  }

  /**
   * Nome do provider
   */
  getName(): string {
    return 'Vista';
  }

  /**
   * Capacidades suportadas
   */
  getCapabilities(): ProviderCapabilities {
    return {
      supportsFiltering: true,
      supportsPagination: true,
      supportsDeltaSync: true,
      supportsSearch: true,
      supportsLeadCreation: true,
      supportsAppointmentScheduling: false,
      supportsWebhooks: false,
      supportsVideoCall: false,
      supportsVirtualTour: false,
      maxPageSize: 50,
      rateLimit: {
        requests: 100,
        period: 'minute',
      },
    };
  }

  /**
   * Lista imóveis com filtros e paginação
   */
  async listProperties(
    filters: PropertyFilters,
    pagination: Pagination
  ): Promise<PropertyList> {
    try {
      // Carrega campos disponíveis uma vez (para filtrar fields opcionais e evitar 400)
      if (!VistaProvider.listarCamposCache) {
        try {
          const camposResp = await this.client.get<any>('/imoveis/listarcampos');
          VistaProvider.setListarCamposCache(camposResp.data);
        } catch (e) {
          // Silenciar erro de listarcampos
        }
      }
      
      const requestedLimit = pagination.limit ?? 20;
      const VISTA_MAX_PER_PAGE = 50;
      
      // 🚀 PAGINAÇÃO PARALELA INTELIGENTE
      // Se solicitar mais que 50, divide em múltiplas requisições paralelas
      if (requestedLimit > VISTA_MAX_PER_PAGE && pagination.page === 1) {
        // Primeira requisição para descobrir o total real
        const firstPage = await this.listProperties(filters, { page: 1, limit: VISTA_MAX_PER_PAGE });
        const totalAvailable = firstPage.pagination.total;
        
        // Calcula quantas páginas são necessárias para pegar TODOS os imóveis disponíveis
        const totalPages = Math.ceil(totalAvailable / VISTA_MAX_PER_PAGE);
        
        // Se precisar de mais páginas, busca o restante em paralelo
        if (totalPages > 1) {
          const remainingPagePromises = Array.from({ length: totalPages - 1 }, (_, i) => 
            this.listProperties(filters, { page: i + 2, limit: VISTA_MAX_PER_PAGE })
          );
          
          const remainingResults = await Promise.all(remainingPagePromises);
          const allProperties = [
            ...firstPage.properties,
            ...remainingResults.flatMap(r => r.properties)
          ];
          
          return {
            properties: allProperties.slice(0, Math.min(requestedLimit, totalAvailable)),
            pagination: {
              page: 1,
              limit: requestedLimit,
              total: totalAvailable,
              totalPages: Math.ceil(totalAvailable / requestedLimit),
            },
          };
        } else {
          // Apenas 1 página necessária
          return firstPage;
        }
      }
      
      // Ajuste de paginação: para buscas por empreendimento, pedimos 50 itens por página para não criar lacunas
      const vistaPagination = filters.buildingName
        ? { ...pagination, limit: Math.max(requestedLimit, 50) }
        : { ...pagination, limit: requestedLimit };

      // Monta query do Vista
      const pesquisa = this.buildVistaPesquisa(filters, vistaPagination);

      // Faz requisição da listagem (agora COM fields completos!)
      const response = await this.client.get<VistaListResponse>('/imoveis/listar', {
        pesquisa,
        showtotal: 1, // Inclui total de registros
      });

      // Extrai imóveis básicos da resposta
      const basicProperties: VistaImovel[] = [];
      Object.keys(response.data).forEach((key: string) => {
        if (!['total', 'paginas', 'pagina', 'quantidade'].includes(key)) {
          const imovel = (response.data as any)[key] as VistaImovel;
          
          if (imovel && imovel.Codigo) {
            // Excluir cadastros de Empreendimento da listagem de imóveis
            const isEmpreendimento = (imovel as any).Categoria === 'Empreendimento';
            if (isEmpreendimento) {
              // Cadastros de empreendimento não devem aparecer como imóveis individuais
              return;
            }
            
            // Incluir por padrão; excluir apenas quando explicitamente marcado para NÃO exibir
            const exibirNoSite = this.parseBoolean((imovel as any).ExibirNoSite);
            const exibirSite = this.parseBoolean((imovel as any).ExibirSite);
            const exibirWeb = this.parseBoolean((imovel as any).ExibirWeb);
            const publicarSite = this.parseBoolean((imovel as any).PublicarSite);
            const anyFlagTrue = [exibirNoSite, exibirSite, exibirWeb, publicarSite].some(v => v === true);
            const anyFlagFalse = [exibirNoSite, exibirSite, exibirWeb, publicarSite].some(v => v === false);
            if (anyFlagFalse && !anyFlagTrue) {
              // explicitamente marcado para não exibir
            } else {
              basicProperties.push(imovel);
            }
          }
        }
      });


      // Mapear para modelo de domínio (agora dados JÁ vêm completos da listagem!)
      const properties: Property[] = [];
      basicProperties.forEach(imovel => {
        try {
          properties.push(mapVistaToProperty(imovel));
        } catch (error) {
          console.warn(`[VistaProvider] Erro ao mapear imóvel ${imovel.Codigo}:`, error);
        }
      });


      const applyPostFilters = (source: Property[]): Property[] => {
        const applyBoolean = (v: any | undefined) => v === true;
        let result = source.filter((p) => {
          if (filters.isExclusive !== undefined && applyBoolean(filters.isExclusive) && !applyBoolean(p.isExclusive)) return false;
          if (filters.isLaunch !== undefined && applyBoolean(filters.isLaunch) && !applyBoolean(p.isLaunch)) return false;
          if (filters.superHighlight !== undefined && applyBoolean(filters.superHighlight) && !applyBoolean(p.superHighlight)) return false;
          return true;
        });

        const initialCount = result.length;
        // ✅ Log silenciado para performance em desenvolvimento
        // if (process.env.NODE_ENV === 'development') {
        //   console.log('%c[VistaProvider] 🔄 Aplicando pós-filtros client-side:', ...)

        // ✅ MANTER: Distância do mar (Vista não tem campo nativo)
        if (filters.distanciaMarRange && result.length > 0) {
          const maxDistance = this.getMaxDistanceFromRange(filters.distanciaMarRange);
          const beforeCount = result.length;
          result = result.filter((p) => p.distanciaMar !== undefined && p.distanciaMar <= maxDistance);
          // ✅ Log silenciado para performance
          // if (process.env.NODE_ENV === 'development' && beforeCount !== result.length) {
          //   console.log(`  🌊 Distância do mar: ${beforeCount} → ${result.length}`);
        }

        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/a4fd5798-c3d5-4a5f-af3e-bda690d25fd1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'VistaProvider.ts:358',message:'Verificação filtros ANTES blocos',data:{caracteristicasImovel:filters.caracteristicasImovel,caracteristicasEmpreendimento:filters.caracteristicasEmpreendimento,caracteristicasLocalizacao:filters.caracteristicasLocalizacao,distanciaMarRange:filters.distanciaMarRange,todosFilters:Object.keys(filters)},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H6-H7-H8'})}).catch(()=>{});
        // #endregion
        
        // ✅ MANTER: Características de localização (não tem na API Vista)
        if (filters.caracteristicasLocalizacao && filters.caracteristicasLocalizacao.length > 0) {
          const normalize = (valor: string) => String(valor)
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, ' ')
            .trim();

          const filtrosNormalizados = filters.caracteristicasLocalizacao
            .map(item => normalize(item))
            .filter(Boolean);

          if (filtrosNormalizados.length > 0) {
            const before = result.length;
            result = result.filter((property) => {
              if (!Array.isArray(property.caracteristicasLocalizacao)) {
                return false;
              }

              const valores = property.caracteristicasLocalizacao
                .filter(Boolean)
                .map(label => normalize(label));

              if (valores.length === 0) {
                return false;
              }

              return filtrosNormalizados.every(filtro =>
                valores.some(valor => valor === filtro || valor.includes(filtro) || filtro.includes(valor))
              );
            });
            if (process.env.NODE_ENV === 'development' && before !== result.length) {
              console.log(`  📍 Localização: ${before} → ${result.length} (removidos: ${before - result.length})`);
          }
        }
        }

        // ✅ APLICAR: Características do Imóvel (Vista não aceita como filtro na API)
        if (filters.caracteristicasImovel && filters.caracteristicasImovel.length > 0) {
          const normalize = (valor: string) => String(valor)
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, ' ')
            .trim();

          const filtrosNormalizados = filters.caracteristicasImovel.map(item => normalize(item)).filter(Boolean);

          if (filtrosNormalizados.length > 0) {
          const before = result.length;
            result = result.filter((property) => {
              const caracteristicasImovel = property.caracteristicasImovel || [];
              const valores = caracteristicasImovel
                .filter(Boolean)
                .map(label => normalize(label));

              return filtrosNormalizados.every(filtro =>
                valores.some(valor => valor === filtro || valor.includes(filtro) || filtro.includes(valor))
              );
            });
            if (process.env.NODE_ENV === 'development' && before !== result.length) {
              console.log(`  🏠 Características Imóvel: ${before} → ${result.length} (removidos: ${before - result.length})`);
        }
          }
        }

        // ✅ APLICAR: Características do Empreendimento (Vista não aceita como filtro na API)
        if (filters.caracteristicasEmpreendimento && filters.caracteristicasEmpreendimento.length > 0) {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/a4fd5798-c3d5-4a5f-af3e-bda690d25fd1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'VistaProvider.ts:390',message:'Pós-filtro ENTRADA',data:{filtros:filters.caracteristicasEmpreendimento,totalImoveisAntes:result.length},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H1'})}).catch(()=>{});
          // #endregion
          
          const normalize = (valor: string) => String(valor)
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, ' ')
            .trim();

          const filtrosNormalizados = filters.caracteristicasEmpreendimento
            .map(item => normalize(item))
            .filter(Boolean);
          
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/a4fd5798-c3d5-4a5f-af3e-bda690d25fd1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'VistaProvider.ts:402',message:'Filtros normalizados',data:{filtrosNormalizados},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H5'})}).catch(()=>{});
          // #endregion

          if (filtrosNormalizados.length > 0) {
            const before = result.length;
            
            // #region agent log
            const primeiroImovel = result[0];
            if (primeiroImovel) {
              fetch('http://127.0.0.1:7242/ingest/a4fd5798-c3d5-4a5f-af3e-bda690d25fd1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'VistaProvider.ts:413',message:'Exemplo 1º imóvel ANTES filtro',data:{id:primeiroImovel.id,caracteristicasLocalizacao:primeiroImovel.caracteristicasLocalizacao,caracteristicasImovel:primeiroImovel.caracteristicasImovel},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H4'})}).catch(()=>{});
            }
            // #endregion
            
            result = result.filter((property) => {
              // ✅ CORREÇÃO: InfraEstrutura do Vista é mapeada para caracteristicasLocalizacao no Property!
              const caracteristicasEmpreendimento = property.caracteristicasLocalizacao || [];
              const valores = caracteristicasEmpreendimento
                .filter(Boolean)
                .map(label => normalize(label));

              // ✅ Match exato: cada filtro deve corresponder a pelo menos uma característica
              const passou = filtrosNormalizados.every(filtro => 
                valores.some(valor => valor === filtro)
              );
              
              // #region agent log
              if (result.indexOf(property) < 3) {
                fetch('http://127.0.0.1:7242/ingest/a4fd5798-c3d5-4a5f-af3e-bda690d25fd1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'VistaProvider.ts:432',message:'Teste filtro por imóvel',data:{id:property.id,caracteristicas:caracteristicasEmpreendimento,valoresNormalizados:valores,filtrosNormalizados,passou},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H3'})}).catch(()=>{});
              }
              // #endregion
              
              return passou;
            });
            
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/a4fd5798-c3d5-4a5f-af3e-bda690d25fd1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'VistaProvider.ts:442',message:'Pós-filtro SAÍDA',data:{antes:before,depois:result.length,removidos:before-result.length},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H3'})}).catch(()=>{});
            // #endregion
            
            if (process.env.NODE_ENV === 'development' && before !== result.length) {
              console.log(`  🏢 Características Empreendimento: ${before} → ${result.length} (removidos: ${before - result.length})`);
            }
          }
        }

        // ✅ Pós-filtros concluídos (obraStatus, status e buildingName são aplicados na API)
        if (process.env.NODE_ENV === 'development' && initialCount !== result.length) {
          console.log(`%c[VistaProvider] ✅ Pós-filtros concluídos: ${initialCount} → ${result.length}`, 'background: #9900cc; color: white; font-weight: bold; padding: 2px;', {
            'Removidos': initialCount - result.length
          });
        }

        return result;
      };


      let filtered = applyPostFilters(properties);

      const baseLimit = requestedLimit;
      const fetchLimit = (filters.buildingName || filters.propertyCode)
        ? Math.max(baseLimit, 200)
        : baseLimit;

      // Se precisamos varrer mais itens (ex: buildingName), fazemos paginação manual até atingir fetchLimit
      if (fetchLimit > 50 && properties.length < fetchLimit) {
        const pageSize = Math.min(50, fetchLimit); // VISTA cap 50
        const maxPages = Math.ceil((fetchLimit - properties.length) / pageSize) + 1;
        for (let p = 2; p <= maxPages; p++) {
          const pesquisaPage: any = this.buildVistaPesquisa(filters, { page: p, limit: pageSize });
          try {
            const respPage = await this.client.get<VistaListResponse>('/imoveis/listar', { pesquisa: pesquisaPage });
            let added = 0;

            Object.keys(respPage.data).forEach((key: string) => {
              if (!['total','paginas','pagina','quantidade'].includes(key)) {
                const imovel = (respPage.data as any)[key] as VistaImovel;
                if (imovel && imovel.Codigo) {
                  // Excluir cadastros de Empreendimento
                  const isEmpreendimento = (imovel as any).Categoria === 'Empreendimento';
                  if (isEmpreendimento) {
                    return;
                  }
                  
                  const exibirNoSite = this.parseBoolean((imovel as any).ExibirNoSite);
                  const exibirSite = this.parseBoolean((imovel as any).ExibirSite);
                  const exibirWeb = this.parseBoolean((imovel as any).ExibirWeb);
                  const publicarSite = this.parseBoolean((imovel as any).PublicarSite);
                  const anyFlagTrue = [exibirNoSite, exibirSite, exibirWeb, publicarSite].some(v => v === true);
                  const anyFlagFalse = [exibirNoSite, exibirSite, exibirWeb, publicarSite].some(v => v === false);
                  if (!(anyFlagFalse && !anyFlagTrue)) {
                    try {
                      properties.push(mapVistaToProperty(imovel));
                      added++;
                    } catch {}
                  }
                }
              }
            });

            if (added === 0) {
              // Nada retornado nesta página → encerramos para evitar chamadas desnecessárias
              break;
            }

            if (properties.length >= fetchLimit) break;
          } catch (e) {
            console.warn(`[VistaProvider] Falha ao agregar página ${p}:`, e instanceof Error ? e.message : e);
            break;
          }
        }
      }

      // Reaplicar pós-filtros depois de agregar novas páginas
      filtered = applyPostFilters(properties);

      // Seleciona propriedades finais (respeitando limite solicitado)
      const targetProperties = filtered.slice(0, baseLimit);

      // Enriquecimento rápido de fotos: busca galeria completa para itens com poucas imagens
      const propertiesToHydrate = targetProperties
        .filter((property) =>
        this.shouldHydratePropertyPhotos(property)
      )
        .slice(0, this.MAX_HYDRATE_PROPERTIES);

      if (propertiesToHydrate.length > 0) {
        const maxConcurrent = 6;
        for (let i = 0; i < propertiesToHydrate.length; i += maxConcurrent) {
          const batch = propertiesToHydrate.slice(i, i + maxConcurrent);
          const tasks = batch.map(async (property) => {
            try {
              const { photos: fetchedPhotos, source } = await this.getPropertyPhotos(property.id);

              if (Array.isArray(fetchedPhotos) && fetchedPhotos.length > 0) {
                const merged = this.mergePhotoGalleries(property.photos, fetchedPhotos);
                if (merged.length > 0) {
                  property.photos = merged;
                  property.photosSource = source;
                }
              }
            } catch (e) {
              // silencioso em produção (logs já existem em ambientes de debug)
            }
          });

          await Promise.allSettled(tasks);
        }
      }

      // Garante fallback e sinalização de galeria para todas as propriedades finais
      targetProperties.forEach((property) => {
        this.ensureFallbackPhoto(property);
        this.updateGalleryMetadata(property);
      });

      const finalList = targetProperties;

      // Extrai metadados de paginação.
      // Preferimos o total informado pela API (response.data.total) quando disponível,
      // para permitir infinite scroll correto, mesmo que a primeira chamada tenha limitado a 24/50 itens.
      // 
      // IMPORTANTE: Quando aplicamos pós-filtros client-side (ex: características),
      // o apiTotal NÃO reflete esses filtros. Nesses casos, usamos filtered.length.
      const apiTotal = typeof (response.data as any)?.total === 'number' ? (response.data as any).total : undefined;
      const hasPósFiltros = 
        (filters.caracteristicasImovel && filters.caracteristicasImovel.length > 0) ||
        (filters.caracteristicasEmpreendimento && filters.caracteristicasEmpreendimento.length > 0) ||
        (filters.caracteristicasLocalizacao && filters.caracteristicasLocalizacao.length > 0) ||
        !!filters.distanciaMarRange;
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/a4fd5798-c3d5-4a5f-af3e-bda690d25fd1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'VistaProvider.ts:580',message:'PRÉ-CÁLCULO total',data:{apiTotal,hasPósFiltros,filteredLength:filtered.length,propertiesLength:properties.length,page:vistaPagination.page},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H2A'})}).catch(()=>{});
      // #endregion
      
      // ESTRATÉGIA PARA TOTAL CORRETO COM PÓS-FILTROS:
      // Quando há pós-filtros client-side que a API Vista não suporta (ex: InfraEstrutura),
      // precisamos buscar TODAS as páginas e filtrar o conjunto completo para obter o total real.
      let finalTotal = apiTotal ?? filtered.length;
      
      if (hasPósFiltros && vistaPagination.page === 1) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/a4fd5798-c3d5-4a5f-af3e-bda690d25fd1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'VistaProvider.ts:593',message:'INÍCIO busca todas páginas para pós-filtro',data:{apiTotal,currentPage:vistaPagination.page},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H2B'})}).catch(()=>{});
        // #endregion
        
        try {
          // Busca todas as páginas para aplicar o pós-filtro completo
          const allProperties: Property[] = [...properties]; // Primeira página já temos
          const totalPages = apiTotal ? Math.ceil(apiTotal / (fetchLimit || 50)) : 1;
          
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/a4fd5798-c3d5-4a5f-af3e-bda690d25fd1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'VistaProvider.ts:604',message:'Calculando páginas totais',data:{totalPages,apiTotal,fetchLimit},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H2C'})}).catch(()=>{});
          // #endregion
          
          // Busca páginas restantes (se houver)
          if (totalPages > 1) {
            const client = this.client;
            const buildPesquisa = this.buildVistaPesquisa.bind(this);
            
            // ✅ CORREÇÃO: Busca sequencial ao invés de paralela para evitar timeout/sobrecarga
            const maxPages = Math.min(totalPages, 20); // Limita a 20 páginas (1000 imóveis)
            
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/a4fd5798-c3d5-4a5f-af3e-bda690d25fd1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'VistaProvider.ts:608',message:'INICIANDO busca sequencial',data:{maxPages,totalPages},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H2C1'})}).catch(()=>{});
            // #endregion
            
            for (let pageNum = 2; pageNum <= maxPages; pageNum++) {
              try {
                const pagePesquisa = buildPesquisa(filters, { page: pageNum, limit: fetchLimit || 50 });
                const pageResponse = await client.get<VistaListResponse>('/imoveis/listar', {
                  pesquisa: pagePesquisa,
                  showtotal: 1,
                });
                
                const pagePropertiesMapped: Property[] = [];
                Object.keys(pageResponse.data).forEach((key: string) => {
                  if (!['total', 'paginas', 'pagina', 'quantidade'].includes(key)) {
                    const imovel = (pageResponse.data as any)[key] as VistaImovel;
                    if (imovel && imovel.Codigo && (imovel as any).Categoria !== 'Empreendimento') {
                      try {
                        pagePropertiesMapped.push(mapVistaToProperty(imovel));
                      } catch (error) {
                        console.warn(`[VistaProvider] Erro ao mapear imóvel ${imovel.Codigo} na página ${pageNum}:`, error);
                      }
                    }
                  }
                });
                
                allProperties.push(...pagePropertiesMapped);
                
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/a4fd5798-c3d5-4a5f-af3e-bda690d25fd1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'VistaProvider.ts:635',message:`Página ${pageNum} carregada`,data:{página:pageNum,imóveisPágina:pagePropertiesMapped.length,totalAcumulado:allProperties.length},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H2C2'})}).catch(()=>{});
                // #endregion
              } catch (pageError) {
                console.warn(`[VistaProvider] Erro ao buscar página ${pageNum}:`, pageError);
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/a4fd5798-c3d5-4a5f-af3e-bda690d25fd1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'VistaProvider.ts:642',message:`ERRO página ${pageNum}`,data:{página:pageNum,erro:String(pageError)},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H2C3'})}).catch(()=>{});
                // #endregion
                // Continua mesmo se uma página falhar
              }
            }
            
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/a4fd5798-c3d5-4a5f-af3e-bda690d25fd1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'VistaProvider.ts:649',message:'APÓS buscar todas páginas',data:{totalPropriedades:allProperties.length,páginas:maxPages},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H2D'})}).catch(()=>{});
            // #endregion
          }
          
          // Aplica pós-filtro no conjunto completo
          const allFiltered = applyPostFilters(allProperties);
          finalTotal = allFiltered.length;
          
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/a4fd5798-c3d5-4a5f-af3e-bda690d25fd1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'VistaProvider.ts:632',message:'TOTAL FINAL após pós-filtro completo',data:{antes:allProperties.length,depois:allFiltered.length,finalTotal},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H2E-H4'})}).catch(()=>{});
          // #endregion
        } catch (error) {
          // Se falhar ao buscar todas as páginas, mantém o total da página atual
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/a4fd5798-c3d5-4a5f-af3e-bda690d25fd1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'VistaProvider.ts:639',message:'ERRO ao buscar todas páginas',data:{erro:String(error)},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H2F'})}).catch(()=>{});
          // #endregion
          finalTotal = filtered.length;
        }
      } else if (hasPósFiltros) {
        // Para páginas > 1, usamos o total calculado na primeira requisição
        // (idealmente armazenado em cache ou state)
        finalTotal = filtered.length;
      }
      const effectivePageSize =
        typeof requestedLimit === 'number' && requestedLimit > 0
          ? Math.min(requestedLimit, 50)
          : Math.min(fetchLimit || 50, 50);
      const finalTotalPages = finalTotal > 0 ? Math.max(1, Math.ceil(finalTotal / (effectivelyFinite(effectivePageSize)))) : 0;

      function effectivelyFinite(n: number): number {
        return n > 0 ? n : 1;
      }

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/a4fd5798-c3d5-4a5f-af3e-bda690d25fd1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'VistaProvider.ts:671',message:'RETURN listProperties',data:{propertiesCount:finalList.length,page:vistaPagination.page,limit:requestedLimit,total:finalTotal,totalPages:finalTotalPages,hasCaractEmpreendimento:!!(filters.caracteristicasEmpreendimento && filters.caracteristicasEmpreendimento.length>0)},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H4'})}).catch(()=>{});
      // #endregion

      return {
        properties: finalList,
        pagination: {
          page: vistaPagination.page,
          limit: requestedLimit,
          total: finalTotal,
          totalPages: finalTotalPages,
        },
      };
    } catch (error) {
      throw this.handleError('listProperties', error);
    }
  }

  /**
   * Obtém detalhes de um imóvel
   */
  async getPropertyDetails(id: string): Promise<Property> {
    try {
      // Tentar buscar do cache/método de enriquecimento
      const vistaData = await this.fetchPropertyDetails(id);
      
      if (!vistaData) {
        throw new Error(`Imóvel ${id} não encontrado`);
      }

      return mapVistaToProperty(vistaData);
    } catch (error) {
      throw this.handleError('getPropertyDetails', error);
    }
  }

  /**
   * Obtém fotos de um imóvel com múltiplos fallbacks
   * 
   * Tentativas em ordem:
   * 1. GET /imoveis/fotos (com código numérico e string)
   * 2. GET /imoveis/detalhes (procura array fotos)
   * 3. Fallback: FotoDestaque
   */
  async getPropertyPhotos(
    id: string
  ): Promise<{
    photos: Photo[];
    source: NonNullable<Property['photosSource']>;
  }> {
    const codigo = String(id);
    const codigoNumerico = codigo.replace(/[^0-9]/g, '');
    const debugVista = process.env.NEXT_PUBLIC_DEBUG_VISTA === '1';
    const useFotosEndpoint = process.env.NEXT_PUBLIC_VISTA_USE_FOTOS_ENDPOINT === '1';

    const cacheKeys = [codigo];
    if (codigoNumerico && codigoNumerico !== codigo) {
      cacheKeys.unshift(codigoNumerico);
    }

    const cacheTtl = 10 * 60 * 1000; // 10 minutos
    for (const key of cacheKeys) {
      const cached = photosCache.get<{
        photos: Photo[];
        source: NonNullable<Property['photosSource']>;
      }>(`photos:${key}`);
      if (cached && Array.isArray(cached.photos)) {
        return {
          photos: cached.photos.map(photo => ({ ...photo })),
          source: cached.source,
        };
      }
    }

    const persistCache = (
      photos: Photo[] | undefined,
      source: NonNullable<Property['photosSource']>
    ) => {
      if (!Array.isArray(photos) || photos.length === 0) {
        return;
      }

      const payload = {
        photos: photos.map(photo => ({ ...photo })),
        source,
      };
      cacheKeys.forEach(key => photosCache.set(`photos:${key}`, payload, cacheTtl));
    };

    // Tentativa 1 (opcional via flag): Endpoint /imoveis/fotos (POST com cadastro)
    if (useFotosEndpoint) {
      // Código como string
      try {
        if (debugVista) console.log(`[VistaProvider] Tentando buscar fotos via /imoveis/fotos (POST) para ${codigo}`);
        const response = await this.client.post<any>(
          '/imoveis/fotos',
          { imovel: codigo } // será enviado em cadastro=
        );
        if (response.data && response.data.fotos && Array.isArray(response.data.fotos) && response.data.fotos.length > 0) {
          if (debugVista) console.log(`[VistaProvider] ✅ Fotos encontradas via /imoveis/fotos: ${response.data.fotos.length} fotos`);
          const photos = this.normalizeVistaPhotos(response.data.fotos, undefined);
          persistCache(photos, 'vista-fotos');
          return { photos, source: 'vista-fotos' };
        }
      } catch (error) {
        if (debugVista) {
          const message = error instanceof Error ? error.message : String(error);
          console.log(`[VistaProvider] /imoveis/fotos falhou (string, POST):`, message);
        }
      }
      // Código numérico (se diferente)
      if (codigoNumerico && codigoNumerico !== codigo) {
        try {
          if (debugVista) console.log(`[VistaProvider] Tentando buscar fotos via /imoveis/fotos (POST) para ${codigoNumerico} (numérico)`);
          const response = await this.client.post<any>(
            '/imoveis/fotos',
            { imovel: codigoNumerico }
          );
          if (response.data && response.data.fotos && Array.isArray(response.data.fotos) && response.data.fotos.length > 0) {
            if (debugVista) console.log(`[VistaProvider] ✅ Fotos encontradas via /imoveis/fotos (numérico): ${response.data.fotos.length} fotos`);
            const photos = this.normalizeVistaPhotos(response.data.fotos, undefined);
            persistCache(photos, 'vista-fotos-numeric');
            return { photos, source: 'vista-fotos-numeric' };
          }
        } catch (error) {
          if (debugVista) {
            const message = error instanceof Error ? error.message : String(error);
            console.log(`[VistaProvider] /imoveis/fotos falhou (numérico, POST):`, message);
          }
        }
      }
    }

    // Tentativa 2 (PRIORITÁRIA): Endpoint /imoveis/detalhes com campo Foto estruturado
    // Conforme suporte Vista: usar {"Foto":["Foto","FotoPequena","Destaque"]} em /imoveis/detalhes
    try {
      if (debugVista) console.log(`[VistaProvider] 🎯 Tentando buscar fotos via /imoveis/detalhes (método oficial) para ${codigo}`);
      
      const vistaData = await this.fetchPropertyDetails(codigo);
      
      if (vistaData) {
        // Conforme email do suporte: o campo "Foto" retorna um array quando solicitado como {"Foto":["Foto","FotoPequena","Destaque"]}
        const fotosField = vistaData.Foto || vistaData.fotos || vistaData.Fotos || vistaData.galeria || vistaData.Galeria;
        
        let fotosArray: any[] = [];
        
        // Converter para array se necessário
        if (fotosField) {
          if (Array.isArray(fotosField)) {
            // Já é array (formato correto da API)
            fotosArray = fotosField;
            if (debugVista) console.log(`[VistaProvider] ✅ Campo Foto é array: ${fotosArray.length} itens`);
          } else if (typeof fotosField === 'object' && fotosField !== null) {
            // É um objeto com chaves numéricas: {'1': {...}, '2': {...}}
            // Converter para array usando Object.values()
            fotosArray = Object.values(fotosField);
            if (debugVista) console.log(`[VistaProvider] 📸 Campo Foto é objeto, convertendo para array: ${fotosArray.length} itens`);
          }
        } else {
          if (debugVista) console.log(`[VistaProvider] ⚠️ Campo Foto não encontrado em vistaData`);
        }
        
        if (fotosArray.length > 0) {
          if (debugVista) console.log(`[VistaProvider] ✅ ${fotosArray.length} fotos encontradas via /imoveis/detalhes (método oficial)`);
          
          const photos = this.normalizeVistaPhotos(fotosArray, vistaData.FotoDestaque);
          persistCache(photos, 'vista-detalhes');
          return {
            photos,
            source: 'vista-detalhes',
          };
        }
        
        // Se não tem array mas tem FotoDestaque, usa como fallback
        if (vistaData.FotoDestaque) {
          if (debugVista) console.log(`[VistaProvider] ⚠️  Usando fallback FotoDestaque via /imoveis/detalhes (array vazio)`);
          
          const photos = this.normalizeVistaPhotos([], vistaData.FotoDestaque);
          persistCache(photos, 'fallback-destaque-detalhes');
          return {
            photos,
            source: 'fallback-destaque-detalhes',
          };
        }
      }
    } catch (error) {
      if (debugVista) console.log(`[VistaProvider] /imoveis/detalhes falhou:`, error instanceof Error ? error.message : error);
    }

    // Fallback final: Retorna array vazio (será tratado no mapper com FotoDestaque)
    // NÃO persiste cache vazio para permitir nova tentativa na próxima requisição
    if (debugVista) console.log(`[VistaProvider] ⚠️ Nenhuma foto encontrada para ${codigo}, retornando array vazio sem cache`);
    return {
      photos: [],
      source: 'fallback-empty',
    };
  }

  /**
   * Normaliza array de fotos Vista
   * Extrai URLs, ordena por Ordem, remove duplicatas
   */
  private normalizeVistaPhotos(fotosArray: any[], fotoDestaque?: string): Photo[] {
    const photos: Photo[] = [];
    const sanitizePhotoUrl = this.sanitizePhotoUrl.bind(this);
    
    // Adiciona foto destaque primeiro se existir
    if (fotoDestaque) {
      const url = sanitizePhotoUrl(fotoDestaque);
      if (url) {
        photos.push({
          url,
          thumbnail: url,
          isHighlight: true,
          order: 0,
        });
      }
    }
    
    // Processa galeria
    if (fotosArray && Array.isArray(fotosArray)) {
      fotosArray.forEach((foto, index) => {
        // O Vista CRM retorna objetos com os campos: Foto, FotoPequena, Destaque, Ordem, Descricao
        // Tenta múltiplos campos para máxima compatibilidade
        const url = sanitizePhotoUrl(
          foto.Foto ||           // Campo principal (novo formato)
          foto.FotoGrande ||     // Fallback 1
          foto.FotoMedia ||      // Fallback 2
          foto.url ||            // Fallback 3
          foto.URL               // Fallback 4
        );
        
        if (!url) return;
        
        // Se for a mesma URL do destaque, pula
        if (fotoDestaque && url === sanitizePhotoUrl(fotoDestaque)) {
          return;
        }
        
        const thumbnail = sanitizePhotoUrl(foto.FotoPequena || foto.FotoMedia) || url;
        const order = foto.Ordem !== undefined ? Number(foto.Ordem) : index + 1;
        const isHighlight = this.parseBoolean(foto.Destaque);
        
        photos.push({
          url,
          thumbnail,
          title: foto.Titulo || undefined,
          description: foto.Descricao || undefined,
          order,
          isHighlight,
        });
      });
    }
    
    // Remove duplicatas baseado na URL
    const seen = new Set<string>();
    const unique = photos.filter(photo => {
      const normalized = photo.url.split('?')[0].toLowerCase();
      if (seen.has(normalized)) return false;
      seen.add(normalized);
      return true;
    });
    
    // Ordena por ordem
    unique.sort((a, b) => (a.order || 0) - (b.order || 0));
    
    return unique;
  }

  private shouldHydratePropertyPhotos(property: Property): boolean {
    const validCount = this.countValidPhotos(property);
    if (validCount === 0) return true;
    if (validCount < this.MIN_GALLERY_PHOTOS) return true;
    if (property.galleryMissing) return true;
    return false;
  }

  private mergePhotoGalleries(existing: Photo[] | undefined, incoming: Photo[] | undefined): Photo[] {
    const combined = [...(incoming ?? []), ...(existing ?? [])];
    const seen = new Set<string>();

    const sanitized = combined
      .filter((photo): photo is Photo => !!photo && typeof photo.url === 'string' && photo.url.trim() !== '')
      .map((photo) => ({
        ...photo,
        url: photo.url.trim(),
      }))
      .filter((photo) => {
        const key = photo.url.split('?')[0].toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

    sanitized.sort((a, b) => {
      if (a.isHighlight && !b.isHighlight) return -1;
      if (!a.isHighlight && b.isHighlight) return 1;
      return (a.order ?? 0) - (b.order ?? 0);
    });

    return sanitized;
  }

  private ensureFallbackPhoto(property: Property): void {
    if (this.countValidPhotos(property) > 0) {
      return;
    }

    const raw: any = property.providerData?.raw;
    const fallbackUrl: string | undefined = raw?.FotoDestaque || raw?.FotoCapa;

    if (typeof fallbackUrl === 'string') {
      const fallbackPhotos = this.normalizeVistaPhotos([], fallbackUrl);
      if (fallbackPhotos.length > 0) {
        property.photos = fallbackPhotos;
      }
    }
  }

  private updateGalleryMetadata(property: Property): void {
    const count = this.countValidPhotos(property);
    property.galleryMissing = count < this.MIN_GALLERY_PHOTOS;
  }

  private countValidPhotos(property: Property): number {
    if (!Array.isArray(property.photos)) {
      return 0;
    }

    return property.photos.filter((photo) => photo && typeof photo.url === 'string' && photo.url.trim() !== '').length;
  }

  private getAvailableVistaFields(): Set<string> | null {
    if (VistaProvider.availableFieldsSet) {
      return VistaProvider.availableFieldsSet;
    }

    if (VistaProvider.listarCamposCache) {
      VistaProvider.refreshFieldMetadataFromCache();
      return VistaProvider.availableFieldsSet;
    }

    return null;
  }

  private resolveVistaFieldName(
    candidates: Array<string | undefined | null>,
    options?: { fallbackToFirst?: boolean }
  ): string | null {
    const sanitized = candidates.filter(
      (candidate): candidate is string => typeof candidate === 'string' && candidate.trim().length > 0
    );

    if (sanitized.length === 0) {
      return null;
    }

    const map = VistaProvider.normalizedFieldMap;
    if (!map || map.size === 0) {
      return sanitized[0];
    }

    for (const candidate of sanitized) {
      const normalized = VistaProvider.normalizeFieldKey(candidate);
      const resolved = map.get(normalized);
      if (resolved && !this.isFieldBlocked(resolved)) {
        return resolved;
      }
    }

    if (options?.fallbackToFirst) {
      const fallback = sanitized.find((candidate) => !this.isFieldBlocked(candidate));
      if (fallback) {
        return fallback;
      }
    }

    return null;
  }

  /**
   * Sanitiza URL de foto (http → https, normaliza CDN)
   */
  private sanitizePhotoUrl(url: any): string | undefined {
    if (!url || typeof url !== 'string') return undefined;
    
    try {
      const trimmed = url.trim();
      if (!trimmed.startsWith('http')) return undefined;
      
      const parsed = new URL(trimmed);
      parsed.protocol = 'https:';
      
      // Normaliza domínio Vista
      const hostname = parsed.hostname.toLowerCase();
      if (hostname === 'www.vistasoft.com.br' || hostname === 'sandbox.vistahost.com.br') {
        return `https://cdn.vistahost.com.br${parsed.pathname}${parsed.search}`;
      }
      
      return parsed.toString();
    } catch {
      return undefined;
    }
  }

  /**
   * Parse booleano Vista
   */
  private parseBoolean(value: any): boolean | undefined {
    if (value === null || value === undefined || value === '') return undefined;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value > 0;
    
    const normalized = String(value).toLowerCase().trim();
    if (['sim', 's', 'true', '1'].includes(normalized)) return true;
    if (['não', 'nao', 'n', 'false', '0'].includes(normalized)) return false;
    
    return undefined;
  }

  private async enrichObraStatusFromDetails(properties: Property[]): Promise<void> {
    const candidates = properties
      .map((property, index) => ({ property, index }))
      .filter(({ property }) => {
        const raw = (property as any)?.providerData?.raw || {};
        const hasRawStatus = raw.Situacao || raw.StatusObra || raw.StatusDaObra || raw.StatusEmpreendimento;
        return !hasRawStatus;
      });

    if (candidates.length === 0) {
      return;
    }

    const maxConcurrent = 4;
    for (let i = 0; i < candidates.length; i += maxConcurrent) {
      const batch = candidates.slice(i, i + maxConcurrent);
      await Promise.allSettled(
        batch.map(async ({ property, index }) => {
          try {
            const vistaData = await this.fetchPropertyDetails(property.id);
            if (!vistaData) return;
            if (process.env.NODE_ENV === 'development') {
              const keys = Object.keys(vistaData).filter(key => key.toLowerCase().includes('obra'));
              console.log('[enrichObraStatusFromDetails] Keys obra para', property.code, keys, vistaData.Situacao, vistaData.StatusObra, vistaData.StatusDaObra, vistaData.StatusEmpreendimento);
            }
            const mapped = mapVistaToProperty(vistaData);
            properties[index] = mapped;
          } catch (error) {
            console.warn('[VistaProvider] Falha ao enriquecer status da obra para', property.code, error);
          }
        })
      );
    }
  }

  /**
   * Cria lead
   */
  async createLead(lead: LeadInput): Promise<LeadResult> {
    try {
      const vistaLead = mapLeadToVista(lead);

      const response = await this.client.post<any>('/clientes/enviarLeads', vistaLead);

      return mapVistaLeadResponse(response.data);
    } catch (error) {
      // Para leads, retorna erro estruturado ao invés de throw
      console.error('[VistaProvider] Error creating lead:', error);
      
      return {
        success: false,
        message: 'Erro ao enviar lead para Vista CRM',
        errors: [String(error)],
      };
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ healthy: boolean; message?: string }> {
    try {
      const healthy = await this.client.healthCheck();
      return {
        healthy,
        message: healthy ? 'Vista CRM online' : 'Vista CRM offline',
      };
    } catch (error) {
      return {
        healthy: false,
        message: `Vista CRM error: ${error}`,
      };
    }
  }

  /**
   * Monta query de pesquisa do Vista
   */
  private buildVistaPesquisa(filters: PropertyFilters, pagination: Pagination): VistaPesquisa {
    // Conforme documentação Vista: DEVE incluir fields para retornar dados completos
    // IMPORTANTE: Usando apenas campos disponíveis na conta (confirmados via teste)
    // Monta lista base de fields (somente strings no listar)
    let baseFields: string[] = [
        // === CAMPOS BÁSICOS (Confirmados) ===
        'Codigo', 'Categoria', 'TipoImovel', 'Finalidade', 'Status', 'Situacao', // ✅ Situacao = Status da Obra
        'Endereco', 'Numero', 'Complemento', 'Bairro', 'BairroComercial', 'Cidade', 'UF',
        'CEP', 'Latitude', 'Longitude',
        'ValorVenda', 'ValorLocacao', 'ValorCondominio',
        'ValorIptu', // ✅ Nome correto (I maiúsculo, ptu minúsculo)
        // ❌ REMOVIDOS: Banheiros, VagasGaragem, Andar, TotalAndares (não disponíveis nesta conta)
        'Dormitorios', 'Suites', 'Vagas',
        'AreaTotal', 'AreaPrivativa', 'AreaTerreno',
        
        // === FOTOS ===
        // NOTA: O array {"Foto":["Foto","FotoPequena","Destaque"]} só funciona em /imoveis/detalhes
        // No /imoveis/listar, só podemos usar FotoDestaque
        'FotoDestaque',
        
        // === TOUR VIRTUAL ===
        'Tour360', // Nome correto conforme /imoveis/listarcampos
        
        // === VÍDEOS ===
        'URLVideo', // URL simples de vídeo
        
        // === CORRETOR ===
        'CorretorNome', // Nome do corretor
        
        // === VISIBILIDADE ===
        'ExibirNoSite', // Verificar se deve exibir (variantes removidas por incompatibilidade nesta conta)
        
        'DataCadastro', 'DataAtualizacao',
        
        // === CARACTERÍSTICAS DO IMÓVEL ===
        // ⚠️ IMPORTANTE: Solicitar "Caracteristicas" retorna um OBJETO completo com todos os campos booleanos
        // Exemplo: { "Churrasqueira Carvao": "Sim", "Churrasqueira Gas": "Nao", "Mobiliado": "Sim", ... }
        'Caracteristicas',
        
        // === INFRAESTRUTURA DO CONDOMÍNIO ===
        'InfraEstrutura',
        
        // === OUTROS ===
        'TituloSite', 'DescricaoWeb',
        'Empreendimento',
        
        // === FLAGS DE DESTAQUE/PRIORIDADE === (somente os confirmados)
        'Exclusivo', 'Lancamento',
    ];

    // Acrescenta dinamicamente campos de destaque/visibilidade realmente disponíveis nesta conta (evita 400)
    if (VistaProvider.listarCamposCache && typeof VistaProvider.listarCamposCache === 'object') {
      const allKeys: string[] = Object.keys(VistaProvider.listarCamposCache);
      const dynamicFlagKeys = allKeys.filter(k => /super|destaque|exclusivo|exibir|placa/i.test(k));
      baseFields = baseFields.concat(dynamicFlagKeys);
      
      // Buscar campos relacionados a "status da obra"
      const statusObraKeys = allKeys.filter(k => /status.*obra|obra.*status|statusobra|statusdaobra/i.test(k));
      if (statusObraKeys.length > 0) {
        baseFields = baseFields.concat(statusObraKeys);
      }
      
      // DEBUG: Listar TODOS os campos disponíveis no Vista (apenas uma vez) - DESABILITADO para performance
      if (false && process.env.NODE_ENV === 'development' && !VistaProvider.listarCamposCache._logged) {
        console.group('%c[VistaProvider] 📋 TODOS os campos disponíveis no Vista CRM:', 'background: #6600cc; color: white; font-weight: bold; padding: 4px;');
        console.log('Total de campos:', allKeys.length);
        
        // Buscar campos que contenham "status", "obra", "construcao", "lancamento"
        const relevantKeys = allKeys.filter(k => 
          /status|obra|construcao|construção|lancamento|entrega|conclusao|conclusão|pronto|finaliza/i.test(k)
        );
        if (relevantKeys.length > 0) {
          console.log('%cCampos relacionados a Status/Obra/Lançamento:', 'color: #ff6600; font-weight: bold;', relevantKeys);
        }
        
        // Mostrar todos os campos (limitado aos primeiros 100 para não poluir)
        console.log('Primeiros 100 campos:', allKeys.slice(0, 100));
        console.groupEnd();
        VistaProvider.listarCamposCache._logged = true;
      }
    }

    // Acrescentar somente OPCIONAIS conforme listarcampos (não filtrar campos base!)
    let fieldsFiltrados: string[] = baseFields;
    if (VistaProvider.listarCamposCache && typeof VistaProvider.listarCamposCache === 'object') {
      const camposDisponiveis = new Set<string>(Object.keys(VistaProvider.listarCamposCache));
      const opcionais = Array.from(camposDisponiveis).filter(k => /super|destaque|exclusivo|exibir|placa/i.test(k));
      fieldsFiltrados = baseFields.concat(opcionais);
    }

    const pesquisa: VistaPesquisa = {
      fields: fieldsFiltrados,
      filter: {},
      paginacao: {
        pagina: pagination.page,
        quantidade: Math.min(pagination.limit, 50), // Máximo do Vista
      },
    };

    // Aplicar filtros
    // Cidade(s) - aceita único ou múltiplos
    // IMPORTANTE: quando filtrando por código, não restringir cidade para não bloquear resultados de outro município
    if (filters.city && !filters.propertyCode) {
      const cidades = Array.isArray(filters.city) ? filters.city : [filters.city];
      // Normalizar slug/variações para o formato com acento usado pelo Vista
      const normalize = (v: string) => {
        const raw = String(v).trim();
        const key = raw.toLowerCase().replace(/[-_]/g, ' ');
        const map: Record<string, string> = {
          'balneario camboriu': 'Balneário Camboriú',
          'itajai': 'Itajaí',
          'camboriu': 'Camboriú',
          'itapema': 'Itapema',
        };
        return map[key] || raw;
      };
      pesquisa.filter!.Cidade = cidades.map(normalize);
    }

    if (filters.state) {
      pesquisa.filter!.Estado = filters.state;
    }

    // Nesta conta específica, o filtro por Bairro no listar é inconsistente.
    // Não enviaremos mais para evitar 0 resultados indevidos. O front reforça o filtro client-side.

    // Tipo do imóvel - IMPORTANTE: Vista usa o campo "Categoria" para filtrar tipo
    if (filters.type) {
      const types = Array.isArray(filters.type) ? filters.type : [filters.type];
      const normalized = types.map(t => String(t).toLowerCase());
      
      // Vista aceita variantes no campo Categoria
      const VISTA_TYPE_VARIANTS: Record<string, string[]> = {
        'apartamento': ['Apartamento', 'A', 'U'],
        'cobertura': ['Cobertura', 'CO', 'Cob'],
        'diferenciado': ['Diferenciado', 'Dif', 'DIF', 'D'], // Variantes de Diferenciado
      };
      
      const variants: string[] = [];
      normalized.forEach((pharosType) => {
        const vistaVariants = VISTA_TYPE_VARIANTS[pharosType];
        if (vistaVariants) {
          vistaVariants.forEach(v => variants.push(v));
        } else {
          // Fallback: usar mapeamento padrão
          variants.push(toVistaType(pharosType as any) as any);
        }
      });
      
      if (variants.length > 0) {
        // Vista usa "Categoria" para filtrar tipo de imóvel (conforme documentação)
        pesquisa.filter!.Categoria = variants.length > 1 ? (variants as any) : (variants[0] as any);
      }
    }

    if (filters.purpose) {
      pesquisa.filter!.Finalidade = toVistaPurpose(filters.purpose);
    }

    // Status da Obra (usando campo Situacao - nome correto!)
    // Campo correto conforme confirmação do suporte Vista: "Situacao"
    // Valores: "Pré-Lançamento", "Lançamento", "Em Construção", "Pronto"
    const obraStatusFilters = filters.obraStatus
      ? (Array.isArray(filters.obraStatus) ? filters.obraStatus : [filters.obraStatus])
      : undefined;

    if (obraStatusFilters && obraStatusFilters.length > 0) {
      const normalized = obraStatusFilters.map(s => String(s).toLowerCase());
      
      // Mapeamento: nossos valores → valores do Vista
      const mapToVistaSituacao = (status: string): string => {
        const map: Record<string, string> = {
          'pre-lancamento': 'Pré-Lançamento',
          'lancamento': 'Lançamento',
          'construcao': 'Em Construção',
          'pronto': 'Pronto',
        };
        return map[status] || status;
      };
      
      const vistaSituacoes = normalized.map(mapToVistaSituacao);
      
      // Aplicar filtro na API Vista
      if (vistaSituacoes.length === 1) {
        pesquisa.filter!.Situacao = vistaSituacoes[0];
      } else if (vistaSituacoes.length > 1) {
        pesquisa.filter!.Situacao = vistaSituacoes; // Array para OR
      }
    }

    // Filtros de preço
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      const min = filters.minPrice || 0;
      const max = filters.maxPrice || 999999999;
      
      if (filters.purpose === 'aluguel') {
        pesquisa.filter!.ValorLocacao = [min, max];
      } else {
        pesquisa.filter!.ValorVenda = [min, max];
      }
    }

    // Filtros de especificações
    // EXATO para dormitórios quando for array de escolhas (1,2,3,4+)
    if (filters.bedroomsExact || filters.bedroomsFourPlus) {
      // Para múltiplas seleções, usar array direto no filter (OR implícito)
      // Exemplo: Dormitorios: [2, 3] → imóveis com 2 OU 3 quartos
      const valores: any[] = [];
      
      if (filters.bedroomsExact && filters.bedroomsExact.length > 0) {
        valores.push(...filters.bedroomsExact);
      }
      
      if (filters.bedroomsFourPlus) {
        // Para 4+, usar operador >=
        valores.push(['>=', 4]);
      }
      
      if (valores.length === 1 && !Array.isArray(valores[0])) {
        // Valor único: filtro simples
        pesquisa.filter!.Dormitorios = valores[0];
      } else if (valores.length > 1) {
        // Múltiplos valores: usar array (OR)
        pesquisa.filter!.Dormitorios = valores;
      } else if (valores.length === 1 && Array.isArray(valores[0])) {
        // Apenas operador >= para 4+
        pesquisa.filter!.Dormitorios = valores[0];
      }
    } else if (filters.minBedrooms !== undefined) {
      pesquisa.filter!.Dormitorios = ['>=', filters.minBedrooms];
    }

    if (filters.suitesExact || filters.suitesFourPlus) {
      const valores: any[] = [];
      
      if (filters.suitesExact && filters.suitesExact.length > 0) {
        valores.push(...filters.suitesExact);
      }
      
      if (filters.suitesFourPlus) {
        valores.push(['>=', 4]);
      }
      
      if (valores.length === 1 && !Array.isArray(valores[0])) {
        pesquisa.filter!.Suites = valores[0];
      } else if (valores.length > 1) {
        pesquisa.filter!.Suites = valores;
      } else if (valores.length === 1 && Array.isArray(valores[0])) {
        pesquisa.filter!.Suites = valores[0];
      }
    } else if (filters.minSuites !== undefined) {
      pesquisa.filter!.Suites = ['>=', filters.minSuites];
    }

    // ❌ REMOVIDO: Campo Banheiros não disponível nesta conta
    // if (filters.minBathrooms !== undefined) {
    //   pesquisa.filter!.Banheiros = ['>=', filters.minBathrooms];
    // }

    if (filters.parkingExact || filters.parkingFourPlus) {
      const valores: any[] = [];
      
      if (filters.parkingExact && filters.parkingExact.length > 0) {
        valores.push(...filters.parkingExact);
      }
      
      if (filters.parkingFourPlus) {
        valores.push(['>=', 4]);
      }
      
      if (valores.length === 1 && !Array.isArray(valores[0])) {
        pesquisa.filter!.Vagas = valores[0];
      } else if (valores.length > 1) {
        pesquisa.filter!.Vagas = valores;
      } else if (valores.length === 1 && Array.isArray(valores[0])) {
        pesquisa.filter!.Vagas = valores[0];
      }
    } else if (filters.minParkingSpots !== undefined) {
      pesquisa.filter!.Vagas = ['>=', filters.minParkingSpots];
    }

    if (filters.minArea !== undefined || filters.maxArea !== undefined) {
      const min = filters.minArea || 0;
      const max = filters.maxArea || 999999;
      pesquisa.filter!.AreaPrivativa = [min, max];
    }

    // Delta sync
    if (filters.updatedSince) {
      const dateStr = toVistaDate(filters.updatedSince);
      if (dateStr) {
        pesquisa.filter!.DataAtualizacao = ['>=', dateStr];
      }
    }

    // ==========================================
    // NOVOS FILTROS - Características e Código
    // ==========================================
    
    // Código do imóvel (busca exata)
    if (filters.propertyCode) {
      pesquisa.filter!.Codigo = filters.propertyCode;
      console.log(`[VistaProvider] Filtro por código: ${filters.propertyCode}`);
    }
    
    // Empreendimento - FILTRO DIRETO NA API PARA CORRESPONDÊNCIA EXATA
    if (filters.buildingName) {
      pesquisa.filter!.Empreendimento = filters.buildingName;
      console.log(`[VistaProvider] Filtro por empreendimento: "${filters.buildingName}"`);
    }
    
    // Características do imóvel - Aplicar filtro DIRETO na API Vista
    // Vista aceita filtros por campos booleanos usando formato: { NomeCampo: "Sim" }
    // Importante: "Rooftop" pode estar tanto em Características do Imóvel quanto do Empreendimento
    if (filters.caracteristicasImovel && filters.caracteristicasImovel.length > 0) {
      // Aplicar filtro de características do imóvel na API
      // Vista CRM: Também serão aplicadas como pós-filtro client-side
      logCaracteristicasMapping(filters.caracteristicasImovel, 'imovel');
      console.log(`%c[VistaProvider] 🏠 Características de imóvel serão aplicadas como pós-filtro`, 'background: #00cc00; color: white; font-weight: bold; padding: 2px;', filters.caracteristicasImovel);
    }
    
    // Características da localização
    if (filters.caracteristicasLocalizacao && filters.caracteristicasLocalizacao.length > 0) {
      console.log(`[VistaProvider] Recebi ${filters.caracteristicasLocalizacao.length} características de localização → pós-filtro em memória`);
      logCaracteristicasMapping(filters.caracteristicasLocalizacao, 'localizacao');
    }
    
    // Características do empreendimento
    // NOTA: Vista CRM não aceita InfraEstrutura como filtro no "filter"
    // Aplicamos pós-filtro client-side após receber os dados da API
    if (filters.caracteristicasEmpreendimento && filters.caracteristicasEmpreendimento.length > 0) {
      logCaracteristicasMapping(filters.caracteristicasEmpreendimento, 'empreendimento');
      console.log(`%c[VistaProvider] 🏢 Características de empreendimento serão aplicadas como pós-filtro`, 'background: #ff6600; color: white; font-weight: bold; padding: 2px;', filters.caracteristicasEmpreendimento);
    }
    
    // Distância do mar
    // NOTA: Vista não possui campo nativo de distância. Aplicamos no pós-processamento
    if (filters.distanciaMarRange) {
      console.log(`[VistaProvider] Filtro distância do mar: ${filters.distanciaMarRange} (aplicado no pós-processamento)`);
    }
    
    // Log da pesquisa final montada (opcional em dev)
    if (process.env.NODE_ENV === 'development' && process.env.DEBUG_FILTERS) {
      console.log('\n🔍 [VistaProvider] Pesquisa Vista montada:');
      console.log('Filter:', JSON.stringify(pesquisa.filter, null, 2));
    }

    // Filtros por flags especiais (aplicar como pós-filtro também, pois nem todas existem no listar)
    // Ex.: Exclusivo, Lançamento: manter como pós-filtro seguro

    // Ordenação
    pesquisa.order = {};
    
    switch (filters.sortBy) {
      case 'price':
        pesquisa.order.ValorVenda = filters.sortOrder || 'asc';
        break;
      case 'area':
        pesquisa.order.AreaPrivativa = filters.sortOrder || 'desc';
        break;
      case 'updatedAt':
        pesquisa.order.DataAtualizacao = filters.sortOrder || 'desc';
        break;
      case 'createdAt':
        pesquisa.order.DataCadastro = filters.sortOrder || 'desc';
        break;
      default:
        pesquisa.order.DataAtualizacao = 'desc';
    }

    return pesquisa;
  }

  /**
   * Parse resposta de listagem do Vista
   */
  private parseVistaListResponse(response: VistaListResponse): Property[] {
    const properties: Property[] = [];

    // Vista retorna objeto onde cada chave é o código do imóvel (string)
    Object.keys(response).forEach((key: string) => {
      // Ignora metadados (total, paginas, etc.)
      if (['total', 'paginas', 'pagina', 'quantidade'].includes(key)) {
        return;
      }

      const imovel = (response as any)[key] as VistaImovel;
      if (imovel && imovel.Codigo) {
        try {
          properties.push(mapVistaToProperty(imovel));
        } catch (error) {
          console.warn(`[VistaProvider] Erro ao mapear imóvel ${imovel.Codigo}:`, error);
        }
      }
    });

    return properties;
  }

  /**
   * Busca detalhes de um único imóvel (com cache)
   */
  private async fetchPropertyDetails(codigo: string): Promise<VistaImovel | null> {
    const debugVista = process.env.NEXT_PUBLIC_DEBUG_VISTA === '1';
    // Tentar cache primeiro
    const cacheKey = `details:${codigo}`;
    const cached = detailsCache.get<VistaImovel>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // Conforme documentação Vista: https://www.vistasoft.com.br/api/
      // O endpoint /imoveis/detalhes EXIGE o parâmetro 'pesquisa' com 'fields'.
      // Nem todas as contas possuem o campo ValorIPTU habilitado. Para evitar erro 400,
      // tentamos primeiro COM ValorIPTU e, em caso de falha, refazemos a requisição SEM o campo.
      type IptuMode = 'valorIptu' | 'iptu' | 'none';

      const customIptuField = process.env.VISTA_IPTU_FIELD && String(process.env.VISTA_IPTU_FIELD).trim();
      // Carrega listarcampos para coletar possíveis chaves dinâmicas de destaque/visibilidade
      if (!VistaProvider.listarCamposCache) {
        try {
          console.log('[VistaProvider] Carregando listarcampos antes de buscar detalhes...');
          const camposResp = await this.client.get<any>('/imoveis/listarcampos');
          VistaProvider.setListarCamposCache(camposResp.data);
          console.log('[VistaProvider] ✅ listarcampos carregado com sucesso');
        } catch (e) {
          console.warn('[VistaProvider] ⚠️ listarcampos falhou - campos opcionais serão IGNORADOS:', e instanceof Error ? e.message : e);
        }
      } else {
        if (debugVista) console.log('[VistaProvider] listarcampos já em cache');
      }

      const availableFields = this.getAvailableVistaFields();
      const isFieldAvailable = (field: string): boolean => {
        if (this.isFieldBlocked(field)) return false;
        if (!availableFields || !field) return true;
        const normalized = field.trim().toLowerCase();
        return availableFields.has(normalized);
      };
      const resolvedValorIptuField = this.resolveVistaFieldName(['ValorIptu', 'Valor IPTU', 'ValorIPTU']);
      const resolvedIptuField = this.resolveVistaFieldName(['IPTU', 'Iptu']);
      const resolvedCustomIptuField = customIptuField
        ? this.resolveVistaFieldName([customIptuField], { fallbackToFirst: true })
        : null;
      // Detecta suporte a campos IPTU no tenant para evitar 400
      const supportsValorIptu = !!resolvedValorIptuField;
      const supportsIptu = !!resolvedIptuField;
      const supportsCustomIptu = !!resolvedCustomIptuField;
      const dynamicFlagKeys: string[] = (VistaProvider.listarCamposCache && typeof VistaProvider.listarCamposCache === 'object')
        ? Object.keys(VistaProvider.listarCamposCache).filter((k: string) => /super|destaque|exclusivo|exibir|placa/i.test(k))
        : [];
      const buildBaseFields = (mode: IptuMode) => ([
        // Campos básicos
        'Codigo', 'Categoria', 'TipoImovel', 'Finalidade', 'Status',
        'Situacao', // ✅ Campo correto para Status da Obra
        
        // Endereço completo
        'Endereco', 'Numero', 'Complemento', 'Bairro', 'BairroComercial', 'Cidade', 'UF',
        'CEP', 'Latitude', 'Longitude',
        
        // Valores principais
        'ValorVenda', 'ValorLocacao', 'ValorCondominio',
        'ValorIptu', // ✅ Nome correto descoberto (I maiúsculo, ptu minúsculo)
        ...(mode === 'valorIptu' && resolvedValorIptuField ? [resolvedValorIptuField] : []),
        ...(mode === 'iptu' && resolvedIptuField ? [resolvedIptuField] : []),
        ...(resolvedCustomIptuField ? [resolvedCustomIptuField] : []),
        
        // Especificações completas
        'AreaTotal', 'AreaPrivativa', 'AreaTerreno',
        'Dormitorios', 'Suites', 'Vagas',
        
        // FOTOS - Array aninhado conforme documentação Vista
        { 'Foto': ['Foto', 'FotoPequena', 'Destaque'] },
        'FotoDestaque',
        
        // TOUR VIRTUAL - Nome correto conforme listarcampos
        'Tour360',
        
        // VÍDEOS - Dois formatos disponíveis
        'URLVideo', // URL simples
        { 'Video': ['Video', 'Descricao', 'DescricaoWeb', 'Destaque', 'ExibirNoSite', 'Tipo'] }, // Array aninhado
        
        // ANEXOS - Array aninhado (PDFs, plantas, documentos)
        { 'Anexo': ['Anexo', 'Arquivo', 'Descricao', 'ExibirNoSite', 'Data'] },
        
        // Descrições
        'TituloSite', 'DescricaoWeb',
        
        // Corretor - Array aninhado conforme documentação Vista
        { 'Corretor': ['Nome'] },
        
        // Características e Infraestrutura
        'Caracteristicas',
        'InfraEstrutura',

        // Flags de visibilidade e destaques
        'ExibirNoSite', 'Exclusivo', 'Lancamento',
        ...dynamicFlagKeys,

        // Outros
        'Empreendimento',
        'DataCadastro', 'DataAtualizacao'
      ]);
      
      // Campos adicionais de EMPREENDIMENTO (podem não existir em todas as contas)
      const empreendimentoFields = [
        'DescricaoEmpreendimento',
        'Construtora',
        'ImoveisPorAndar',
        // Infraestrutura (nomes comuns usados no Vista)
        'Academia', 'Piscina', 'PiscinaAquecida', 'SalaoFestas', 'Playground', 'Cinema',
        'Rooftop', 'SalaDeJogos', 'Sauna', 'Quadra', 'QuadraDeEsportes', 'QuadraDeTenis',
        'EspacoGourmet'
      ];

      let empreendimentoAvailabilityLogged = false;
      const resolveEmpreendimentoFields = (): string[] => {
        const resolved: string[] = [];
        const missing: string[] = [];

        empreendimentoFields.forEach((field) => {
          if (this.isFieldBlocked(field)) {
            return;
          }

          if (availableFields) {
            if (isFieldAvailable(field)) {
              const resolvedName = this.resolveVistaFieldName([field]);
              if (resolvedName && !this.isFieldBlocked(resolvedName)) {
                resolved.push(resolvedName);
              }
            } else {
              missing.push(field);
            }
          } else {
            const resolvedName = this.resolveVistaFieldName([field], { fallbackToFirst: true }) || field;
            if (resolvedName && !this.isFieldBlocked(resolvedName)) {
              resolved.push(resolvedName);
            }
          }
        });

        if (
          availableFields &&
          missing.length > 0 &&
          !empreendimentoAvailabilityLogged &&
          debugVista
        ) {
          console.log(`[VistaProvider] Campos de empreendimento ignorados (não disponíveis nesta conta): ${missing.join(', ')}`);
          empreendimentoAvailabilityLogged = true;
        }

        return resolved;
      };
      
      // Monta dois conjuntos: completo (com campos adicionais) e básico (compatibilidade)
      // Conta não disponibiliza campos de vídeo — removido para evitar 400
      const mediaFieldCandidates: string[] = [];

      const resolveMediaFields = (): string[] => {
        // IMPORTANTE: Campos de mídia são MUITO instáveis no Vista.
        // Só incluímos se:
        // 1. Temos listarcampos carregado (availableFields existe)
        // 2. O campo está confirmado como disponível
        // 3. O campo não está bloqueado
        if (!availableFields || availableFields.size === 0) {
          if (debugVista) console.log('[VistaProvider] Campos de mídia IGNORADOS: listarcampos não disponível (modo seguro)');
          return [];
        }

        const resolved = mediaFieldCandidates
          .map((field) => {
            if (!isFieldAvailable(field)) return null;
            const resolvedField = this.resolveVistaFieldName([field]) || field;
            if (this.isFieldBlocked(resolvedField)) {
              return null;
            }
            return resolvedField;
          })
          .filter((field): field is string => !!field);
        
        if (debugVista && resolved.length > 0) {
          console.log(`[VistaProvider] Campos de mídia INCLUÍDOS: ${resolved.join(', ')}`);
        }
        
        return resolved;
      };

      const buildFieldsSets = (mode: IptuMode) => {
        const base = buildBaseFields(mode);
        const mediaFields = resolveMediaFields();
        const empreendimentoFields = resolveEmpreendimentoFields();
        const full = base
          .concat(mediaFields as any)
          .concat(empreendimentoFields as any);
        
        if (debugVista) {
          console.log('[VistaProvider] Campos para detalhes:', {
            base: base.length,
            media: mediaFields.length,
            empreendimento: empreendimentoFields.length,
            total: full.length
          });
        }
        
        return [full, base];
      };

      const original = String(codigo).trim();
      const numerico = original.replace(/[^0-9]/g, '');
      const tentativas = (numerico && numerico !== original) ? [original, numerico] : [original];

      for (const code of tentativas) {
        // Tenta apenas os modos suportados pelo tenant para evitar 400 desnecessários
        const modesToTry: IptuMode[] = [];
        if (supportsValorIptu) modesToTry.push('valorIptu');
        if (supportsIptu || supportsCustomIptu) modesToTry.push('iptu');
        modesToTry.push('none');
        for (const mode of modesToTry) {
          try {
            let fieldSets = buildFieldsSets(mode);
            let response: any | null = null;
            let lastError: any = null;
            
            for (let i = 0; i < fieldSets.length; i++) {
              const pesquisa = { fields: fieldSets[i] } as any;
              try {
                if (debugVista) console.log(`[VistaProvider] Tentando detalhes para ${code} (iptuMode=${mode}, set=${i === 0 ? 'full' : 'basic'})`);
                response = await this.client.get<VistaImovel>('/imoveis/detalhes', { imovel: code, pesquisa });
                break;
              } catch (e) {
                lastError = e;
                const unavailableField = this.extractUnavailableFieldFromError(e);
                if (unavailableField) {
                  if (debugVista) {
                    console.warn(`[VistaProvider] Campo indisponível detectado (${unavailableField}). Removendo e tentando novamente.`);
                  }
                  VistaProvider.blockVistaField(unavailableField);
                  fieldSets = buildFieldsSets(mode);
                  i--; // repete o mesmo conjunto sem o campo inválido
                  continue;
                }
                if (debugVista) console.warn(`[VistaProvider] detalhes falhou com set ${i===0?'full':'basic'}:`, e instanceof Error ? e.message : e);
                continue; // tenta próximo set
              }
            }
            if (!response) throw lastError || new Error('Falha em todos os conjuntos de fields');

            if (debugVista) console.log(`[VistaProvider] ✓ Detalhes encontrados para ${code}:`, response.data?.Codigo);

            // Fallback extra: tentar obter IPTU via /imoveis/listar caso não tenha vindo
            const hasIptuField = (response.data as any)?.ValorIPTU !== undefined || (response.data as any)?.IPTU !== undefined || (customIptuField && (response.data as any)[customIptuField] !== undefined);
            if (!hasIptuField) {
              try {
                // Consultar listarcampos UMA vez e tentar identificar o campo correto de IPTU desta conta
                if (!VistaProvider.listarCamposCache) {
                  try {
                    const camposResp = await this.client.get<any>('/imoveis/listarcampos');
                    VistaProvider.setListarCamposCache(camposResp.data);
                    if (debugVista) console.log('[VistaProvider] listarcampos carregado');
                  } catch (e) {
                    if (debugVista) console.warn('[VistaProvider] listarcampos falhou:', e instanceof Error ? e.message : e);
                  }
                }
                const campos = VistaProvider.listarCamposCache;
                let iptuFieldName: string | undefined;
                if (campos && typeof campos === 'object') {
                  const allKeys: string[] = Object.keys(campos);
                  iptuFieldName = allKeys.find(k => k.toLowerCase().includes('iptu'));
                }

                const fieldsArr = ['Codigo'];
                const pushField = (field?: string | null) => {
                  if (!field) return;
                  if (!fieldsArr.includes(field)) {
                    fieldsArr.push(field);
                  }
                };
                pushField(resolvedValorIptuField);
                pushField(resolvedIptuField);
                pushField(iptuFieldName);
                pushField(resolvedCustomIptuField);
                const codigoNumericoFallback = String(code).replace(/[^0-9]/g, '');

                // 1ª tentativa: filtro pelo código como veio
                let item: any | undefined;
                try {
                  const pesquisaIptu: VistaPesquisa = { fields: fieldsArr, filter: { Codigo: code } } as any;
                  const listResp = await this.client.get<VistaListResponse>('/imoveis/listar', { pesquisa: pesquisaIptu });
                  const lista = listResp.data as any;
                  item = lista && typeof lista === 'object' ? Object.values(lista).find((v: any)=> v && typeof v === 'object') : undefined;
                } catch {}

                // 2ª tentativa: filtro pelo código numérico
                if (!item && codigoNumericoFallback && codigoNumericoFallback !== String(code)) {
                  try {
                    const pesquisaIptuNum: VistaPesquisa = { fields: fieldsArr, filter: { Codigo: codigoNumericoFallback } } as any;
                    const listRespNum = await this.client.get<VistaListResponse>('/imoveis/listar', { pesquisa: pesquisaIptuNum });
                    const listaNum = listRespNum.data as any;
                    item = listaNum && typeof listaNum === 'object' ? Object.values(listaNum).find((v: any)=> v && typeof v === 'object') : undefined;
                  } catch {}
                }
                if (item) {
                  if ((item as any).ValorIPTU !== undefined) {
                    (response.data as any).ValorIPTU = (item as any).ValorIPTU;
                  }
                  if ((item as any).IPTU !== undefined) {
                    (response.data as any).IPTU = (item as any).IPTU;
                  }
                  const resolvedKey = (iptuFieldName && (item as any)[iptuFieldName] !== undefined) ? iptuFieldName : (customIptuField && (item as any)[customIptuField] !== undefined) ? customIptuField : undefined;
                  if (resolvedKey) (response.data as any).ValorIPTU = (item as any)[resolvedKey];
                }
              } catch (e) {
                if (debugVista) console.warn(`[VistaProvider] Fallback listar para IPTU falhou:`, e instanceof Error ? e.message : e);
              }
            }

            // Cachear por 5 minutos (guardar tanto na chave específica quanto na original)
            detailsCache.set(`details:${code}`, response.data, 300000);
            detailsCache.set(cacheKey, response.data, 300000);

            return response.data;
          } catch (error: any) {
            const msg = String(error?.message || error || '');
            if (debugVista) console.warn(`[VistaProvider] Falha em detalhes ${code} (iptuMode=${mode}):`, msg);
            // Tenta próximo modo (de ValorIPTU → IPTU → none)
            continue;
          }
        }
      }

      if (debugVista) console.warn(`[VistaProvider] No details found for ${original} (tried original${numerico && numerico !== original ? ' and numeric' : ''}).`);
      return null;
    } catch (error) {
      if (debugVista) console.warn(`[VistaProvider] Failed to fetch details for ${codigo}:`, error);
      return null;
    }
  }

  /**
   * Enriquece lista de imóveis com detalhes completos
   * Busca em lotes para evitar timeout
   */
  private async enrichPropertiesWithDetails(
    basicProperties: VistaImovel[],
    maxConcurrent: number = 5
  ): Promise<VistaImovel[]> {
    console.log(`[VistaProvider] Enriching ${basicProperties.length} properties with details...`);
    
    const enriched: VistaImovel[] = [];
    
    // Processar em lotes
    for (let i = 0; i < basicProperties.length; i += maxConcurrent) {
      const batch = basicProperties.slice(i, i + maxConcurrent);
      
      console.log(`[VistaProvider] Processing batch ${Math.floor(i / maxConcurrent) + 1}/${Math.ceil(basicProperties.length / maxConcurrent)}`);
      
      const batchResults = await Promise.allSettled(
        batch.map(prop => this.fetchPropertyDetails(String(prop.Codigo)))
      );
      
      batchResults.forEach((result, idx) => {
        if (result.status === 'fulfilled' && result.value) {
          // Mesclar dados básicos com detalhes
          const merged = { ...batch[idx], ...result.value };
          console.log(`[VistaProvider] Merged ${batch[idx].Codigo}:`, {
            basic: { Codigo: batch[idx].Codigo },
            details: { 
              Codigo: result.value.Codigo,
              ValorVenda: result.value.ValorVenda,
              Dormitorios: result.value.Dormitorios
            },
            merged: {
              Codigo: merged.Codigo,
              ValorVenda: merged.ValorVenda,
              Dormitorios: merged.Dormitorios
            }
          });
          enriched.push(merged);
        } else {
          // Se falhar, usa dados básicos
          console.warn(`[VistaProvider] Failed to enrich ${batch[idx].Codigo}:`, result.status === 'rejected' ? result.reason : 'null value');
          enriched.push(batch[idx]);
        }
      });
    }
    
    console.log(`[VistaProvider] Enrichment complete: ${enriched.length} properties`);
    return enriched;
  }

  /**
   * Lista empreendimentos (módulo dedicado do Vista)
   */
  async listEmpreendimentos(
    options?: {
      search?: string;
      status?: string;
      sortBy?: 'price' | 'area' | 'updatedAt' | 'name';
      sortOrder?: 'asc' | 'desc';
      page?: number;
      limit?: number;
    },
    retry: number = 0,
  ): Promise<{ items: Empreendimento[]; total: number; paginas: number; pagina: number }> {
    const page = Math.max(1, options?.page || 1);
    const limit = Math.min(Math.max(1, options?.limit || 20), 50);
    const maxRetries = 3;

    const baseFields: (string | Record<string, any>)[] = [
      'Codigo',
      'NomeEmpreendimento',
      'Empreendimento',
      'Nome',
      'Titulo',
      'Status',
      'Situacao', // ✅ Campo correto para Status da Obra
      'StatusObra', // Fallback
      'StatusEmpreendimento',
      'Cidade',
      'Bairro',
      'Endereco',
      'Numero',
      'Complemento',
      'UF',
      'CEP',
      'Latitude',
      'Longitude',
      'Construtora',
      'Incorporadora',
      'Arquiteto',
      'DataLancamento',
      'PrevisaoEntrega',
      'DataEntrega',
      'DataCadastro',
      'DataAtualizacao',
      'ValorMinimo',
      'ValorMaximo',
      'Valor',
      'AreaPrivativa',
      'AreaPrivativaMin',
      'AreaPrivativaMax',
      'AreaTotal',
      'QtdUnidades',
      'UnidadesDisponiveis',
      'QtdTorres',
      'Andares',
      'UnidadesPorAndar',
      'Caracteristicas',
      'InfraEstrutura',
      'FotoDestaque',
      'FotoCapa',
      'Logo',
      'Videos',
      'TourVirtual',
      'Folder',
      { fotos: ['Foto', 'FotoGrande', 'FotoMedia', 'FotoPequena', 'Descricao', 'Titulo', 'Ordem', 'Destaque'] },
    ];

    const fields = baseFields.filter((field) => {
      if (typeof field === 'string') {
        return !this.isFieldBlocked(field);
      }
      const key = Object.keys(field)[0];
      return !this.isFieldBlocked(key);
    });

    const filter: Record<string, any> = {};
    if (options?.search) {
      const like = ['like', options.search];
      filter.NomeEmpreendimento = like;
      filter.Empreendimento = like;
    }
    if (options?.status) {
      const statusLike = ['like', options.status];
      filter.Situacao = statusLike; // ✅ Campo correto para Status da Obra
      filter.StatusEmpreendimento = statusLike;
    }

    const order: Record<string, 'asc' | 'desc'> = {};
    switch (options?.sortBy) {
      case 'price':
        order.ValorMinimo = options.sortOrder || 'asc';
        break;
      case 'area':
        order.AreaPrivativaMin = options.sortOrder || 'desc';
        break;
      case 'name':
        order.NomeEmpreendimento = options.sortOrder || 'asc';
        break;
      default:
        order.DataAtualizacao = options?.sortOrder || 'desc';
    }

    const pesquisa: VistaPesquisa = {
      fields,
      filter: Object.keys(filter).length ? filter : undefined,
      order,
      paginacao: {
        pagina: page,
        quantidade: limit,
      },
    };

    try {
      const response = await this.client.get<VistaEmpreendimentoListResponse>('/empreendimentos/listar', {
        pesquisa,
        showtotal: 1,
      });

      const items: VistaEmpreendimento[] = [];
      Object.keys(response.data).forEach((key) => {
        if (!['total', 'paginas', 'pagina', 'quantidade'].includes(key)) {
          const item = (response.data as any)[key] as VistaEmpreendimento;
          if (item) {
            items.push(item);
          }
        }
      });

      const mapped = items.map(mapVistaToEmpreendimento);

      return {
        items: mapped,
        total: response.data.total ?? mapped.length,
        paginas: response.data.paginas ?? 1,
        pagina: response.data.pagina ?? page,
      };
    } catch (error) {
      const unavailableField = this.extractUnavailableFieldFromError(error);
      if (unavailableField && retry < maxRetries) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`[VistaProvider] Campo indisponível em empreendimentos (${unavailableField}) → removendo e tentando novamente (${retry + 1}/${maxRetries})`);
        }
        VistaProvider.blockVistaField(unavailableField);
        return this.listEmpreendimentos(options, retry + 1);
      }
      throw this.handleError('listar empreendimentos', error);
    }
  }

  /**
   * Busca detalhes de um empreendimento
   */
  async fetchEmpreendimento(code: string | number) {
    const pesquisa: VistaPesquisa = {
      fields: [
        'Codigo',
        'NomeEmpreendimento',
        'Empreendimento',
        'Nome',
        'Titulo',
        'Descricao',
        'DescricaoEmpreendimento',
        'Observacao',
        'Status',
        'StatusObra',
        'StatusEmpreendimento',
        'Cidade',
        'Bairro',
        'Endereco',
        'Numero',
        'Complemento',
        'UF',
        'CEP',
        'Latitude',
        'Longitude',
        'Construtora',
        'Incorporadora',
        'Arquiteto',
        'DataLancamento',
        'PrevisaoEntrega',
        'DataEntrega',
        'DataCadastro',
        'DataAtualizacao',
        'ValorMinimo',
        'ValorMaximo',
        'Valor',
        'AreaPrivativa',
        'AreaPrivativaMin',
        'AreaPrivativaMax',
        'AreaTotal',
        'QtdUnidades',
        'UnidadesDisponiveis',
        'QtdTorres',
        'Andares',
        'UnidadesPorAndar',
        'Caracteristicas',
        'InfraEstrutura',
        'FotoDestaque',
        'FotoCapa',
        'Logo',
        'Videos',
        'TourVirtual',
        'Folder',
        { fotos: ['Foto', 'FotoGrande', 'FotoMedia', 'FotoPequena', 'Descricao', 'Titulo', 'Ordem', 'Destaque'] },
      ],
    };

    try {
      const response = await this.client.get<VistaEmpreendimento>('/empreendimentos/detalhes', {
        empreendimento: code,
        pesquisa,
      });
      return mapVistaToEmpreendimento(response.data);
    } catch (error) {
      throw this.handleError('detalhes empreendimento', error);
    }
  }

  /**
   * Busca empreendimento por slug (fazendo listagem e match)
   */
  async findEmpreendimentoBySlug(slug: string) {
    const list = await this.listEmpreendimentos({ page: 1, limit: 50 });
    const match = list.items.find((item: Empreendimento) => item.slug === slug);
    return match || null;
  }

  /**
   * Lista empreendimentos agrupando imóveis por campo Empreendimento
   * (Fallback quando endpoint /empreendimentos/listar não está disponível)
   */
  async listEmpreendimentosFromImoveis(options?: {
    search?: string;
    status?: string;
    sortBy?: 'price' | 'area' | 'updatedAt' | 'name';
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }): Promise<{ items: Empreendimento[]; total: number; pagina: number; paginas: number }> {
    try {
      const { properties } = await this.listProperties(
        { sortBy: 'updatedAt', sortOrder: 'desc' },
        { page: 1, limit: 500 }
      );

      const grupos = new Map<string, Property[]>();
      properties.forEach((property) => {
        const nome = property.buildingName || (property as any)?.providerData?.raw?.Empreendimento || (property as any)?.providerData?.raw?.NomeEmpreendimento;
        if (nome && typeof nome === 'string' && nome.trim()) {
          const key = nome.trim();
          if (!grupos.has(key)) {
            grupos.set(key, []);
          }
          grupos.get(key)!.push(property);
        }
      });

      const empreendimentos: Empreendimento[] = [];
      grupos.forEach((imoveis, nomeEmpreendimento) => {
        const precos = imoveis.map((p) => p.pricing.sale || 0).filter((v) => v > 0);
        const areas = imoveis.map((p) => p.specs.privateArea || p.specs.totalArea || 0).filter((v) => v > 0);
        
        const primeiroImovel = imoveis[0];
        const raw = (primeiroImovel as any)?.providerData?.raw || {};
        const slug = nomeEmpreendimento
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-');

        const emp: Empreendimento = {
          id: `emp-${slug}`,
          slug,
          nome: nomeEmpreendimento,
          descricao: raw.DescricaoEmpreendimento || raw.Observacao || `Empreendimento ${nomeEmpreendimento}`,
          descricaoCompleta: raw.DescricaoEmpreendimento || raw.Observacao || '',
          endereco: {
            rua: primeiroImovel.address.street || '',
            numero: primeiroImovel.address.number || '',
            complemento: primeiroImovel.address.complement || '',
            bairro: primeiroImovel.address.neighborhood || '',
            cidade: primeiroImovel.address.city,
            estado: primeiroImovel.address.state,
            cep: primeiroImovel.address.zipCode || '',
            coordenadas: primeiroImovel.address.coordinates as any,
          },
          construtora: raw.Construtora || 'Não informado',
          incorporadora: raw.Incorporadora,
          arquiteto: raw.Arquiteto,
          status: this.inferirStatusEmpreendimento(imoveis),
          dataLancamento: raw.DataLancamento || primeiroImovel.createdAt?.toISOString() || '',
          dataPrevisaoEntrega: raw.PrevisaoEntrega || raw.DataEntrega,
          tipoEmpreendimento: 'residencial',
          totalUnidades: imoveis.filter(p => {
            const raw = (p as any)?.providerData?.raw;
            return raw?.Categoria !== 'Empreendimento';
          }).length,
          unidadesDisponiveis: imoveis.filter((p) => {
            const raw = (p as any)?.providerData?.raw;
            return p.status === 'disponivel' && raw?.Categoria !== 'Empreendimento';
          }).length,
          totalTorres: raw.QtdTorres ? Number(raw.QtdTorres) : undefined,
          andaresPorTorre: raw.Andares ? Number(raw.Andares) : undefined,
          unidadesPorAndar: raw.UnidadesPorAndar ? Number(raw.UnidadesPorAndar) : undefined,
          diferenciais: [],
          areasComuns: [],
          lazer: [],
          seguranca: [],
          sustentabilidade: [],
          imagemCapa: primeiroImovel.photos[0]?.url || '',
          imagemDestaque: primeiroImovel.photos[1]?.url,
          galeria: primeiroImovel.photos.slice(0, 6).map((p) => p.url),
          videosYoutube: primeiroImovel.videos,
          tourVirtual: primeiroImovel.virtualTour,
          folderPdf: raw.Folder || raw.FolderPDF,
          plantas: [],
          precoDesde: precos.length > 0 ? Math.min(...precos) : undefined,
          precoAte: precos.length > 0 ? Math.max(...precos) : undefined,
          areaDesde: areas.length > 0 ? Math.min(...areas) : undefined,
          areaAte: areas.length > 0 ? Math.max(...areas) : undefined,
          metaTitle: nomeEmpreendimento,
          metaDescription: `Empreendimento ${nomeEmpreendimento} com ${imoveis.length} unidades disponíveis`,
          keywords: [nomeEmpreendimento, primeiroImovel.address.neighborhood, primeiroImovel.address.city].filter(Boolean) as string[],
          imoveisIds: imoveis.map((p) => p.id),
          visualizacoes: 0,
          createdAt: primeiroImovel.createdAt?.toISOString() || '',
          updatedAt: primeiroImovel.updatedAt?.toISOString() || '',
        };

        empreendimentos.push(emp);
      });

      let resultado = empreendimentos;

      if (options?.search) {
        const termo = options.search.toLowerCase();
        resultado = resultado.filter((e) =>
          e.nome.toLowerCase().includes(termo) ||
          e.endereco?.bairro?.toLowerCase().includes(termo) ||
          e.endereco?.cidade?.toLowerCase().includes(termo)
        );
      }

      if (options?.status) {
        resultado = resultado.filter((e) => e.status === options.status);
      }

      switch (options?.sortBy) {
        case 'price':
          resultado.sort((a, b) => {
            const valA = a.precoDesde || 0;
            const valB = b.precoDesde || 0;
            return options.sortOrder === 'desc' ? valB - valA : valA - valB;
          });
          break;
        case 'area':
          resultado.sort((a, b) => {
            const valA = a.areaDesde || 0;
            const valB = b.areaDesde || 0;
            return options.sortOrder === 'desc' ? valB - valA : valA - valB;
          });
          break;
        case 'name':
          resultado.sort((a, b) => {
            const cmp = a.nome.localeCompare(b.nome);
            return (options?.sortOrder === 'desc') ? -cmp : cmp;
          });
          break;
        default:
          resultado.sort((a, b) => {
            const dateA = new Date(a.updatedAt || 0).getTime();
            const dateB = new Date(b.updatedAt || 0).getTime();
            return (options?.sortOrder === 'asc') ? dateA - dateB : dateB - dateA;
          });
      }

      return {
        items: resultado,
        total: resultado.length,
        pagina: 1,
        paginas: 1,
      };
    } catch (error) {
      throw this.handleError('listar empreendimentos via imóveis', error);
    }
  }

  private inferirStatusEmpreendimento(imoveis: Property[]): Empreendimento['status'] {
    const statusCount = { lancamento: 0, construcao: 0, pronto: 0 };
    imoveis.forEach((p) => {
      const obra = p.obraStatus || '';
      if (p.isLaunch || obra === 'lancamento' || obra === 'pre-lancamento') {
        statusCount.lancamento++;
      } else if (obra === 'construcao' || obra.includes('constru')) {
        statusCount.construcao++;
      } else {
        statusCount.pronto++;
      }
    });

    if (statusCount.lancamento > imoveis.length / 2) return 'lancamento';
    if (statusCount.construcao > 0) return 'em-construcao';
    return 'pronto';
  }

  /**
   * Converte range de distância do mar em metros máximos
   */
  private getMaxDistanceFromRange(range: string): number {
    const distanceMap: Record<string, number> = {
      'frente-mar': 50,           // Frente mar: até 50m
      'quadra-mar': 100,          // Quadra mar: até 100m
      'segunda-quadra': 200,      // Segunda quadra: até 200m
      'terceira-quadra': 300,     // Terceira quadra: até 300m
      'ate-500m': 500,            // Até 500m
      'ate-1km': 1000,            // Até 1km
    };
    
    return distanceMap[range] || 1000; // Default: 1km
  }

  /**
   * Busca empreendimentos diretos (categoria "Empreendimento")
   * Combina com unidades agrupadas para dados completos
   */
  async listEmpreendimentosDiretos(options?: {
    search?: string;
    status?: string;
    sortBy?: 'price' | 'area' | 'updatedAt' | 'name';
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }): Promise<{ items: Empreendimento[]; total: number; pagina: number; paginas: number }> {
    const page = options?.page || 1;
    const limit = options?.limit || 50;

    // Campos específicos disponíveis para categoria "Empreendimento"
    const fields = [
      'Codigo', 'Referencia', 'TituloSite', 'Empreendimento', 'Categoria',
      'Status', 'Situacao', 'StatusObra', // ✅ Situacao = Status da Obra correto
      'Endereco', 'Numero', 'Complemento', 'Bairro', 'BairroComercial', 'Cidade', 'UF', 'CEP',
      'Latitude', 'Longitude',
      'Construtora', 'Incorporadora',
      'DataLancamento', 'DataEntrega', 'DataCadastro', 'DataAtualizacao',
      'DescricaoWeb', 'DescricaoEmpreendimento',
      'Caracteristicas', 'InfraEstrutura',
      'FotoDestaque',
    ].filter(f => !this.isFieldBlocked(f));

    const filter: any = {
      Categoria: 'Empreendimento', // Apenas cadastros diretos de empreendimento
    };

    if (options?.search) {
      filter.Empreendimento = options.search;
    }

    if (options?.status && options.status !== 'todos') {
      // Mapeamento para valores do Vista (Situacao)
      if (options.status === 'lancamento' || options.status === 'pre-lancamento') {
        filter.Situacao = 'Lançamento'; // ✅ Campo correto
      } else if (options.status === 'construcao' || options.status === 'em-construcao') {
        filter.Situacao = 'Em Construção'; // ✅ Campo correto
      } else if (options.status === 'pronto') {
        filter.Situacao = 'Pronto'; // ✅ Campo correto
      }
    }

    const order: any = {};
    switch (options?.sortBy) {
      case 'updatedAt':
        order.DataAtualizacao = options.sortOrder || 'desc';
        break;
      case 'name':
        order.Empreendimento = options.sortOrder || 'asc';
        break;
      default:
        order.DataAtualizacao = options?.sortOrder || 'desc';
    }

    const pesquisa: VistaPesquisa = {
      fields,
      filter: Object.keys(filter).length ? filter : undefined,
      order,
      paginacao: {
        pagina: page,
        quantidade: limit,
      },
    };

    try {
      const response = await this.client.get<any>('/imoveis/listar', {
        pesquisa,
        showtotal: 1,
      });

      const empreendimentos: Empreendimento[] = [];
      const keys = Object.keys(response.data);

      for (const key of keys) {
        if (['total', 'paginas', 'pagina', 'quantidade'].includes(key)) continue;

        const empData = response.data[key];
        if (!empData || empData.Categoria !== 'Empreendimento') continue;

        // Buscar unidades deste empreendimento para dados agregados
        const unidades = await this.listProperties(
          { buildingName: empData.Empreendimento },
          { page: 1, limit: 50 }
        );

        // Filtrar apenas unidades realmente disponíveis (não vendidas/alugadas)
        // E excluir o próprio cadastro do empreendimento
        const unidadesDisponiveis = unidades.properties.filter(p => {
          const raw = p.providerData?.raw;
          const vendido = raw?.Vendido === 'Sim' || raw?.Vendido === '1' || raw?.Vendido === 1 || raw?.Vendido === true;
          const indisponivel = raw?.Indisponivel === 'Sim' || raw?.Indisponivel === '1' || raw?.Indisponivel === 1 || raw?.Indisponivel === true;
          const isEmpreendimento = raw?.Categoria === 'Empreendimento';
          return !vendido && !indisponivel && !isEmpreendimento;
        });

        // Calcular dados agregados apenas das unidades disponíveis
        const valores = unidadesDisponiveis
          .map(p => {
            const raw = p.providerData?.raw;
            return parseFloat(raw?.ValorVenda || raw?.Valor || '0');
          })
          .filter(v => v > 0);
        const areas = unidadesDisponiveis
          .map(p => {
            const raw = p.providerData?.raw;
            return parseFloat(raw?.AreaPrivativa || raw?.AreaTotal || '0');
          })
          .filter(a => a > 0);

        const precoMin = valores.length > 0 ? Math.min(...valores) : null;
        const precoMax = valores.length > 0 ? Math.max(...valores) : null;
        const areaMin = areas.length > 0 ? Math.min(...areas) : null;
        const areaMax = areas.length > 0 ? Math.max(...areas) : null;

        // Coletar fotos apenas das unidades disponíveis para galeria
        const fotos = unidadesDisponiveis
          .flatMap(p => p.photos || [])
          .slice(0, 20); // Limitar a 20 fotos

        const slugify = (text: string) =>
          text
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-');

        empreendimentos.push({
          id: empData.Codigo,
          nome: empData.Empreendimento || empData.TituloSite,
          slug: slugify(empData.Empreendimento || empData.TituloSite || empData.Codigo),
          descricao: empData.DescricaoEmpreendimento || empData.DescricaoWeb || '',
          endereco: empData.Endereco ? {
            rua: empData.Endereco,
            numero: empData.Numero,
            complemento: empData.Complemento,
            bairro: empData.Bairro || empData.BairroComercial,
            cidade: empData.Cidade,
            estado: empData.UF,
            cep: empData.CEP,
            coordenadas: (empData.Latitude && empData.Longitude) ? {
              latitude: parseFloat(empData.Latitude),
              longitude: parseFloat(empData.Longitude),
            } : undefined,
          } : undefined,
          status: this.mapStatusObra(empData.StatusObra) || undefined,
          construtora: empData.Construtora,
          incorporadora: empData.Incorporadora,
          dataEntrega: empData.DataEntrega,
          dataLancamento: empData.DataLancamento,
          unidadesDisponiveis: unidadesDisponiveis.length,
          precoMinimo: precoMin ?? undefined,
          precoMaximo: precoMax ?? undefined,
          areaMinima: areaMin ?? undefined,
          areaMaxima: areaMax ?? undefined,
          caracteristicas: this.parseCaracteristicas(empData.Caracteristicas),
          infraestrutura: this.parseInfraestrutura(empData.InfraEstrutura),
          fotos: empData.FotoDestaque ? [{ url: empData.FotoDestaque, destaque: true }] : [],
          fotosUnidades: fotos,
          updatedAt: empData.DataAtualizacao || empData.DataCadastro,
          providerData: {
            provider: 'vista',
            originalId: empData.Codigo,
            raw: empData,
          },
        });
      }

      return {
        items: empreendimentos,
        total: response.data.total ?? empreendimentos.length,
        paginas: response.data.paginas ?? 1,
        pagina: response.data.pagina ?? page,
      };
    } catch (error) {
      throw this.handleError('listar empreendimentos diretos', error);
    }
  }

  private mapStatusObra(statusObra: string | undefined): 'pre-lancamento' | 'lancamento' | 'em-construcao' | 'pronto' | undefined {
    if (!statusObra) return undefined;
    const lower = statusObra.toLowerCase();
    if (lower.includes('lancamento')) return 'lancamento';
    if (lower.includes('construcao')) return 'em-construcao';
    if (lower.includes('pronto')) return 'pronto';
    return undefined;
  }

  private parseCaracteristicas(obj: any): string[] {
    if (!obj || typeof obj !== 'object') return [];
    return Object.keys(obj).filter(k => obj[k] === 'Sim' || obj[k] === '1' || obj[k] === 1 || obj[k] === true);
  }

  private parseInfraestrutura(obj: any): string[] {
    if (!obj || typeof obj !== 'object') return [];
    return Object.keys(obj).filter(k => obj[k] === 'Sim' || obj[k] === '1' || obj[k] === 1 || obj[k] === true);
  }

  /**
   * Trata erros e retorna ProviderError
   */
  private handleError(operation: string, error: any): Error {
    const message = error.message || 'Erro desconhecido';
    
    const providerError = new Error(`[Vista] ${operation}: ${message}`) as any;
    providerError.provider = 'vista';
    providerError.operation = operation;
    providerError.originalError = error;

    return providerError;
  }
}

