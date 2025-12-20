export interface SelectOption {
  id: string;
  label: string;
}

export const CITY_OPTIONS: SelectOption[] = [
  { id: 'balneario-camboriu', label: 'Balneário Camboriú' },
  { id: 'itajai', label: 'Itajaí' },
  { id: 'camboriu', label: 'Camboriú' },
];

const NEIGHBORHOODS_BC: SelectOption[] = [
  { id: 'centro', label: 'Centro' },
  { id: 'barra-sul', label: 'Barra Sul' },
  { id: 'barra-norte', label: 'Barra Norte' },
  { id: 'pioneiros', label: 'Pioneiros' },
  { id: 'nacoes', label: 'Nações' },
  { id: 'praia-brava', label: 'Praia Brava' },
];

const NEIGHBORHOODS_ITAJAI: SelectOption[] = [
  { id: 'praia-brava', label: 'Praia Brava' },
];

export const getNeighborhoodOptionsByCity = (citySlugs: string[]): SelectOption[] => {
  if (citySlugs.includes('itajai')) return NEIGHBORHOODS_ITAJAI;
  return NEIGHBORHOODS_BC;
};

export const PROPERTY_TYPE_OPTIONS: SelectOption[] = [
  { id: 'apartamento', label: 'Apartamento' },
  { id: 'cobertura', label: 'Cobertura' },
  { id: 'diferenciado', label: 'Diferenciado' },
];

export const STATUS_OPTIONS: SelectOption[] = [
  { id: 'pre-lancamento', label: 'Pré-lançamento' },
  { id: 'lancamento', label: 'Lançamento' },
  { id: 'construcao', label: 'Em construção' },
  { id: 'pronto', label: 'Pronto para Morar' },
];

export const VALUE_RANGE_OPTIONS: SelectOption[] = [
  { id: '0-500000', label: 'Até R$ 500 mil' },
  { id: '500000-1000000', label: 'R$ 500 mil a 1 milhão' },
  { id: '1000000-2000000', label: 'R$ 1 a 2 milhões' },
  { id: '2000000-5000000', label: 'R$ 2 a 5 milhões' },
  { id: '5000000-0', label: 'Acima de R$ 5 milhões' },
];

export const BEDROOM_PRESET_OPTIONS = [
  { value: '', label: 'Qualquer' },
  { value: '1', label: '1+' },
  { value: '2', label: '2+' },
  { value: '3', label: '3+' },
  { value: '4', label: '4+' },
  { value: '5', label: '5+' },
];

export const PROPERTY_FEATURE_OPTIONS = [
  'Churrasqueira a gás',
  'Churrasqueira a carvão',
  'Mobiliado',
  'Sacada',
  'Semi Mobiliado',
  'Vista para o Mar',
];

export const LOCATION_FEATURE_OPTIONS = [
  'Avenida Brasil',
  'Barra Norte',
  'Barra Sul',
  'Centro',
  'Frente Mar',
  'Praia Brava',
  'Quadra Mar',
  'Segunda Quadra',
  'Terceira Avenida',
];

export const BUILDING_FEATURE_OPTIONS = [
  'Academia',
  'Cinema',
  'Espaço Gourmet',
  'Piscina',
  'Piscina Aquecida',
  'Playground',
  'Quadra de Esportes',
  'Quadra de Tênis',
  'Rooftop',
  'Sala de Jogos',
  'Salão de Festas',
  'Sauna',
];

export const CITY_SLUG_TO_NAME: Record<string, string> = {
  'balneario-camboriu': 'Balneário Camboriú',
  'balneario camboriu': 'Balneário Camboriú',
  'itajai': 'Itajaí',
  'camboriu': 'Camboriú',
  'itapema': 'Itapema',
  'bombinhas': 'Bombinhas',
};


