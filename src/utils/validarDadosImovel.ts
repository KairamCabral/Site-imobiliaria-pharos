/**
 * Validação de Dados de Imóveis
 * 
 * Garante que cada card mostre apenas suas próprias informações
 * e identifica campos ausentes ou inválidos
 */

import type { Property } from '@/domain/models';

export interface CampoValidacao {
  campo: string;
  presente: boolean;
  valor: any;
  valido: boolean;
  mensagem?: string;
}

export interface RelatorioValidacao {
  id: string;
  codigo: string;
  valido: boolean;
  camposFaltantes: string[];
  camposInvalidos: CampoValidacao[];
  campos: Record<string, CampoValidacao>;
}

/**
 * Valida se valor está presente e válido
 */
function validarValor(valor: any, tipoCampo: 'texto' | 'numero' | 'array' | 'objeto'): boolean {
  if (valor === null || valor === undefined) return false;
  
  switch (tipoCampo) {
    case 'texto':
      return typeof valor === 'string' && valor.trim() !== '';
    case 'numero':
      return typeof valor === 'number' && valor > 0 && !isNaN(valor);
    case 'array':
      return Array.isArray(valor) && valor.length > 0;
    case 'objeto':
      return typeof valor === 'object' && valor !== null;
    default:
      return false;
  }
}

/**
 * Valida campos críticos de um imóvel
 */
export function validarImovel(property: Property): RelatorioValidacao {
  const relatorio: RelatorioValidacao = {
    id: property.id,
    codigo: property.code,
    valido: true,
    camposFaltantes: [],
    camposInvalidos: [],
    campos: {},
  };

  // Campos críticos que DEVEM estar presentes
  const camposCriticos = [
    { campo: 'id', valor: property.id, tipo: 'texto' as const },
    { campo: 'code', valor: property.code, tipo: 'texto' as const },
    { campo: 'title', valor: property.title, tipo: 'texto' as const },
    { campo: 'type', valor: property.type, tipo: 'texto' as const },
    { campo: 'address.city', valor: property.address.city, tipo: 'texto' as const },
    { campo: 'address.neighborhood', valor: property.address.neighborhood, tipo: 'texto' as const },
    { campo: 'pricing.sale', valor: property.pricing.sale, tipo: 'numero' as const },
    { campo: 'specs.bedrooms', valor: property.specs.bedrooms, tipo: 'numero' as const },
    { campo: 'specs.totalArea', valor: property.specs.totalArea, tipo: 'numero' as const },
  ];

  // Validar cada campo crítico
  for (const { campo, valor, tipo } of camposCriticos) {
    const presente = valor !== null && valor !== undefined;
    const valido = validarValor(valor, tipo);

    relatorio.campos[campo] = {
      campo,
      presente,
      valor,
      valido,
      mensagem: !presente ? 'Campo ausente' : !valido ? 'Valor inválido' : undefined,
    };

    if (!presente) {
      relatorio.camposFaltantes.push(campo);
      relatorio.valido = false;
    }

    if (presente && !valido) {
      relatorio.camposInvalidos.push(relatorio.campos[campo]);
      relatorio.valido = false;
    }
  }

  // Campos opcionais mas recomendados
  const camposOpcionais = [
    { campo: 'specs.suites', valor: property.specs.suites, tipo: 'numero' as const },
    { campo: 'specs.bathrooms', valor: property.specs.bathrooms, tipo: 'numero' as const },
    { campo: 'specs.parkingSpots', valor: property.specs.parkingSpots, tipo: 'numero' as const },
    { campo: 'photos', valor: property.photos, tipo: 'array' as const },
    { campo: 'address.zipCode', valor: property.address.zipCode, tipo: 'texto' as const },
    { campo: 'address.coordinates', valor: property.address.coordinates, tipo: 'objeto' as const },
    { campo: 'pricing.condo', valor: property.pricing.condo, tipo: 'numero' as const },
    { campo: 'pricing.iptu', valor: property.pricing.iptu, tipo: 'numero' as const },
  ];

  for (const { campo, valor, tipo } of camposOpcionais) {
    const presente = valor !== null && valor !== undefined;
    const valido = presente ? validarValor(valor, tipo) : true; // Opcional não invalida

    relatorio.campos[campo] = {
      campo,
      presente,
      valor,
      valido,
      mensagem: !presente ? 'Campo opcional ausente' : !valido ? 'Valor inválido' : undefined,
    };
  }

  return relatorio;
}

/**
 * Valida lista de imóveis e gera relatório consolidado
 */
