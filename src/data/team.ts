export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  whatsapp: string;
  email?: string;
  creci?: string;
  photo: string;
  featured?: boolean;
}

export const teamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Luiz Siega',
    role: 'Consultor Imobiliário',
    bio: 'Especialista em imóveis de alto padrão com vasta experiência no mercado de Balneário Camboriú. Atendimento personalizado e foco em resultados.',
    whatsapp: '5547992017406',
    email: 'luiz@pharosnegocios.com.br',
    creci: 'CRECI/SC 67507-F',
    photo: '/images/equipe/Perfil Luiz.jpg'
  },
  {
    id: '2',
    name: 'Nelli Ramos',
    role: 'Consultora Imobiliária',
    bio: 'Consultora especializada em imóveis de luxo e empreendimentos exclusivos. Comprometida em encontrar o imóvel perfeito para cada cliente.',
    whatsapp: '5547999345150',
    email: 'nelli@pharosnegocios.com.br',
    creci: 'CRECI/SC 29781-F',
    photo: '/images/equipe/Perfil Nelli.jpg'
  },
  {
    id: '3',
    name: 'Carlos Machado',
    role: 'Consultor Imobiliário',
    bio: 'Profundo conhecedor do mercado local com foco em investimentos imobiliários de alto retorno e imóveis premium.',
    whatsapp: '5547996273000',
    email: 'carlos@pharosnegocios.com.br',
    creci: 'CRECI/SC 31685-F',
    photo: '/images/equipe/Carlos Machado.png'
  },
  {
    id: '4',
    name: 'Leila Denise Schiavini Siega',
    role: 'Consultora Imobiliária',
    bio: 'Especialista em atendimento personalizado e negociações de alto padrão. Dedicação total para realizar o sonho do cliente.',
    whatsapp: '5547988620023',
    email: 'leila@pharosnegocios.com.br',
    creci: 'CRECI/SC 9155-F',
    photo: '/images/equipe/Leila.jpg'
  },
  {
    id: '5',
    name: 'Julie Gessner',
    role: 'Consultora Imobiliária',
    bio: 'Consultora com ampla experiência em imóveis de luxo e empreendimentos de alto padrão em Balneário Camboriú.',
    whatsapp: '5547999806999',
    email: 'julie@pharosnegocios.com.br',
    creci: 'CRECI/SC 40723-F',
    photo: '/images/equipe/Perfil Julie.jpg'
  },
  {
    id: '6',
    name: 'Luciane Gamba',
    role: 'Consultora Imobiliária',
    bio: 'Profissional experiente focada em proporcionar a melhor experiência aos clientes na busca pelo imóvel ideal.',
    whatsapp: '5547996094770',
    email: 'luciane@pharosnegocios.com.br',
    creci: 'CRECI/SC 46383-F',
    photo: '/images/equipe/Perfil Luciane Gamba.jpg'
  }
];

