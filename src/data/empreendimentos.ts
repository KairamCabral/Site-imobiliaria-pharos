import type { Empreendimento } from '@/types';
import { VistaProvider } from '@/providers/vista/VistaProvider';

/**
 * Dados mockados de empreendimentos (apenas fallback de desenvolvimento)
 * Em produção, estes dados devem vir da API Vista
 */

export const empreendimentosMock: Empreendimento[] = [
  {
    id: 'emp-001',
    slug: 'residencial-gran-felicita-centro-balneario-camboriu',
    nome: 'Residencial Gran Felicità',
    descricao: 'Empreendimento de alto padrão no coração de Balneário Camboriú, com vista panorâmica para o mar e acabamento premium.',
    descricaoCompleta: `O Residencial Gran Felicità representa o que há de mais sofisticado em moradia de alto padrão em Balneário Camboriú. Localizado em posição privilegiada no Centro, o empreendimento oferece vista panorâmica deslumbrante para o mar e para a cidade.

Com arquitetura contemporânea e acabamento premium, cada detalhe foi pensado para proporcionar máximo conforto e elegância. As unidades contam com amplos ambientes, pé-direito duplo em alguns modelos, janelas do piso ao teto e varanda gourmet integrada.

O empreendimento oferece infraestrutura completa de lazer e serviços, incluindo piscinas aquecidas, academia de última geração, espaço gourmet completo, salão de festas, brinquedoteca, pet place e muito mais. A segurança 24 horas e o sistema de automação residencial garantem tranquilidade e praticidade para os moradores.`,
    
    endereco: {
      rua: 'Avenida Brasil',
      numero: '1000',
      complemento: '',
      bairro: 'Centro',
      cidade: 'Balneário Camboriú',
      estado: 'SC',
      cep: '88330-000',
      coordenadas: {
        latitude: -26.9857,
        longitude: -48.6348,
      },
    },
    
    construtora: 'FG Empreendimentos',
    incorporadora: 'FG Incorporadora',
    arquiteto: 'Studio MK27',
    status: 'em-construcao',
    dataLancamento: '2023-06-15T00:00:00.000Z',
    dataPrevisaoEntrega: '2025-12-31T00:00:00.000Z',
    
    tipoEmpreendimento: 'residencial',
    totalUnidades: 120,
    unidadesDisponiveis: 35,
    totalTorres: 2,
    andaresPorTorre: 30,
    unidadesPorAndar: 2,
    
    diferenciais: [
      'Vista panorâmica para o mar',
      'Localização privilegiada no Centro',
      'Acabamento de alto padrão',
      'Pé-direito duplo',
      'Automação residencial',
      'Sistema de energia solar',
      'Coleta seletiva de lixo',
      'Carregador para veículos elétricos',
    ],
    
    areasComuns: [
      'Hall de entrada decorado',
      'Lobby climatizado',
      'Portaria 24 horas',
      'Elevadores de alta velocidade',
      'Gerador de emergência',
      'Sistema de CFTV',
      'Controle de acesso biométrico',
    ],
    
    lazer: [
      'Piscina adulto aquecida',
      'Piscina infantil',
      'Deck molhado',
      'Sauna seca e úmida',
      'Academia completa',
      'Sala de yoga e pilates',
      'Espaço gourmet',
      'Churrasqueira',
      'Forno de pizza',
      'Adega climatizada',
      'Salão de festas',
      'Salão de jogos',
      'Brinquedoteca',
      'Pet place',
      'Playground',
      'Quadra poliesportiva',
      'Pista de cooper',
      'Jardim zen',
    ],
    
    seguranca: [
      'Segurança 24 horas',
      'Circuito fechado de TV',
      'Controle de acesso',
      'Portaria com recepção',
    ],
    
    sustentabilidade: [
      'Energia solar',
      'Captação de água da chuva',
      'Iluminação LED',
      'Coleta seletiva',
    ],
    
    imagemCapa: 'https://images.unsplash.com/photo-1501183638710-841dd1904471?w=1200&h=800&q=85&auto=format&fit=crop',
    imagemDestaque: 'https://images.unsplash.com/photo-1508435232136-1f122a38f670?w=1200&h=800&q=85&auto=format&fit=crop',
    galeria: [
      'https://images.unsplash.com/photo-1501183638710-841dd1904471?w=1200&h=800&q=85&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1529429612779-c8e40ef2f36b?w=1200&h=800&q=85&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=1200&h=800&q=85&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1501183638710-841dd1904471?w=1200&h=800&q=85&auto=format&fit=crop',
    ],
    
    videosYoutube: ['https://www.youtube.com/watch?v=dQw4w9WgXcQ'],
    tourVirtual: 'https://example.com/tour-virtual',
    folderPdf: '/pdfs/gran-felicita-folder.pdf', // URL para download do folder
    
    plantas: [
      {
        id: 'planta-001',
        titulo: 'Planta 3 Suítes - 180m²',
        descricao: 'Apartamento com 3 suítes, varanda gourmet e 2 vagas',
        imagem: 'https://images.unsplash.com/photo-1503174971373-b1f69850bded?w=800&h=600&q=80',
        metragem: 180,
        quartos: 3,
        suites: 3,
        banheiros: 3,
        vagas: 2,
        precoDesde: 2800000,
      },
      {
        id: 'planta-002',
        titulo: 'Planta 4 Suítes - 220m²',
        descricao: 'Apartamento com 4 suítes, varanda gourmet ampliada e 3 vagas',
        imagem: 'https://images.unsplash.com/photo-1503174971373-b1f69850bded?w=800&h=600&q=80',
        metragem: 220,
        quartos: 4,
        suites: 4,
        banheiros: 4,
        vagas: 3,
        precoDesde: 3500000,
      },
    ],
    
    precoDesde: 2800000,
    precoAte: 5200000,
    areaDesde: 180,
    areaAte: 280,
    
    metaTitle: 'Residencial Gran Felicità - Apartamentos de Alto Padrão em Balneário Camboriú',
    metaDescription: 'Empreendimento de luxo no Centro de Balneário Camboriú com vista para o mar. Apartamentos de 180m² a 280m² com acabamento premium e lazer completo.',
    keywords: ['apartamento balneário camboriú', 'alto padrão', 'frente mar', 'residencial gran felicità', 'empreendimento luxo'],
    
    imoveisIds: ['imovel-01', 'imovel-08', 'imovel-10'],
    
    visualizacoes: 3450,
    
    createdAt: '2023-06-15T10:00:00.000Z',
    updatedAt: '2024-01-10T15:30:00.000Z',
  },
  
  {
    id: 'emp-002',
    slug: 'terrazze-residence-barra-sul-balneario-camboriu',
    nome: 'Terrazze Residence',
    descricao: 'Empreendimento exclusivo na Barra Sul com design italiano, unidades amplas e vista privilegiada.',
    descricaoCompleta: `O Terrazze Residence traz toda a sofisticação e elegância do design italiano para a Barra Sul de Balneário Camboriú. Com apenas 4 unidades por andar, o empreendimento garante privacidade e exclusividade incomparáveis.

As unidades contam com metragens generosas a partir de 200m², ambientes amplos e integrados, acabamento com materiais importados e tecnologia de ponta. As varandas em L proporcionam vista panorâmica para o mar e para a cidade.

O projeto arquitetônico é assinado pelo renomado escritório italiano Renzo Piano, trazendo linhas contemporâneas e soluções inovadoras. O empreendimento oferece infraestrutura de lazer completa, incluindo rooftop exclusivo com piscina infinity, lounge bar e espaço gourmet.`,
    
    endereco: {
      rua: 'Avenida Atlântica',
      numero: '2500',
      complemento: '',
      bairro: 'Barra Sul',
      cidade: 'Balneário Camboriú',
      estado: 'SC',
      cep: '88330-000',
      coordenadas: {
        latitude: -26.9950,
        longitude: -48.6250,
      },
    },
    
    construtora: 'Belluno Construtora',
    incorporadora: 'Belluno Incorporadora',
    arquiteto: 'Renzo Piano Building Workshop',
    status: 'lancamento',
    dataLancamento: '2024-01-20T00:00:00.000Z',
    dataPrevisaoEntrega: '2026-06-30T00:00:00.000Z',
    
    tipoEmpreendimento: 'residencial',
    totalUnidades: 60,
    unidadesDisponiveis: 58,
    totalTorres: 1,
    andaresPorTorre: 15,
    unidadesPorAndar: 4,
    
    diferenciais: [
      'Design italiano exclusivo',
      'Apenas 4 unidades por andar',
      'Materiais importados',
      'Rooftop com piscina infinity',
      'Vista mar garantida',
      'Acabamento Armani Casa',
      'Home theater privativo',
      'Adega climatizada individual',
    ],
    
    areasComuns: [
      'Hall assinado por designer italiano',
      'Lobby com pé-direito triplo',
      'Concierge 24 horas',
      'Elevadores Schindler',
      'Valet parking',
    ],
    
    lazer: [
      'Rooftop exclusivo',
      'Piscina infinity aquecida',
      'Lounge bar',
      'Espaço gourmet premium',
      'Wine bar',
      'Academia Technogym',
      'Spa com sauna e massagem',
      'Sala de cinema privativa',
      'Business center',
      'Coworking',
      'Salão de beleza',
      'Pet spa',
    ],
    
    seguranca: [
      'Segurança armada 24h',
      'Reconhecimento facial',
      'Sistema anti-intrusão',
      'Monitoramento inteligente',
    ],
    
    sustentabilidade: [
      'Certificação LEED Gold',
      'Painéis solares',
      'Sistema de reuso de água',
      'Automação inteligente',
    ],
    
    imagemCapa: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1200&h=800&q=85&auto=format&fit=crop',
    galeria: [
      'https://images.unsplash.com/photo-1503354201635-4d8f2f0b6d70?w=1200&h=800&q=85&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=1200&h=800&q=85&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1460317442991-0ec209397118?w=1200&h=800&q=85&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1460317442991-0ec209397118?w=1200&h=800&q=85&auto=format&fit=crop',
    ],
    
    plantas: [
      {
        id: 'planta-003',
        titulo: 'Planta 4 Suítes - 200m²',
        imagem: 'https://images.unsplash.com/photo-1503174971373-b1f69850bded?w=800&h=600&q=80',
        metragem: 200,
        quartos: 4,
        suites: 4,
        banheiros: 5,
        vagas: 3,
        precoDesde: 4500000,
      },
    ],
    
    precoDesde: 4500000,
    precoAte: 8500000,
    areaDesde: 200,
    areaAte: 350,
    
    metaTitle: 'Terrazze Residence - Lançamento de Luxo na Barra Sul',
    metaDescription: 'Empreendimento exclusivo com design italiano na Barra Sul. Apenas 4 unidades por andar, rooftop com piscina infinity e acabamento Armani Casa.',
    keywords: ['terrazze residence', 'lançamento balneário camboriú', 'barra sul', 'alto padrão', 'design italiano'],
    
    imoveisIds: [],
    
    visualizacoes: 1250,
    
    createdAt: '2024-01-20T10:00:00.000Z',
    updatedAt: '2024-01-20T10:00:00.000Z',
  },
  
  {
    id: 'emp-003',
    slug: 'villa-del-mare-pioneiros-balneario-camboriu',
    nome: 'Villa Del Mare',
    descricao: 'Condomínio residencial no bairro Pioneiros com casas de alto padrão e infraestrutura completa.',
    descricaoCompleta: `O Villa Del Mare é um condomínio horizontal exclusivo no bairro Pioneiros, oferecendo casas de alto padrão em um ambiente seguro e sofisticado. Com apenas 24 casas, o empreendimento garante privacidade e qualidade de vida.

Cada casa foi projetada com arquitetura contemporânea, aproveitamento inteligente dos espaços e acabamento de primeira linha. Os terrenos variam de 400m² a 600m², permitindo amplas áreas de lazer privativas com piscina, churrasqueira e jardim.

O condomínio oferece infraestrutura completa com área de lazer, segurança 24 horas e proximidade às principais praias e ao centro de Balneário Camboriú. Perfeito para famílias que buscam conforto, segurança e qualidade de vida.`,
    
    endereco: {
      rua: 'Rua das Acácias',
      numero: '1500',
      complemento: 'Condomínio Fechado',
      bairro: 'Pioneiros',
      cidade: 'Balneário Camboriú',
      estado: 'SC',
      cep: '88330-000',
      coordenadas: {
        latitude: -26.9750,
        longitude: -48.6400,
      },
    },
    
    construtora: 'Costa Verde Construções',
    status: 'pronto',
    dataLancamento: '2021-03-10T00:00:00.000Z',
    dataEntrega: '2023-11-30T00:00:00.000Z',
    
    tipoEmpreendimento: 'residencial',
    totalUnidades: 24,
    unidadesDisponiveis: 3,
    
    diferenciais: [
      'Condomínio horizontal exclusivo',
      'Apenas 24 casas',
      'Terrenos de 400m² a 600m²',
      'Arquitetura contemporânea',
      'Piscina privativa em cada casa',
      'Bairro nobre e tranquilo',
      'Proximidade às praias',
    ],
    
    areasComuns: [
      'Portaria com controle de acesso',
      'Guarita 24 horas',
      'Ruas internas arborizadas',
      'Iluminação decorativa',
    ],
    
    lazer: [
      'Clube recreativo',
      'Piscina adulto e infantil',
      'Quadra poliesportiva',
      'Churrasqueira coletiva',
      'Playground',
      'Salão de festas',
      'Academia',
    ],
    
    seguranca: [
      'Segurança 24 horas',
      'Controle de acesso',
      'Câmeras de monitoramento',
      'Ronda motorizada',
    ],
    
    imagemCapa: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=800&q=85&auto=format&fit=crop',
    galeria: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=800&q=85&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&h=800&q=85&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&h=800&q=85&auto=format&fit=crop',
    ],
    
    plantas: [],
    
    precoDesde: 2900000,
    precoAte: 4200000,
    areaDesde: 300,
    areaAte: 450,
    
    metaTitle: 'Villa Del Mare - Casas de Alto Padrão no Pioneiros',
    metaDescription: 'Condomínio horizontal exclusivo com 24 casas no bairro Pioneiros. Terrenos de até 600m², piscina privativa e infraestrutura completa.',
    keywords: ['villa del mare', 'casas balneário camboriú', 'pioneiros', 'condomínio fechado', 'casa alto padrão'],
    
    imoveisIds: ['imovel-03'],
    
    visualizacoes: 2100,
    
    createdAt: '2021-03-10T10:00:00.000Z',
    updatedAt: '2023-12-01T15:30:00.000Z',
  },
];

