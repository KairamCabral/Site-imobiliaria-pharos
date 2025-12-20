"use client";

import React from 'react';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  focus: string;
  photo: string;
  whatsapp: string;
}

const team: TeamMember[] = [
  {
    id: '1',
    name: 'Carolina Mendes',
    role: 'Consultora Sênior',
    focus: 'Alto padrão e lançamentos',
    photo: '/images/placeholders/avatar-placeholder.svg',
    whatsapp: '5547999999991'
  },
  {
    id: '2',
    name: 'Roberto Santos',
    role: 'Especialista Comercial',
    focus: 'Imóveis frente mar',
    photo: '/images/placeholders/avatar-placeholder.svg',
    whatsapp: '5547999999992'
  },
  {
    id: '3',
    name: 'Juliana Costa',
    role: 'Consultora de Locação',
    focus: 'Locações corporativas',
    photo: '/images/placeholders/avatar-placeholder.svg',
    whatsapp: '5547999999993'
  },
  {
    id: '4',
    name: 'Fernando Lima',
    role: 'Consultor de Investimentos',
    focus: 'Oportunidades e parcerias',
    photo: '/images/placeholders/avatar-placeholder.svg',
    whatsapp: '5547999999994'
  },
];

export const TeamSection: React.FC = () => {
  const handleWhatsApp = (phone: string, name: string) => {
    // Track event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'contact_team_whatsapp_click', {
        event_category: 'contact',
        team_member: name
      });
    }

    window.open(`https://wa.me/${phone}?text=Olá ${name}, vim do site da Pharos!`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-pharos-navy-900 mb-2">
          Fale com nossos especialistas
        </h2>
        <p className="text-pharos-slate-500">
          Conecte-se diretamente com quem mais entende do que você precisa
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {team.map((member) => (
          <div
            key={member.id}
            className="bg-white rounded-xl border border-pharos-slate-300 p-4 hover:shadow-lg transition-all duration-200 flex items-center gap-4"
          >
            <div className="w-16 h-16 rounded-full bg-pharos-slate-300 overflow-hidden flex-shrink-0">
              <img
                src={member.photo}
                alt={member.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-pharos-navy-900 text-base truncate">
                {member.name}
              </h3>
              <p className="text-sm text-pharos-slate-500 truncate">
                {member.role}
              </p>
              <p className="text-sm text-pharos-blue-500 font-medium truncate">
                {member.focus}
              </p>
            </div>

            <button
              onClick={() => handleWhatsApp(member.whatsapp, member.name)}
              className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white hover:bg-green-600 transition-colors flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              aria-label={`Falar com ${member.name} no WhatsApp`}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Confiança e selos */}
      <div className="bg-pharos-offwhite rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <svg key={i} width="20" height="20" viewBox="0 0 24 24" fill="#C89C4D">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            ))}
          </div>
          <span className="text-sm font-medium text-pharos-slate-700">
            Excelência certificada
          </span>
        </div>

        <p className="text-sm text-pharos-slate-500 leading-relaxed">
          "A Pharos nos ajudou a encontrar o imóvel perfeito em tempo recorde. 
          Profissionalismo e atenção aos detalhes impecáveis."
        </p>

        <div className="flex items-center gap-4 pt-4 border-t border-pharos-slate-300">
          <div className="text-xs text-pharos-slate-500 font-medium">
            CRECI-SC 12345-J
          </div>
          <div className="w-px h-4 bg-pharos-slate-300"></div>
          <div className="text-xs text-pharos-slate-500 font-medium">
            Secovi Associado
          </div>
        </div>
      </div>
    </div>
  );
};

