export interface Testimonial {
  id: string;
  name: string;
  role: string;
  text: string;
  photo: string;
  rating: number;
}

export const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Ricardo Mendes',
    role: 'Empresário',
    text: 'A Pharos superou todas as minhas expectativas. Encontrei o apartamento perfeito com vista para o mar em tempo recorde. Atendimento impecável e profissionalismo do início ao fim.',
    photo: '/images/depoimentos/cliente-1.jpg',
    rating: 5
  },
  {
    id: '2',
    name: 'Marina Costa',
    role: 'Investidora',
    text: 'Excelente assessoria para investimento imobiliário. A equipe da Pharos me ajudou a identificar as melhores oportunidades em Balneário Camboriú. Retorno acima do esperado!',
    photo: '/images/depoimentos/cliente-2.jpg',
    rating: 5
  },
  {
    id: '3',
    name: 'Fernando Silva',
    role: 'Médico',
    text: 'Profissionais extremamente competentes e atenciosos. Toda a documentação e processo de compra foram conduzidos com total transparência. Recomendo sem ressalvas!',
    photo: '/images/depoimentos/cliente-3.jpg',
    rating: 5
  },
  {
    id: '4',
    name: 'Juliana Santos',
    role: 'Arquiteta',
    text: 'A Pharos me ajudou a encontrar o imóvel ideal para minha família. O atendimento personalizado e o conhecimento profundo do mercado fizeram toda a diferença.',
    photo: '/images/depoimentos/cliente-1.jpg',
    rating: 5
  },
  {
    id: '5',
    name: 'Pedro Oliveira',
    role: 'Empresário',
    text: 'Já realizei três negócios com a Pharos e sempre fui muito bem atendido. Confiança, agilidade e resultados - essa é a Pharos!',
    photo: '/images/depoimentos/cliente-2.jpg',
    rating: 5
  }
];