/**
 * Busca empreendimento por slug
 */
const vistaProvider = new VistaProvider();

export async function listarEmpreendimentos(options?: {
  search?: string;
  status?: string;
  sortBy?: 'price' | 'area' | 'updatedAt' | 'name';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}): Promise<{ items: Empreendimento[]; total: number; pagina: number; paginas: number }> {
  const apiKey = process.env.VISTA_API_KEY;
  const baseUrl = process.env.VISTA_BASE_URL;
  const shouldUseMock = !apiKey || !baseUrl;

  if (shouldUseMock) {
    console.log('[empreendimentos] Sem API configurada → usando mocks');
    return {
      items: empreendimentosMock,
      total: empreendimentosMock.length,
      pagina: 1,
      paginas: 1,
    };
  }

  try {
    // Estratégia híbrida: buscar cadastros diretos (categoria "Empreendimento")
    console.log('[empreendimentos] Buscando cadastros diretos (categoria Empreendimento)...');
    const diretos = await vistaProvider.listEmpreendimentosDiretos(options);
    
    if (diretos.items.length > 0) {
      console.log(`[empreendimentos] ✓ ${diretos.items.length} empreendimento(s) direto(s) encontrado(s)`);
      return diretos;
    }
    
    // Se não houver cadastros diretos, tentar agrupamento de unidades
    console.log('[empreendimentos] Nenhum cadastro direto, tentando agrupamento de unidades...');
    const agrupados = await vistaProvider.listEmpreendimentosFromImoveis(options);
    console.log(`[empreendimentos] ✓ ${agrupados.items.length} empreendimento(s) agrupado(s) de unidades`);
    return agrupados;
    
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('[empreendimentos] Erro ao buscar empreendimentos:', errorMsg);
    
    // Tentar fallback de agrupamento
    try {
      console.log('[empreendimentos] Tentando fallback de agrupamento...');
      const agrupados = await vistaProvider.listEmpreendimentosFromImoveis(options);
      console.log(`[empreendimentos] ✓ Fallback: ${agrupados.items.length} empreendimento(s)`);
      return agrupados;
    } catch (fallbackError) {
      console.error('[empreendimentos] Fallback falhou:', fallbackError instanceof Error ? fallbackError.message : fallbackError);
      console.warn('[empreendimentos] Usando mocks como última opção');
      return {
        items: empreendimentosMock,
        total: empreendimentosMock.length,
        pagina: 1,
        paginas: 1,
      };
    }
  }
}

