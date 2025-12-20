/**
 * Monitor de Qualidade de Dados
 * 
 * Analisa campos retornados da API Vista e gera relatórios
 */

export interface QualityReport {
  total: number;
  camposPresentes: Record<string, number>;
  camposAusentes: Record<string, number>;
  percentualPreenchimento: Record<string, number>;
  alertas: string[];
}

/**
 * Campos críticos que devem estar sempre presentes
 */
const CAMPOS_CRITICOS = [
  'Codigo',
  'Titulo',
  'TipoImovel',
  'Cidade',
  'Bairro',
  'ValorVenda',
  'Dormitorios',
  'AreaTotal',
];

/**
 * Campos importantes mas opcionais
 */
const CAMPOS_IMPORTANTES = [
  'ValorIPTU',
  'ValorCondominio',
  'Banheiros',
  'Suites',
  'Vagas',
  'CEP',
  'Latitude',
  'Longitude',
  'FotoDestaque',
  'AreaPrivativa',
  'Andar',
];

/**
 * Campos desejáveis (mídia e extras)
 */
const CAMPOS_DESEJAVEIS = [
  'Videos',
  'TourVirtual',
  'DescricaoWeb',
  'DataAtualizacao',
  'Status',
  'Empreendimento',
  'NomeEmpreendimento',
];

/**
 * Verifica se campo está presente e válido
 */
function campoValido(valor: any): boolean {
  if (valor === null || valor === undefined) return false;
  if (typeof valor === 'string' && valor.trim() === '') return false;
  if (typeof valor === 'number' && valor === 0) return false; // 0 pode ser válido em alguns casos
  if (Array.isArray(valor) && valor.length === 0) return false;
  return true;
}

/**
 * Analisa qualidade de um único imóvel
 */
function analisarImovel(imovel: any): {
  criticos: string[];
  importantes: string[];
  desejaveis: string[];
} {
  const criticos: string[] = [];
  const importantes: string[] = [];
  const desejaveis: string[] = [];

  // Analisar campos críticos
  for (const campo of CAMPOS_CRITICOS) {
    if (campoValido(imovel[campo])) {
      criticos.push(campo);
    }
  }

  // Analisar campos importantes
  for (const campo of CAMPOS_IMPORTANTES) {
    if (campoValido(imovel[campo])) {
      importantes.push(campo);
    }
  }

  // Analisar campos desejáveis
  for (const campo of CAMPOS_DESEJAVEIS) {
    // Para empreendimento, checar variações
    if (campo === 'Empreendimento' || campo === 'NomeEmpreendimento') {
      if (
        campoValido(imovel.Empreendimento) ||
        campoValido(imovel.NomeEmpreendimento) ||
        campoValido(imovel.Condominio) ||
        campoValido(imovel.NomeCondominio)
      ) {
        desejaveis.push('Empreendimento');
        continue;
      }
    }
    
    if (campoValido(imovel[campo])) {
      desejaveis.push(campo);
    }
  }

  return { criticos, importantes, desejaveis };
}

/**
 * Gera relatório de qualidade para lista de imóveis
 */
