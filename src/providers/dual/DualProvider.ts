import type {
  IListingProvider,
  ProviderCapabilities,
} from '@/domain/contracts';
import type {
  Property,
  PropertyFilters,
  PropertyList,
  Pagination,
  Photo,
  LeadInput,
  LeadResult,
} from '@/domain/models';
import { DwvProvider } from '@/providers/dwv';
import { VistaProvider } from '@/providers/vista';
import { MauticProvider } from '@/providers/mautic';
import { getDataEnricher } from '@/services/DataEnricher';
import { getMauticTagService } from '@/services/MauticTagService';

export class DualProvider implements IListingProvider {
  private dwv = new DwvProvider();
  private vista = new VistaProvider();
  private mautic: MauticProvider | null = null;
  private enricher = getDataEnricher();
  private tagService = getMauticTagService();

  constructor() {
    // Inicializa Mautic se configurado
    if (process.env.MAUTIC_BASE_URL) {
      try {
        this.mautic = new MauticProvider();
        console.log('[DualProvider] Mautic integração ativada');
      } catch (error) {
        console.warn('[DualProvider] Mautic não disponível:', error);
      }
    } else {
      console.log('[DualProvider] Mautic não configurado (MAUTIC_BASE_URL ausente)');
    }
  }

  getName(): string {
    return 'Dual (DWV + Vista)';
  }

  getCapabilities(): ProviderCapabilities {
    const dwvCaps = this.dwv.getCapabilities();
    const vistaCaps = this.vista.getCapabilities();
    return {
      supportsFiltering: dwvCaps.supportsFiltering && vistaCaps.supportsFiltering,
      supportsPagination: true,
      supportsDeltaSync: dwvCaps.supportsDeltaSync || vistaCaps.supportsDeltaSync,
      supportsSearch: true,
      supportsLeadCreation: vistaCaps.supportsLeadCreation,
      supportsAppointmentScheduling: vistaCaps.supportsAppointmentScheduling,
      supportsWebhooks: dwvCaps.supportsWebhooks || vistaCaps.supportsWebhooks,
      supportsVideoCall: dwvCaps.supportsVideoCall || vistaCaps.supportsVideoCall,
      supportsVirtualTour: dwvCaps.supportsVirtualTour || vistaCaps.supportsVirtualTour,
      maxPageSize: Math.max(dwvCaps.maxPageSize, vistaCaps.maxPageSize),
      rateLimit: vistaCaps.rateLimit,
    };
  }