export async function buscarEmpreendimentoPorSlug(slug: string): Promise<Empreendimento | undefined> {
  const apiKey = process.env.VISTA_API_KEY;
  const baseUrl = process.env.VISTA_BASE_URL;

  if (!apiKey || !baseUrl) {
    return empreendimentosMock.find((emp) => emp.slug === slug);
  }

  try {
    // 1) Buscar em cadastros diretos (categoria "Empreendimento")
    console.log(`[empreendimentos] Buscando "${slug}" em cadastros diretos...`);
    const diretos = await vistaProvider.listEmpreendimentosDiretos({ page: 1, limit: 50 });
    const matchDireto = diretos.items.find((emp) => emp.slug.toLowerCase() === slug.toLowerCase());
    if (matchDireto) {
      console.log(`[empreendimentos] ✓ Encontrado em cadastro direto: ${matchDireto.nome}`);
      return matchDireto;
    }

    // 2) Se não encontrar, buscar em agrupamentos
    console.log(`[empreendimentos] Buscando "${slug}" em agrupamentos...`);
    const agrupados = await vistaProvider.listEmpreendimentosFromImoveis({ page: 1, limit: 500 });
    const matchAgrupado = agrupados.items.find((emp) => emp.slug.toLowerCase() === slug.toLowerCase());
    if (matchAgrupado) {
      console.log(`[empreendimentos] ✓ Encontrado em agrupamento: ${matchAgrupado.nome}`);
      return matchAgrupado;
    }

    console.log(`[empreendimentos] ✗ "${slug}" não encontrado`);
  } catch (error) {
    console.error('[empreendimentos] Erro ao buscar por slug:', error instanceof Error ? error.message : error);
  }

  // Fallback para mock
  return empreendimentosMock.find((emp) => emp.slug === slug);
}

export async function buscarEmpreendimentoPorId(id: string): Promise<Empreendimento | undefined> {
  try {
    const list = await vistaProvider.listEmpreendimentos({ page: 1, limit: 50 });
    const found = list.items.find((emp) => emp.id === id);
    if (found) return found;
  } catch (error) {
    console.warn('[empreendimentos] Fallback id via mock.', error instanceof Error ? error.message : error);
  }
  return empreendimentosMock.find((emp) => emp.id === id);
}

