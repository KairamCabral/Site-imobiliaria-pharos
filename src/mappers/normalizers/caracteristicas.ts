/**
 * Mapeamento de Características UI ↔ Vista CRM
 * 
 * Centraliza todos os mapeamentos entre os nomes exibidos na UI
 * e os campos reais da API Vista CRM
 */

/**
 * Características do Imóvel
 * UI → Vista CRM
 */
export const caracteristicasImovelMap: Record<string, string> = {
  // Churrasqueira
  // Importante: muitos ambientes Vista não possuem campos específicos para gás/carvão.
  // Para garantir compatibilidade e evitar 400/500, mapeamos para o campo genérico "Churrasqueira".
  'Churrasqueira a gás': 'Churrasqueira',
  'Churrasqueira a gas': 'Churrasqueira',
  'Churrasqueira a carvão': 'Churrasqueira',
  'Churrasqueira a carvao': 'Churrasqueira',
  'Churrasqueira': 'Churrasqueira',
  'Churrasqueira Gourmet': 'ChurrasqueiraGourmet',
  
  // Mobiliário
  'Mobiliado': 'Mobiliado',
  'Semi Mobiliado': 'SemiMobiliado',
  
  // Áreas externas
  'Sacada': 'Sacada',
  'Varanda': 'Varanda',
  'Sacada com churrasqueira': 'SacadaComChurrasqueira',
  'Vista para o Mar': 'VistaMar',
  'Vista Mar': 'VistaMar',
  
  // Conforto
  'Ar Condicionado': 'ArCondicionado',
  'Lareira': 'Lareira',
  'Hidromassagem': 'Hidromassagem',
  'Aquecimento': 'Aquecimento',
  
  // Segurança
  'Alarme': 'Alarme',
  'Cerca Elétrica': 'CercaEletrica',
  'Interfone': 'Interfone',
  
  // Espaços
  'Jardim': 'Jardim',
  'Quintal': 'Quintal',
  
  // Tecnologia
  'Home Theater': 'HomeTheater',
  
  // Características que podem ser do imóvel OU do condomínio/empreendimento
  // IMPORTANTE: Duplicado aqui para permitir busca em ambos os contextos
  'Rooftop': 'Rooftop',
  'Espaço Gourmet': 'EspacoGourmet',
  'Playground': 'Playground',
  'Brinquedoteca': 'Brinquedoteca',
  'Cinema': 'Cinema',
  'Salão de Festas': 'SalaoFestas',
  'Salão de Jogos': 'SalaoJogos',
  'Sala de Jogos': 'SalaJogos',
  'Piscina': 'Piscina',
  'Piscina Aquecida': 'PiscinaAquecida',
  'Academia': 'Academia',
  'Sala Fitness': 'SalaFitness',
  'Sauna': 'Sauna',
  'Elevador': 'Elevador',
};

/**
 * Características da Localização
 * UI → Vista CRM
 */
export const caracteristicasLocalizacaoMap: Record<string, string> = {
  // Bairros principais
  'Centro': 'Centro',
  'Barra Norte': 'BarraNorte',
  'Barra Sul': 'BarraSul',
  'Praia Brava': 'PraiaBrava',
  'Praia dos Amores': 'PraiaAmores',
  
  // Avenidas
  'Avenida Brasil': 'AvenidaBrasil',
  'Terceira Avenida': 'TerceiraAvenida',
  
  // Posição em relação ao mar
  'Frente Mar': 'FrenteMar',
  'Quadra Mar': 'QuadraMar',
  'Segunda Quadra': 'SegundaQuadra',
};

/**
 * Características do Empreendimento
 * UI → Vista CRM
 */
