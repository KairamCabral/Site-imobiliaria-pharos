import type { Imovel } from '@/types';

/**
 * Dados mockados de imóveis
 * Em produção, estes dados viriam de uma API ou CMS
 */

/**
 * Busca imóveis por ID do empreendimento
 */
export function buscarImoveisPorEmpreendimento(empreendimentoId: string): Imovel[] {
  return imoveisMock.filter(imovel => imovel.empreendimentoId === empreendimentoId);
}

export const imoveisMock: Imovel[] = [
  {
    id: 'imovel-001',
    slug: 'apartamento-luxo-frente-mar-220m2-4-suites-centro-balneario-camboriu',
    codigo: 'APT-001',
    titulo: 'Apartamento de Luxo Frente Mar - 4 Suítes',
    descricao: 'Espetacular apartamento de frente para o mar com 220m² e acabamento de alto padrão.',
    descricaoCompleta: 'Espetacular apartamento de frente para o mar em Balneário Camboriú, localizado na avenida Atlântica, com vista deslumbrante para toda a orla da praia. O imóvel possui 220m² de área privativa, com acabamento de alto padrão e decoração sofisticada. São 4 quartos, sendo 3 suítes, com a suíte master contando com closet e banheiro com banheira de hidromassagem.',
    
    empreendimentoId: 'emp-001',
    
    tipo: 'apartamento',
    finalidade: 'venda',
    
    endereco: {
      rua: 'Avenida Atlântica',
      numero: '1500',
      complemento: 'Apto 2501',
      bairro: 'Centro',
      cidade: 'Balneário Camboriú',
      estado: 'SC',
      cep: '88330-000',
      coordenadas: {
        latitude: -26.9857,
        longitude: -48.6348,
      },
    },
    
    preco: 4500000,
    precoCondominio: 2800,
    iptu: 15000,
    aceitaPermuta: true,
    aceitaFinanciamento: true,
    
    areaTotal: 220,
    areaPrivativa: 195,
    quartos: 4,
    suites: 3,
    banheiros: 4,
    lavabos: 1,
    vagasGaragem: 3,
    andar: 25,
    totalAndares: 30,
    
    caracteristicas: [
      '4 quartos (3 suítes)',
      'Varanda gourmet',
      'Cozinha integrada',
      'Vista panorâmica para o mar',
      'Piso em porcelanato',
      'Ar-condicionado split',
      'Persianas elétricas',
      'Churrasqueira na varanda',
      'Lavabo social',
      'Closet na suíte master',
    ],
    
    diferenciais: ['Frente Mar', 'Andar Alto', 'Mobiliado', 'Alto Padrão'],
    mobiliado: true,
    petFriendly: true,
    acessibilidade: false,
    
    posicaoSolar: 'Norte',
    vistaParaMar: true,
    frenteRua: true,
    
    estadoConservacao: 'novo',
    anosConstrucao: 2,
    
    imagemCapa: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&h=800&q=80',
    galeria: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&h=800&q=80',
      'https://images.unsplash.com/photo-1560448205-4d9b3e6bb6db?w=1200&h=800&q=80',
      'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=1200&h=800&q=80',
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1200&h=800&q=80',
    ],
    
    status: 'disponivel',
    destaque: true,
    lancamento: false,
    exclusivo: true,
    
    corretor: {
      id: 'corretor-001',
      nome: 'Carlos Oliveira',
      telefone: '47999990001',
      email: 'carlos@pharos.imb.br',
      creci: '12345-F',
      whatsapp: '5547999990001',
    },
    
    metaTitle: 'Apartamento de Luxo Frente Mar 220m² - 4 Suítes | Centro Balneário Camboriú',
    metaDescription: 'Apartamento espetacular frente mar com 220m², 4 quartos sendo 3 suítes, varanda gourmet e vista panorâmica. Alto padrão no Centro de Balneário Camboriú.',
    keywords: ['apartamento frente mar', 'luxo balneário camboriú', '4 suítes', 'alto padrão', 'centro'],
    
    visualizacoes: 1234,
    favoritado: 89,
    contatosRecebidos: 45,
    
    createdAt: '2024-01-15T10:00:00.000Z',
    updatedAt: '2024-01-20T15:30:00.000Z',
    publicadoEm: '2024-01-15T10:00:00.000Z',
  },
  
  {
    id: 'imovel-002',
    slug: 'cobertura-duplex-vista-mar-280m2-pioneiros-balneario-camboriu',
    codigo: 'COB-002',
    titulo: 'Cobertura Duplex Vista Mar - 280m²',
    descricao: 'Cobertura duplex com piscina privativa, 4 suítes e vista deslumbrante para o mar.',
    descricaoCompleta: 'Magnífica cobertura duplex com 280m² de área privativa, piscina privativa aquecida e vista panorâmica para o mar. O imóvel possui 4 suítes, todas com closet, sala de estar ampla, sala de jantar, home theater, varanda gourmet integrada e terraço com área de lazer completa.',
    
    tipo: 'cobertura',
    finalidade: 'venda',
    
    endereco: {
      rua: 'Rua 3000',
      numero: '580',
      complemento: 'Cobertura',
      bairro: 'Pioneiros',
      cidade: 'Balneário Camboriú',
      estado: 'SC',
      cep: '88331-000',
      coordenadas: {
        latitude: -26.9750,
        longitude: -48.6400,
      },
    },
    
    preco: 6800000,
    precoCondominio: 4500,
    iptu: 22000,
    aceitaPermuta: false,
    aceitaFinanciamento: true,
    
    areaTotal: 280,
    areaPrivativa: 250,
    quartos: 4,
    suites: 4,
    banheiros: 5,
    lavabos: 2,
    vagasGaragem: 4,
    andar: 20,
    totalAndares: 20,
    
    caracteristicas: [
      '4 suítes com closet',
      'Piscina privativa aquecida',
      'Home theater',
      'Churrasqueira',
      'Forno de pizza',
      'Adega climatizada',
      'Sauna',
      'Hidromassagem',
      'Elevador privativo',
      'Sistema de som ambiente',
    ],
    
    diferenciais: ['Cobertura', 'Piscina Privativa', 'Vista Mar', 'Luxo'],
    mobiliado: false,
    petFriendly: true,
    acessibilidade: true,
    
    vistaParaMar: true,
    estadoConservacao: 'novo',
    anosConstrucao: 1,
    
    imagemCapa: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&h=800&q=80',
    galeria: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&h=800&q=80',
      'https://images.unsplash.com/photo-1560448205-4d9b3e6bb6db?w=1200&h=800&q=80',
      'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=1200&h=800&q=80',
    ],
    
    status: 'disponivel',
    destaque: true,
    lancamento: false,
    
    corretor: {
      id: 'corretor-002',
      nome: 'Marina Santos',
      telefone: '47999990002',
      email: 'marina@pharos.imb.br',
      creci: '23456-F',
      whatsapp: '5547999990002',
    },
    
    metaTitle: 'Cobertura Duplex 280m² Vista Mar | Pioneiros Balneário Camboriú',
    metaDescription: 'Cobertura duplex espetacular com piscina privativa, 4 suítes, home theater e vista para o mar. Alto padrão no Pioneiros.',
    keywords: ['cobertura balneário camboriú', 'duplex', 'piscina privativa', 'pioneiros', 'luxo'],
    
    visualizacoes: 856,
    favoritado: 67,
    
    createdAt: '2024-01-10T10:00:00.000Z',
    updatedAt: '2024-01-18T15:30:00.000Z',
    publicadoEm: '2024-01-10T10:00:00.000Z',
  },
  
  {
    id: 'imovel-003',
    slug: 'casa-condominio-fechado-350m2-barra-sul-balneario-camboriu',
    codigo: 'CAS-003',
    titulo: 'Casa em Condomínio Fechado - 350m²',
    descricao: 'Casa moderna em condomínio de alto padrão com piscina, churrasqueira e área gourmet.',
    descricaoCompleta: 'Linda casa em condomínio fechado de alto padrão na Barra Sul. Terreno de 450m² com 350m² de área construída. Arquitetura moderna com 4 suítes, sala de estar ampla, sala de jantar, cozinha gourmet, escritório, área de lazer completa com piscina, churrasqueira, forno de pizza e espaço gourmet.',
    
    empreendimentoId: 'emp-003',
    
    tipo: 'casa',
    finalidade: 'venda',
    
    endereco: {
      rua: 'Rua das Acácias',
      numero: '245',
      complemento: 'Lote 12',
      bairro: 'Barra Sul',
      cidade: 'Balneário Camboriú',
      estado: 'SC',
      cep: '88330-500',
      coordenadas: {
        latitude: -26.9950,
        longitude: -48.6250,
      },
    },
    
    preco: 4200000,
    precoCondominio: 1800,
    iptu: 18000,
    aceitaPermuta: true,
    aceitaFinanciamento: true,
    valorPermuta: 1500000,
    
    areaTotal: 350,
    areaTerreno: 450,
    quartos: 4,
    suites: 4,
    banheiros: 5,
    lavabos: 2,
    vagasGaragem: 4,
    
    caracteristicas: [
      '4 suítes',
      'Piscina privativa',
      'Churrasqueira',
      'Forno de pizza',
      'Espaço gourmet',
      'Escritório',
      'Lavabo social',
      'Área de serviço ampla',
      'Quintal gramado',
      'Garagem coberta',
    ],
    
    diferenciais: ['Condomínio Fechado', 'Piscina', 'Segurança 24h', 'Barra Sul'],
    mobiliado: false,
    petFriendly: true,
    acessibilidade: false,
    
    estadoConservacao: 'seminovo',
    anosConstrucao: 5,
    
    imagemCapa: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&h=800&q=80',
    galeria: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&h=800&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=800&q=80',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&h=800&q=80',
    ],
    
    status: 'disponivel',
    destaque: true,
    lancamento: false,
    
    corretor: {
      id: 'corretor-001',
      nome: 'Carlos Oliveira',
      telefone: '47999990001',
      email: 'carlos@pharos.imb.br',
      creci: '12345-F',
      whatsapp: '5547999990001',
    },
    
    metaTitle: 'Casa 350m² em Condomínio Fechado | Barra Sul Balneário Camboriú',
    metaDescription: 'Casa moderna em condomínio de alto padrão com 4 suítes, piscina e área gourmet completa. Barra Sul, Balneário Camboriú.',
    keywords: ['casa balneário camboriú', 'condomínio fechado', 'barra sul', 'piscina', '4 suítes'],
    
    visualizacoes: 678,
    favoritado: 45,
    
    createdAt: '2023-12-05T10:00:00.000Z',
    updatedAt: '2024-01-15T15:30:00.000Z',
    publicadoEm: '2023-12-05T10:00:00.000Z',
  },
  
  {
    id: 'imovel-004',
    slug: 'apartamento-3-suites-140m2-centro-balneario-camboriu',
    codigo: 'APT-004',
    titulo: 'Apartamento 3 Suítes - 140m²',
    descricao: 'Apartamento moderno com 3 suítes, varanda gourmet e 2 vagas de garagem.',
    descricaoCompleta: 'Apartamento moderno com 140m² no Centro de Balneário Camboriú. 3 suítes, sala ampla, cozinha integrada, varanda gourmet e 2 vagas de garagem. Acabamento de qualidade, piso porcelanato, ar-condicionado e armários planejados.',
    
    tipo: 'apartamento',
    finalidade: 'venda',
    
    endereco: {
      rua: 'Rua 1500',
      numero: '240',
      complemento: 'Apto 1203',
      bairro: 'Centro',
      cidade: 'Balneário Camboriú',
      estado: 'SC',
      cep: '88330-000',
      coordenadas: {
        latitude: -26.9840,
        longitude: -48.6360,
      },
    },
    
    preco: 1950000,
    precoCondominio: 1200,
    iptu: 8000,
    aceitaPermuta: false,
    aceitaFinanciamento: true,
    
    areaTotal: 140,
    areaPrivativa: 125,
    quartos: 3,
    suites: 3,
    banheiros: 3,
    vagasGaragem: 2,
    andar: 12,
    totalAndares: 25,
    
    caracteristicas: [
      '3 suítes',
      'Varanda gourmet',
      'Cozinha integrada',
      'Armários planejados',
      'Ar-condicionado',
      'Piso porcelanato',
      'Churrasqueira na varanda',
      'Lavabo',
    ],
    
    diferenciais: ['Pronto para Morar', 'Mobiliado', 'Centro'],
    mobiliado: true,
    petFriendly: true,
    acessibilidade: false,
    
    estadoConservacao: 'novo',
    anosConstrucao: 1,
    
    imagemCapa: 'https://images.unsplash.com/photo-1560448205-4d9b3e6bb6db?w=1200&h=800&q=80',
    galeria: [
      'https://images.unsplash.com/photo-1560448205-4d9b3e6bb6db?w=1200&h=800&q=80',
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1200&h=800&q=80',
    ],
    
    status: 'disponivel',
    destaque: false,
    lancamento: false,
    
    corretor: {
      id: 'corretor-003',
      nome: 'Juliana Pereira',
      telefone: '47999990003',
      email: 'juliana@pharos.imb.br',
      creci: '34567-F',
      whatsapp: '5547999990003',
    },
    
    metaTitle: 'Apartamento 3 Suítes 140m² | Centro Balneário Camboriú',
    metaDescription: 'Apartamento moderno com 3 suítes, varanda gourmet e 2 vagas. Pronto para morar no Centro de Balneário Camboriú.',
    keywords: ['apartamento 3 suítes', 'centro balneário camboriú', '140m2', 'mobiliado'],
    
    visualizacoes: 445,
    favoritado: 28,
    
    createdAt: '2024-01-05T10:00:00.000Z',
    updatedAt: '2024-01-12T15:30:00.000Z',
    publicadoEm: '2024-01-05T10:00:00.000Z',
  },
  
  {
    id: 'imovel-005',
    slug: 'apartamento-2-quartos-85m2-vista-lateral-mar-centro-balneario-camboriu',
    codigo: 'APT-005',
    titulo: 'Apartamento 2 Quartos Vista Lateral Mar - 85m²',
    descricao: 'Apartamento com 2 quartos, sendo 1 suíte, vista lateral para o mar e varanda.',
    descricaoCompleta: 'Apartamento com 85m² no Centro, próximo à praia. 2 quartos sendo 1 suíte, sala com varanda, cozinha, área de serviço e 1 vaga de garagem. Vista lateral para o mar. Ótima oportunidade de investimento.',
    
    tipo: 'apartamento',
    finalidade: 'venda',
    
    endereco: {
      rua: 'Rua 2000',
      numero: '100',
      complemento: 'Apto 805',
      bairro: 'Centro',
      cidade: 'Balneário Camboriú',
      estado: 'SC',
      cep: '88330-000',
      coordenadas: {
        latitude: -26.9855,
        longitude: -48.6355,
      },
    },
    
    preco: 1100000,
    precoCondominio: 800,
    iptu: 5000,
    aceitaPermuta: true,
    aceitaFinanciamento: true,
    
    areaTotal: 85,
    areaPrivativa: 75,
    quartos: 2,
    suites: 1,
    banheiros: 2,
    vagasGaragem: 1,
    andar: 8,
    totalAndares: 15,
    
    caracteristicas: [
      '2 quartos (1 suíte)',
      'Varanda',
      'Vista lateral mar',
      'Cozinha equipada',
      'Ar-condicionado',
      'Próximo à praia',
    ],
    
    diferenciais: ['Vista Mar', 'Centro', 'Investimento'],
    mobiliado: false,
    petFriendly: true,
    acessibilidade: false,
    
    vistaParaMar: true,
    estadoConservacao: 'usado',
    anosConstrucao: 8,
    
    imagemCapa: 'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=1200&h=800&q=80',
    galeria: [
      'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=1200&h=800&q=80',
    ],
    
    status: 'disponivel',
    destaque: false,
    lancamento: false,
    
    corretor: {
      id: 'corretor-002',
      nome: 'Marina Santos',
      telefone: '47999990002',
      email: 'marina@pharos.imb.br',
      creci: '23456-F',
      whatsapp: '5547999990002',
    },
    
    metaTitle: 'Apartamento 2 Quartos 85m² Vista Mar | Centro Balneário Camboriú',
    metaDescription: 'Apartamento 2 quartos com suíte e vista lateral para o mar. Ótimo investimento no Centro de Balneário Camboriú.',
    keywords: ['apartamento 2 quartos', 'vista mar', 'centro', 'investimento'],
    
    visualizacoes: 332,
    favoritado: 19,
    
    createdAt: '2023-12-20T10:00:00.000Z',
    updatedAt: '2024-01-08T15:30:00.000Z',
    publicadoEm: '2023-12-20T10:00:00.000Z',
  },
  
  {
    id: 'imovel-006',
    slug: 'casa-3-suites-250m2-terreno-400m2-nacoes-balneario-camboriu',
    codigo: 'CAS-006',
    titulo: 'Casa 3 Suítes - Terreno 400m²',
    descricao: 'Casa ampla com 3 suítes, piscina e churrasqueira no bairro Nações.',
    descricaoCompleta: 'Casa ampla no bairro Nações com 250m² de área construída em terreno de 400m². 3 suítes, sala de estar, sala de jantar, cozinha ampla, área de serviço, piscina, churrasqueira e garagem para 3 carros. Bairro tranquilo e familiar.',
    
    tipo: 'casa',
    finalidade: 'venda',
    
    endereco: {
      rua: 'Rua das Flores',
      numero: '789',
      bairro: 'Nações',
      cidade: 'Balneário Camboriú',
      estado: 'SC',
      cep: '88332-000',
      coordenadas: {
        latitude: -26.9820,
        longitude: -48.6420,
      },
    },
    
    preco: 2500000,
    iptu: 12000,
    aceitaPermuta: true,
    aceitaFinanciamento: true,
    
    areaTotal: 250,
    areaTerreno: 400,
    quartos: 3,
    suites: 3,
    banheiros: 4,
    vagasGaragem: 3,
    
    caracteristicas: [
      '3 suítes',
      'Piscina',
      'Churrasqueira',
      'Área de serviço ampla',
      'Quintal',
      'Garagem coberta',
      'Portão eletrônico',
    ],
    
    diferenciais: ['Piscina', 'Bairro Tranquilo', 'Espaço Amplo'],
    mobiliado: false,
    petFriendly: true,
    acessibilidade: false,
    
    estadoConservacao: 'usado',
    anosConstrucao: 12,
    
    imagemCapa: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=800&q=80',
    galeria: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=800&q=80',
    ],
    
    status: 'disponivel',
    destaque: false,
    lancamento: false,
    
    corretor: {
      id: 'corretor-001',
      nome: 'Carlos Oliveira',
      telefone: '47999990001',
      email: 'carlos@pharos.imb.br',
      creci: '12345-F',
      whatsapp: '5547999990001',
    },
    
    metaTitle: 'Casa 3 Suítes com Piscina | Nações Balneário Camboriú',
    metaDescription: 'Casa ampla com 3 suítes, piscina e churrasqueira em terreno de 400m². Bairro Nações, Balneário Camboriú.',
    keywords: ['casa balneário camboriú', 'nações', 'piscina', '3 suítes', 'terreno 400m2'],
    
    visualizacoes: 289,
    favoritado: 15,
    
    createdAt: '2023-11-10T10:00:00.000Z',
    updatedAt: '2024-01-05T15:30:00.000Z',
    publicadoEm: '2023-11-10T10:00:00.000Z',
  },
];