export function gerarRelatorioQualidade(imoveis: any[]): QualityReport {
  const report: QualityReport = {
    total: imoveis.length,
    camposPresentes: {},
    camposAusentes: {},
    percentualPreenchimento: {},
    alertas: [],
  };

  if (imoveis.length === 0) {
    report.alertas.push('⚠️ Nenhum imóvel para analisar');
    return report;
  }

  // Inicializar contadores
  const todosCampos = [...CAMPOS_CRITICOS, ...CAMPOS_IMPORTANTES, ...CAMPOS_DESEJAVEIS];
  for (const campo of todosCampos) {
    report.camposPresentes[campo] = 0;
    report.camposAusentes[campo] = 0;
  }

  // Analisar cada imóvel
  for (const imovel of imoveis) {
    const analise = analisarImovel(imovel);

    // Contar presentes
    for (const campo of analise.criticos) {
      report.camposPresentes[campo] = (report.camposPresentes[campo] || 0) + 1;
    }
    for (const campo of analise.importantes) {
      report.camposPresentes[campo] = (report.camposPresentes[campo] || 0) + 1;
    }
    for (const campo of analise.desejaveis) {
      report.camposPresentes[campo] = (report.camposPresentes[campo] || 0) + 1;
    }
  }

  // Calcular ausentes e percentuais
  for (const campo of todosCampos) {
    const presentes = report.camposPresentes[campo] || 0;
    report.camposAusentes[campo] = imoveis.length - presentes;
    report.percentualPreenchimento[campo] = Math.round((presentes / imoveis.length) * 100);
  }

  // Gerar alertas
  // 1. Campos críticos ausentes
  for (const campo of CAMPOS_CRITICOS) {
    const percentual = report.percentualPreenchimento[campo];
    if (percentual < 50) {
      report.alertas.push(`🚨 CRÍTICO: ${campo} presente em apenas ${percentual}% dos imóveis`);
    } else if (percentual < 80) {
      report.alertas.push(`⚠️ ATENÇÃO: ${campo} presente em apenas ${percentual}% dos imóveis`);
    }
  }

  // 2. Campos importantes com baixo preenchimento
  for (const campo of CAMPOS_IMPORTANTES) {
    const percentual = report.percentualPreenchimento[campo];
    if (percentual < 30) {
      report.alertas.push(`⚠️ ${campo} presente em apenas ${percentual}% dos imóveis`);
    }
  }

  // 3. Campos desejáveis ausentes
  for (const campo of CAMPOS_DESEJAVEIS) {
    const percentual = report.percentualPreenchimento[campo];
    if (percentual === 0) {
      report.alertas.push(`ℹ️ ${campo} não está presente em nenhum imóvel`);
    }
  }

  return report;
}

/**
 * Exibe relatório no console de forma formatada
 */
export function exibirRelatorioConsole(report: QualityReport): void {
  console.group('📊 RELATÓRIO DE QUALIDADE - API VISTA');
  
  console.log(`\n📈 Total de imóveis analisados: ${report.total}`);
  
  // Campos críticos
  console.group('\n🚨 CAMPOS CRÍTICOS');
  for (const campo of CAMPOS_CRITICOS) {
    const perc = report.percentualPreenchimento[campo];
    const emoji = perc >= 80 ? '✅' : perc >= 50 ? '⚠️' : '🚨';
    console.log(`${emoji} ${campo}: ${perc}% (${report.camposPresentes[campo]}/${report.total})`);
  }
  console.groupEnd();
  
  // Campos importantes
  console.group('\n⚠️ CAMPOS IMPORTANTES');
  for (const campo of CAMPOS_IMPORTANTES) {
    const perc = report.percentualPreenchimento[campo];
    const emoji = perc >= 50 ? '✅' : perc >= 30 ? '⚠️' : '❌';
    console.log(`${emoji} ${campo}: ${perc}% (${report.camposPresentes[campo]}/${report.total})`);
  }
  console.groupEnd();
  
  // Campos desejáveis
  console.group('\nℹ️ CAMPOS DESEJÁVEIS');
  for (const campo of CAMPOS_DESEJAVEIS) {
    const perc = report.percentualPreenchimento[campo];
    const emoji = perc > 0 ? '✅' : '➖';
    console.log(`${emoji} ${campo}: ${perc}% (${report.camposPresentes[campo]}/${report.total})`);
  }
  console.groupEnd();
  
  // Alertas
  if (report.alertas.length > 0) {
    console.group('\n🔔 ALERTAS');
    for (const alerta of report.alertas) {
      console.warn(alerta);
    }
    console.groupEnd();
  }
  
  console.groupEnd();
}

/**
 * Monitora qualidade de dados em tempo real (log simplificado)
 */
export function monitorarQualidade(imoveis: any[], exibirConsole = true): QualityReport {
  const report = gerarRelatorioQualidade(imoveis);
  
  if (exibirConsole) {
    exibirRelatorioConsole(report);
  }
  
  return report;
}