export const caracteristicasEmpreendimentoMap: Record<string, string> = {
  // Lazer e fitness
  'Academia': 'Academia',
  'Sala Fitness': 'SalaFitness',
  'Piscina': 'Piscina',
  'Piscina Aquecida': 'PiscinaAquecida',
  'Sauna': 'Sauna',
  'Hidromassagem': 'Hidromassagem',
  
  // Esportes
  'Quadra de Esportes': 'QuadraEsportes',
  'Quadra de Tênis': 'QuadraTenis',
  'Quadra': 'Quadra',
  
  // Social
  'Salão de Festas': 'SalaoFestas',
  'Sala de Jogos': 'SalaJogos',
  'Salão de Jogos': 'SalaoJogos',
  'Espaço Gourmet': 'EspacoGourmet',
  'Cinema': 'Cinema',
  'Rooftop': 'Rooftop',
  
  // Infantil
  'Playground': 'Playground', // ✅ CORREÇÃO: Vista CRM usa "Playground" diretamente
  'Brinquedoteca': 'Brinquedoteca',
  
  // Comodidades
  'Bicicletário': 'Bicicletario',
  'Elevador': 'Elevador',
  'Portaria 24 horas': 'Portaria24h',
  'Portaria 24h': 'Portaria24h',
};

/**
 * Mapeamento reverso (Vista → UI) para cada tipo
 */
const caracteristicasImovelReverseMap = Object.fromEntries(
  Object.entries(caracteristicasImovelMap).map(([ui, vista]) => [vista, ui])
);

const caracteristicasLocalizacaoReverseMap = Object.fromEntries(
  Object.entries(caracteristicasLocalizacaoMap).map(([ui, vista]) => [vista, ui])
);

const caracteristicasEmpreendimentoReverseMap = Object.fromEntries(
  Object.entries(caracteristicasEmpreendimentoMap).map(([ui, vista]) => [vista, ui])
);

/**
 * Tipo de característica
 */
export type CaracteristicaTipo = 'imovel' | 'localizacao' | 'empreendimento';

/**
 * Mapeia nome da UI para campo do Vista CRM
 */
export function mapUItoVista(
  ui: string,
  type: CaracteristicaTipo
): string | undefined {
  const map = type === 'imovel' 
    ? caracteristicasImovelMap
    : type === 'localizacao'
    ? caracteristicasLocalizacaoMap
    : caracteristicasEmpreendimentoMap;
  
  const vistaField = map[ui];
  
  if (!vistaField && process.env.NODE_ENV === 'development') {
    console.warn(`[Mapeamento] Campo UI não mapeado: "${ui}" (tipo: ${type})`);
  }
  
  return vistaField;
}

/**
 * Mapeia campo do Vista CRM para nome da UI
 */
export function mapVistaToUI(
  vista: string,
  type: CaracteristicaTipo
): string | undefined {
  const map = type === 'imovel'
    ? caracteristicasImovelReverseMap
    : type === 'localizacao'
    ? caracteristicasLocalizacaoReverseMap
    : caracteristicasEmpreendimentoReverseMap;
  
  return map[vista];
}

/**
 * Valida se uma característica UI existe no mapeamento
 */
export function isValidCaracteristica(
  ui: string,
  type: CaracteristicaTipo
): boolean {
  return mapUItoVista(ui, type) !== undefined;
}

/**
 * Mapeia múltiplas características UI para Vista
 */
export function mapMultipleUItoVista(
  uiList: string[],
  type: CaracteristicaTipo
): string[] {
  return uiList
    .map(ui => mapUItoVista(ui, type))
    .filter((vista): vista is string => vista !== undefined);
}

/**
 * Obtém todas as características disponíveis para um tipo
 */
export function getCaracteristicasDisponiveis(
  type: CaracteristicaTipo
): { ui: string; vista: string }[] {
  const map = type === 'imovel'
    ? caracteristicasImovelMap
    : type === 'localizacao'
    ? caracteristicasLocalizacaoMap
    : caracteristicasEmpreendimentoMap;
  
  return Object.entries(map).map(([ui, vista]) => ({ ui, vista }));
}

/**
 * Log de debug para características mapeadas
 */
export function logCaracteristicasMapping(
  uiList: string[],
  type: CaracteristicaTipo
): void {
  if (process.env.NODE_ENV !== 'development') return;
  
  console.group(`🗺️ [Mapeamento] Características ${type}`);
  console.log('UI → Vista:');
  uiList.forEach(ui => {
    const vista = mapUItoVista(ui, type);
    console.log(`  ${ui} → ${vista || '❌ NÃO MAPEADO'}`);
  });
  console.groupEnd();
}

