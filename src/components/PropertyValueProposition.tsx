/**
 * PropertyValueProposition
 * Destaca os diferenciais únicos do imóvel com cards visuais impactantes
 * Baseado em psicologia de persuasão e hierarquia visual
 */

'use client';

import { motion } from 'framer-motion';
import { 
  Waves, 
  Sun, 
  Hammer, 
  MapPin, 
  Umbrella, 
  TrendingUp,
  Home,
  Sparkles,
  Shield,
  Award,
  Clock,
  Heart
} from 'lucide-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';

interface Highlight {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string; // Tailwind gradient classes
  iconBg: string; // Background color for icon
}

interface PropertyValuePropositionProps {
  highlights: Highlight[];
  className?: string;
}

export default function PropertyValueProposition({ 
  highlights, 
  className = '' 
}: PropertyValuePropositionProps) {
  const containerRef = useScrollReveal<HTMLElement>({
    threshold: 0.1,
    triggerOnce: true,
  });

  if (!highlights || highlights.length === 0) {
    return null;
  }

  return (
    <section
      ref={containerRef}
      className={`py-12 lg:py-16 opacity-0 transition-opacity duration-700 ${className}`}
      style={{
        '--stagger-delay': '100ms',
      } as React.CSSProperties}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10 lg:mb-14">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl lg:text-4xl font-light text-pharos-navy-900 mb-3"
          >
            Diferenciais deste Imóvel
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-pharos-slate-600 text-lg max-w-2xl mx-auto"
          >
            Características que tornam este imóvel único
          </motion.p>
        </div>

        {/* Grid de Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {highlights.map((highlight, index) => (
            <HighlightCard
              key={highlight.id}
              highlight={highlight}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Card individual de highlight
 */
function HighlightCard({ 
  highlight, 
  index 
}: { 
  highlight: Highlight; 
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
      whileHover={{ 
        y: -8,
        transition: { duration: 0.2 }
      }}
      className="group relative bg-white rounded-2xl p-6 lg:p-8 shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100"
    >
      {/* Gradient Background (hover effect) */}
      <div 
        className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 ${highlight.gradient}`}
      />

      {/* Icon Container */}
      <div className={`relative inline-flex items-center justify-center w-14 h-14 lg:w-16 lg:h-16 rounded-xl ${highlight.iconBg} mb-4 lg:mb-6 group-hover:scale-110 transition-transform duration-300`}>
        <div className="text-white scale-75 lg:scale-100">
          {highlight.icon}
        </div>
      </div>

      {/* Content */}
      <div className="relative">
        <h3 className="text-xl lg:text-2xl font-semibold text-pharos-navy-900 mb-2 group-hover:text-pharos-blue-600 transition-colors">
          {highlight.title}
        </h3>
        <p className="text-pharos-slate-600 text-sm lg:text-base leading-relaxed">
          {highlight.description}
        </p>
      </div>

      {/* Decorative corner */}
      <div className="absolute top-0 right-0 w-20 h-20 transform translate-x-10 -translate-y-10">
        <div className={`w-full h-full rounded-full ${highlight.gradient} opacity-10 blur-xl`} />
      </div>
    </motion.div>
  );
}

/**
 * Factory para criar highlights baseado em dados do imóvel
 */
export function createPropertyHighlights(property: {
  distanciaMar?: number;
  features?: Record<string, boolean>;
  pricing?: { sale?: number };
  specs?: { privateArea?: number };
  address?: { neighborhood?: string };
  updatedAt?: string | Date;
  [key: string]: any;
}): Highlight[] {
  const highlights: Highlight[] = [];

  // Distância do mar
  if (property.distanciaMar && property.distanciaMar <= 300) {
    highlights.push({
      id: 'prox-mar',
      icon: <Waves className="w-7 h-7" />,
      title: `${property.distanciaMar}m do Mar`,
      description: property.distanciaMar <= 100 
        ? 'Localização privilegiada na orla' 
        : 'Poucos minutos a pé da praia',
      gradient: 'bg-gradient-to-br from-blue-500 to-cyan-500',
      iconBg: 'bg-gradient-to-br from-blue-500 to-cyan-500',
    });
  }

  // Vista para o mar
  if (property.features?.oceanView || property.features?.vistaMar) {
    highlights.push({
      id: 'vista-mar',
      icon: <Sun className="w-7 h-7" />,
      title: 'Vista para o Mar',
      description: 'Visual panorâmico do oceano Atlântico',
      gradient: 'bg-gradient-to-br from-amber-500 to-orange-500',
      iconBg: 'bg-gradient-to-br from-amber-500 to-orange-500',
    });
  }

  // Reformado recentemente
  const currentYear = new Date().getFullYear();
  const updatedYear = property.updatedAt ? new Date(property.updatedAt).getFullYear() : null;
  if (updatedYear && currentYear - updatedYear <= 2) {
    highlights.push({
      id: 'reformado',
      icon: <Hammer className="w-7 h-7" />,
      title: `Reformado ${updatedYear}`,
      description: 'Acabamentos modernos e bem conservado',
      gradient: 'bg-gradient-to-br from-emerald-500 to-teal-500',
      iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-500',
    });
  }

  // Mobiliado
  if (property.features?.furnished) {
    highlights.push({
      id: 'mobiliado',
      icon: <Home className="w-7 h-7" />,
      title: 'Totalmente Mobiliado',
      description: 'Pronto para morar ou investir',
      gradient: 'bg-gradient-to-br from-purple-500 to-pink-500',
      iconBg: 'bg-gradient-to-br from-purple-500 to-pink-500',
    });
  }

  // Localização premium (bairros nobres)
  const premiumNeighborhoods = ['centro', 'barra sul', 'pioneiros', 'nações'];
  const neighborhood = property.address?.neighborhood;
  const normalizedNeighborhood = neighborhood?.toLowerCase();
  if (normalizedNeighborhood && premiumNeighborhoods.some((n) => normalizedNeighborhood.includes(n))) {
    highlights.push({
      id: 'localizacao',
      icon: <MapPin className="w-7 h-7" />,
      title: 'Localização Premium',
      description: neighborhood ? `No coração de ${neighborhood}` : 'Localização privilegiada',
      gradient: 'bg-gradient-to-br from-violet-500 to-purple-500',
      iconBg: 'bg-gradient-to-br from-violet-500 to-purple-500',
    });
  }

  // Box de praia (característica única de BC)
  if (property.features?.beachBox) {
    highlights.push({
      id: 'beach-box',
      icon: <Umbrella className="w-7 h-7" />,
      title: 'Box de Praia',
      description: 'Espaço exclusivo para guardar pertences na praia',
      gradient: 'bg-gradient-to-br from-orange-500 to-red-500',
      iconBg: 'bg-gradient-to-br from-orange-500 to-red-500',
    });
  }

  // Alto potencial de valorização
  if (property.distanciaMar && property.distanciaMar <= 200) {
    highlights.push({
      id: 'valorizacao',
      icon: <TrendingUp className="w-7 h-7" />,
      title: 'Alta Valorização',
      description: 'Potencial de valorização acima da média',
      gradient: 'bg-gradient-to-br from-green-500 to-emerald-500',
      iconBg: 'bg-gradient-to-br from-green-500 to-emerald-500',
    });
  }

  // Acabamento de luxo
  if (property.pricing?.sale && property.specs?.privateArea) {
    const pricePerM2 = property.pricing.sale / property.specs.privateArea;
    if (pricePerM2 > 15000) {
      highlights.push({
        id: 'premium',
        icon: <Sparkles className="w-7 h-7" />,
        title: 'Acabamento Premium',
        description: 'Materiais nobres e design sofisticado',
        gradient: 'bg-gradient-to-br from-yellow-500 to-amber-500',
        iconBg: 'bg-gradient-to-br from-yellow-500 to-amber-500',
      });
    }
  }

  // Condomínio completo
  const amenitiesCount = property.features 
    ? Object.values(property.features).filter(Boolean).length 
    : 0;
  if (amenitiesCount >= 5) {
    highlights.push({
      id: 'amenidades',
      icon: <Award className="w-7 h-7" />,
      title: 'Área de Lazer Completa',
      description: `${amenitiesCount} comodidades no condomínio`,
      gradient: 'bg-gradient-to-br from-indigo-500 to-blue-500',
      iconBg: 'bg-gradient-to-br from-indigo-500 to-blue-500',
    });
  }

  // Segurança
  if (property.features?.gatedCommunity || property.features?.alarm) {
    highlights.push({
      id: 'seguranca',
      icon: <Shield className="w-7 h-7" />,
      title: 'Segurança 24h',
      description: 'Condomínio fechado com monitoramento',
      gradient: 'bg-gradient-to-br from-slate-600 to-slate-800',
      iconBg: 'bg-gradient-to-br from-slate-600 to-slate-800',
    });
  }

  // Pronto para morar
  if (!property.construction || property.construction.status === 'pronto') {
    highlights.push({
      id: 'pronto',
      icon: <Clock className="w-7 h-7" />,
      title: 'Pronto para Morar',
      description: 'Escritura registrada e quitado',
      gradient: 'bg-gradient-to-br from-teal-500 to-cyan-500',
      iconBg: 'bg-gradient-to-br from-teal-500 to-cyan-500',
    });
  }

  // Limitar a 6 highlights principais
  return highlights.slice(0, 6);
}

/**
 * Helper: Ícones disponíveis para highlights
 */
export const HighlightIcons = {
  Waves,
  Sun,
  Hammer,
  MapPin,
  Umbrella,
  TrendingUp,
  Home,
  Sparkles,
  Shield,
  Award,
  Clock,
  Heart,
};