/**
 * Busca imóvel por slug
 */
export function buscarImovelPorSlug(slug: string): Imovel | undefined {
  return imoveisMock.find((imovel) => imovel.slug === slug);
}

/**
 * Busca imóvel por ID
 */
export function buscarImovelPorId(id: string): Imovel | undefined {
  return imoveisMock.find((imovel) => imovel.id === id);
}

/**
 * Lista todos os imóveis
 */
export function listarImoveis(): Imovel[] {
  return imoveisMock;
}

/**
 * Busca imóveis por tipo
 */
export function buscarImoveisPorTipo(tipo: string): Imovel[] {
  const tipoNormalizado = tipo.toLowerCase().replace(/s$/, ''); // Remove 's' do plural
  return imoveisMock.filter((imovel) => imovel.tipo === tipoNormalizado);
}

/**
 * Busca imóveis por categoria especial
 */
export function buscarImoveisPorCategoria(categoria: string): Imovel[] {
  const categoriaNormalizada = categoria.toLowerCase();
  
  switch (categoriaNormalizada) {
    case 'apartamentos':
      return imoveisMock.filter((imovel) => imovel.tipo === 'apartamento');
    
    case 'coberturas':
      return imoveisMock.filter((imovel) => imovel.tipo === 'cobertura');
    
    case 'diferenciados':
      return imoveisMock.filter((imovel) => 
        imovel.diferenciais?.some(d => 
          d.includes('Alto Padrão') || 
          d.includes('Frente Mar') || 
          d.includes('Vista Panorâmica')
        ) || imovel.exclusivo
      );
    
    case 'mobiliados':
      return imoveisMock.filter((imovel) => imovel.mobiliado === true);
    
    case 'prontos':
      return imoveisMock.filter((imovel) => 
        imovel.estadoConservacao === 'novo' || 
        (imovel.anosConstrucao !== undefined && imovel.anosConstrucao <= 3)
      );
    
    case 'lancamentos':
      return imoveisMock.filter((imovel) =>
        imovel.lancamento === true
      );
    
    default:
      return buscarImoveisPorTipo(categoria);
  }
}