  async listProperties(filters: PropertyFilters, pagination: Pagination): Promise<PropertyList> {
    // 1. Se DWV está desabilitado por filtro ou contexto, tenta apenas Vista
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/a4fd5798-c3d5-4a5f-af3e-bda690d25fd1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DualProvider.ts:65',message:'DualProvider recebeu filters',data:{caracteristicasEmpreendimento:filters.caracteristicasEmpreendimento,caracteristicasImovel:filters.caracteristicasImovel,todosFilters:Object.keys(filters)},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H9'})}).catch(()=>{});
    // #endregion
    
    // IMPORTANTE: Sempre pula DWV quando filtros de características estão ativos
    // pois a API DWV não possui dados confiáveis de características
    const skipDwv = 
      filters.providersToUse?.includes('vista-only') ||
      (filters.caracteristicasImovel && filters.caracteristicasImovel.length > 0) ||
      (filters.caracteristicasLocalizacao && filters.caracteristicasLocalizacao.length > 0) ||
      (filters.caracteristicasEmpreendimento && filters.caracteristicasEmpreendimento.length > 0);
    
    try {
      // 2. Busca Vista PRIMEIRO (prioritário)
      const vistaResult = await this.vista.listProperties(filters, pagination);
      
      if (skipDwv) {
        return vistaResult;
      }
      
      // 3. Busca DWV como COMPLEMENTO (não prioritário)
      try {
        const dwvResult = await this.dwv.listProperties(filters, pagination);
        
        // 4. Combina resultados: Vista + DWV (sem duplicatas por código)
        const vistaIds = new Set(vistaResult.properties.map(p => p.code?.toUpperCase()));
        
        // Filtrar duplicatas E aplicar filtro de obraStatus (DWV não suporta na API)
        let dwvExtras = dwvResult.properties.filter(
          p => !vistaIds.has(p.code?.toUpperCase())
        );
        
        // Aplicar filtro de obraStatus se solicitado (DWV não filtra na API)
        if (filters.obraStatus) {
          const beforeObraFilter = dwvExtras.length;
          const requestedStatuses = Array.isArray(filters.obraStatus) 
            ? filters.obraStatus 
            : [filters.obraStatus];
          const normalized = requestedStatuses.map(s => String(s).toLowerCase());
          
          dwvExtras = dwvExtras.filter(property => {
            const obraStatus = property.obraStatus;
            
            // Se não tem obraStatus, considera "pronto" (padrão)
            if (!obraStatus) {
              return normalized.includes('pronto');
            }
            
            // Verifica se o status do imóvel está na lista solicitada
            return normalized.some(requestedStatus => {
              if (requestedStatus === 'pre-lancamento') {
                return obraStatus === 'pre-lancamento' || obraStatus === 'lancamento';
              }
              if (requestedStatus === 'lancamento') {
                return obraStatus === 'lancamento' || obraStatus === 'pre-lancamento';
              }
              return obraStatus === requestedStatus;
            });
          });
        }
        
        // FILTRO CLIENT-SIDE: Características do Imóvel (DWV não filtra na API)
        // NOTA: Este filtro NÃO deve ser executado pois skipDwv já filtra quando há caracteristicasImovel
        // Mantido apenas como fallback de segurança
        if (filters.caracteristicasImovel && filters.caracteristicasImovel.length > 0) {
          const normalize = (valor: string) => String(valor)
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, ' ')
            .trim();

          const filtrosNormalizados = filters.caracteristicasImovel
            .map(item => normalize(item))
            .filter(Boolean);

          if (filtrosNormalizados.length > 0) {
            const beforeCaracFilter = dwvExtras.length;
            
            dwvExtras = dwvExtras.filter((property) => {
              // Combinar características do imóvel E localização
              const caracteristicas = [
                ...(Array.isArray(property.caracteristicasImovel) ? property.caracteristicasImovel : []),
                ...(Array.isArray(property.caracteristicasLocalizacao) ? property.caracteristicasLocalizacao : []),
              ];

              if (caracteristicas.length === 0) {
                return false;
              }

              const valores = caracteristicas
                .filter(Boolean)
                .map(label => normalize(label));

              if (valores.length === 0) {
                return false;
              }

              // TODOS os filtros selecionados devem estar presentes (AND lógico)
              return filtrosNormalizados.every(filtro =>
                valores.some(valor => 
                  valor === filtro || 
                  valor.includes(filtro) || 
                  filtro.includes(valor)
                )
              );
            });
          }
        }
        
        // FILTRO CLIENT-SIDE: Características da Localização (DWV não filtra na API)
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
            const beforeLocFilter = dwvExtras.length;
            
            dwvExtras = dwvExtras.filter((property) => {
              if (!Array.isArray(property.caracteristicasLocalizacao)) {
                return false;
              }

              const valores = property.caracteristicasLocalizacao
                .filter(Boolean)
                .map(label => normalize(label));

              if (valores.length === 0) {
                return false;
              }

              // TODOS os filtros selecionados devem estar presentes
              return filtrosNormalizados.every(filtro =>
                valores.some(valor => 
                  valor === filtro || 
                  valor.includes(filtro) || 
                  filtro.includes(valor)
                )
              );
            });
          }
        }
        
        return {
          properties: [...vistaResult.properties, ...dwvExtras],
          pagination: {
            ...vistaResult.pagination,
            total: vistaResult.pagination.total + dwvExtras.length,
          },
        };
      } catch (error) {
        console.warn('[DualProvider] DWV indisponível, usando apenas Vista:', error);
        return vistaResult;
      }
    } catch (vistaError) {
      // Se Vista falhou, tenta apenas DWV
      console.warn('[DualProvider] Vista falhou, tentando apenas DWV:', vistaError);
      
      if (skipDwv) {
        // Se skipDwv estava ativo mas Vista falhou, retorna erro
        throw vistaError;
      }
      
      try {
        return await this.dwv.listProperties(filters, pagination);
      } catch (dwvError) {
        console.error('[DualProvider] Ambos providers falharam');
        // Retorna lista vazia ao invés de lançar erro
        return {
          properties: [],
          pagination: {
            page: pagination.page,
            limit: pagination.limit,
            total: 0,
            totalPages: 0,
          },
        };
      }
    }
  }

  async getPropertyDetails(id: string): Promise<Property> {
    try {
      return await this.dwv.getPropertyDetails(id);
    } catch {
      return this.vista.getPropertyDetails(id);
    }
  }

  async getPropertyPhotos(id: string): Promise<Photo[] | { photos: Photo[]; source: string }> {
    try {
      return await this.dwv.getPropertyPhotos(id);
    } catch {
      return this.vista.getPropertyPhotos(id);
    }
  }

  async createLead(payload: LeadInput): Promise<LeadResult> {
    // Enriquece dados do lead
    const enrichedLead = this.enricher.enrichLead(payload);

    // Se há propertyCode, busca detalhes do imóvel para enriquecer ainda mais
    if (enrichedLead.propertyCode) {
      try {
        const property = await this.getPropertyDetails(enrichedLead.propertyCode);
        if (property) {
          await this.enricher.enrichWithPropertyData(enrichedLead, {
            codigo: property.code,
            titulo: property.title,
            preco: property.pricing?.sale || property.pricing?.rent || 0,
            quartos: property.specs?.bedrooms || 0,
            area: property.specs?.totalArea || property.specs?.area || 0,
            tipo: property.type,
            url: enrichedLead.metadata?.imovel_url,
          });
        }
      } catch (error) {
        console.warn('[DualProvider] Não foi possível enriquecer com dados do imóvel:', error);
      }
    }

    // Envia para Vista/DWV E Mautic simultaneamente
    const promises = [
      this.vista.createLead(enrichedLead),
    ];

    // Adiciona Mautic se configurado
    if (this.mautic) {
      promises.push(this.mautic.createLead(enrichedLead));
    }

    // Executa ambos em paralelo (não bloqueia se Mautic falhar)
    const results = await Promise.allSettled(promises);

    // Resultado do Vista (principal)
    const vistaResult = results[0];
    const vistaSuccess = vistaResult.status === 'fulfilled' && vistaResult.value.success;

    // Resultado do Mautic (opcional)
    let mauticSuccess = false;
    let mauticContactId: number | undefined;
    
    if (this.mautic && results.length > 1) {
      const mauticResult = results[1];
      
      if (mauticResult.status === 'fulfilled') {
        mauticSuccess = mauticResult.value.success;
        
        // Se sucesso no Mautic, aplica tags
        if (mauticSuccess && mauticResult.value.leadId) {
          mauticContactId = parseInt(mauticResult.value.leadId, 10);
          
          // Aplica tags de forma assíncrona (não bloqueia resposta)
          this.tagService
            .generateAndApplyTags(this.mautic, mauticContactId, enrichedLead)
            .then(tags => {
              console.log(`[DualProvider] Tags aplicadas ao contato ${mauticContactId}:`, tags);
            })
            .catch(error => {
              console.error('[DualProvider] Erro ao aplicar tags:', error);
            });
        }
      } else {
        console.warn('[DualProvider] Mautic falhou:', mauticResult.reason);
      }
    }

    // Log de status
    console.log(`[DualProvider] createLead - Vista: ${vistaSuccess ? '✅' : '❌'}, Mautic: ${mauticSuccess ? '✅' : '❌'}`);

    // Retorna resultado do Vista (provider principal)
    if (vistaResult.status === 'fulfilled') {
      return vistaResult.value;
    } else {
      return {
        success: false,
        message: 'Erro ao criar lead no Vista',
        errors: [vistaResult.reason?.message || 'Erro desconhecido'],
      };
    }
  }

  async healthCheck(): Promise<{ healthy: boolean; message?: string }> {
    const dwv = await this.dwv.healthCheck();
    const vista = await this.vista.healthCheck();

    return {
      healthy: dwv.healthy && vista.healthy,
      message: !dwv.healthy
        ? `[DWV] ${dwv.message}`
        : !vista.healthy
          ? `[Vista] ${vista.message}`
          : undefined,
    };
  }
}