export function validarListaImoveis(properties: Property[]): {
  total: number;
  validos: number;
  invalidos: number;
  relatorios: RelatorioValidacao[];
} {
  const relatorios = properties.map(validarImovel);
  
  return {
    total: properties.length,
    validos: relatorios.filter(r => r.valido).length,
    invalidos: relatorios.filter(r => !r.valido).length,
    relatorios,
  };
}

/**
 * Exibe relatório de validação no console
 */
export function exibirRelatorioValidacao(relatorio: RelatorioValidacao): void {
  console.group(`📋 Validação Imóvel: ${relatorio.id} (${relatorio.codigo})`);
  
  if (relatorio.valido) {
    console.log('✅ Todos os campos críticos estão presentes e válidos');
  } else {
    console.error('❌ Imóvel com problemas');
    
    if (relatorio.camposFaltantes.length > 0) {
      console.group('🚨 Campos Faltantes:');
      relatorio.camposFaltantes.forEach(campo => {
        console.error(`  ❌ ${campo}`);
      });
      console.groupEnd();
    }
    
    if (relatorio.camposInvalidos.length > 0) {
      console.group('⚠️ Campos Inválidos:');
      relatorio.camposInvalidos.forEach(({ campo, valor, mensagem }) => {
        console.warn(`  ⚠️ ${campo}: ${valor} (${mensagem})`);
      });
      console.groupEnd();
    }
  }
  
  // Mostrar campos opcionais ausentes (info)
  const opcionaisAusentes = Object.values(relatorio.campos)
    .filter(c => !c.presente && c.mensagem?.includes('opcional'));
  
  if (opcionaisAusentes.length > 0) {
    console.group('ℹ️ Campos Opcionais Ausentes:');
    opcionaisAusentes.forEach(({ campo }) => {
      console.info(`  ℹ️ ${campo}`);
    });
    console.groupEnd();
  }
  
  console.groupEnd();
}

/**
 * Gera sumário de validação para múltiplos imóveis
 */
export function exibirSumarioValidacao(resultado: ReturnType<typeof validarListaImoveis>): void {
  console.group('📊 SUMÁRIO DE VALIDAÇÃO');
  console.log(`Total de imóveis: ${resultado.total}`);
  console.log(`✅ Válidos: ${resultado.validos} (${Math.round((resultado.validos / resultado.total) * 100)}%)`);
  console.log(`❌ Inválidos: ${resultado.invalidos} (${Math.round((resultado.invalidos / resultado.total) * 100)}%)`);
  
  // Listar imóveis inválidos
  const invalidos = resultado.relatorios.filter(r => !r.valido);
  if (invalidos.length > 0) {
    console.group('⚠️ Imóveis com Problemas:');
    invalidos.forEach(relatorio => {
      console.warn(`${relatorio.codigo}: ${relatorio.camposFaltantes.length} faltantes, ${relatorio.camposInvalidos.length} inválidos`);
    });
    console.groupEnd();
  }
  
  console.groupEnd();
}

/**
 * Sanitiza dados do imóvel antes de exibir
 * Garante que cada campo seja do próprio imóvel
 */
export function sanitizarDadosImovel(property: Property): Property {
  // Validar que o ID está presente e único
  if (!property.id || typeof property.id !== 'string') {
    console.error('🚨 ERRO: Imóvel sem ID válido', property);
    throw new Error('Imóvel sem ID válido');
  }

  // Criar cópia limpa do objeto
  const sanitized: Property = {
    ...property,
    // Garantir que strings não vazias
    title: property.title?.trim() || `Imóvel ${property.code}`,
    description: property.description?.trim(),
    
    // Garantir que números são válidos
    pricing: {
      sale: Number(property.pricing.sale) || 0,
      rent: Number(property.pricing.rent) || undefined,
      condo: Number(property.pricing.condo) || undefined,
      iptu: Number(property.pricing.iptu) || undefined,
    },
    
    specs: {
      bedrooms: Number(property.specs.bedrooms) || 0,
      suites: Number(property.specs.suites) || 0,
      bathrooms: Number(property.specs.bathrooms) || 0,
      parkingSpots: Number(property.specs.parkingSpots) || 0,
      totalArea: Number(property.specs.totalArea) || 0,
      privateArea: Number(property.specs.privateArea) || undefined,
      landArea: Number(property.specs.landArea) || undefined,
      floor: Number(property.specs.floor) || undefined,
      totalFloors: Number(property.specs.totalFloors) || undefined,
      halfBathrooms: Number(property.specs.halfBathrooms) || undefined,
    },
    
    // Garantir que arrays são válidos
    photos: Array.isArray(property.photos) ? property.photos : [],
    videos: Array.isArray(property.videos) ? property.videos : undefined,
  };

  return sanitized;
}