/**
 * Busca imóveis por bairro
 */
export function buscarImoveisPorBairro(bairro: string): Imovel[] {
  const bairroNormalizado = bairro.toLowerCase().replace(/-/g, ' ');
  return imoveisMock.filter((imovel) => 
    imovel.endereco?.bairro?.toLowerCase().includes(bairroNormalizado) ||
    bairroNormalizado.includes(imovel.endereco?.bairro?.toLowerCase() || '')
  );
}

/**
 * Busca imóveis por cidade
 */
export function buscarImoveisPorCidade(cidade: string): Imovel[] {
  const cidadeNormalizada = cidade.toLowerCase().replace(/-/g, ' ');
  return imoveisMock.filter((imovel) => 
    imovel.endereco?.cidade?.toLowerCase().includes(cidadeNormalizada) ||
    cidadeNormalizada.includes(imovel.endereco?.cidade?.toLowerCase() || '')
  );
}

/**
 * Busca imóveis em destaque
 */
export function buscarImoveisDestaque(): Imovel[] {
  return imoveisMock.filter((imovel) => imovel.destaque);
}

/**
 * Busca imóveis lançamento
 */
export function buscarImoveisLancamento(): Imovel[] {
  return imoveisMock.filter((imovel) => imovel.lancamento);
}

