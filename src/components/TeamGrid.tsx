"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { PhoneIcon, CheckBadgeIcon } from '@heroicons/react/24/outline';
import { teamMembers } from '@/data/team';

export const TeamGrid: React.FC = () => {
  const featured = teamMembers.filter(m => m.featured);
  const regular = teamMembers.filter(m => !m.featured);

  const handleWhatsApp = (whatsapp: string, name: string) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'team_whatsapp_click', {
        event_category: 'about',
        event_label: name
      });
    }
    window.open(`https://wa.me/${whatsapp}?text=Olá ${name.split(' ')[0]}, vim do site da Pharos!`, '_blank');
  };

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-white via-slate-50/30 to-white">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header melhorado */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-14 md:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-pharos-gold/10 border border-pharos-gold/20 mb-4 sm:mb-6">
            <div className="w-2 h-2 rounded-full bg-pharos-gold animate-pulse" />
            <span className="text-xs sm:text-sm font-semibold text-pharos-navy-900">Nossa Equipe</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-pharos-navy-900 mb-3 sm:mb-4">
            Conheça Nossa Equipe
          </h2>
          <p className="text-pharos-slate-600 text-base sm:text-lg max-w-2xl mx-auto px-4">
            Especialistas dedicados em transformar sonhos em realidade
          </p>
        </motion.div>

        {/* Grid Premium */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 md:gap-8">
          {/* Membro destaque */}
          {featured.map((member, i) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="lg:col-span-2 group"
            >
              <motion.div 
                whileHover={{ y: -8 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="relative rounded-3xl overflow-hidden h-[480px] sm:h-[520px] md:h-[550px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] hover:shadow-[0_25px_80px_-15px_rgba(0,0,0,0.4)] transition-shadow duration-500"
              >
                {/* Badge Destaque */}
                <div className="absolute top-6 right-6 z-20">
                  <div className="px-4 py-2 rounded-full bg-pharos-gold text-white text-xs font-bold uppercase tracking-wider shadow-lg backdrop-blur-sm border border-white/20">
                    ⭐ Destaque
                  </div>
                </div>

                {/* Badge Online */}
                <div className="absolute top-6 left-6 z-20">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500 text-white text-xs font-semibold shadow-lg">
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    Disponível
                  </div>
                </div>

                <div className="absolute inset-0 w-full h-full">
                  <Image 
                    src={member.photo}
                    alt={member.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
                    className="!object-cover !object-center !w-full !h-full group-hover:scale-110 transition-transform duration-700"
                    style={{ 
                      objectFit: 'cover',
                      objectPosition: 'center',
                      width: '100%',
                      height: '100%'
                    }}
                  />
                  
                  {/* Overlay escuro apenas embaixo para destacar texto */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/50 to-transparent z-10" />
                </div>
                
                {/* Content Premium */}
                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-10">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-3xl md:text-4xl font-bold text-white mb-2 leading-tight">
                        {member.name}
                      </h3>
                      <div className="flex items-center gap-3">
                        <div className="h-px flex-1 bg-gradient-to-r from-pharos-gold/60 to-transparent" />
                        <p className="text-pharos-gold text-lg font-semibold">
                          {member.role}
                        </p>
                        <div className="h-px flex-1 bg-gradient-to-l from-pharos-gold/60 to-transparent" />
                      </div>
                    </div>
                    
                    <p className="text-white/90 text-base md:text-lg leading-relaxed">
                      {member.bio}
                    </p>
                    
                    {member.creci && (
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
                          <CheckBadgeIcon className="w-5 h-5 text-pharos-gold" />
                        </div>
                        <span className="text-white/70 text-sm">{member.creci}</span>
                      </div>
                    )}
                    
                    {/* Botão Premium */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleWhatsApp(member.whatsapp, member.name)}
                      className="group/btn inline-flex items-center gap-3 px-6 py-3.5 rounded-xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold shadow-[0_8px_30px_rgba(34,197,94,0.4)] hover:shadow-[0_12px_40px_rgba(34,197,94,0.5)] transition-all duration-300"
                    >
                      <PhoneIcon className="w-5 h-5" />
                      <span>Falar com {member.name.split(' ')[0]}</span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}

          {/* Membros regulares */}
          {regular.map((member, i) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: (i + featured.length) * 0.1 }}
              className="group"
            >
              <motion.div
                whileHover={{ y: -8 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="relative rounded-3xl overflow-hidden h-[420px] sm:h-[450px] md:h-[480px] shadow-[0_15px_50px_-12px_rgba(0,0,0,0.25)] hover:shadow-[0_20px_70px_-12px_rgba(0,0,0,0.35)] transition-shadow duration-500"
              >
                {/* Badge Online */}
                <div className="absolute top-5 right-5 z-20">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500 text-white text-xs font-semibold shadow-lg">
                    <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    Online
                  </div>
                </div>

                <div className="absolute inset-0 w-full h-full">
                  <Image 
                    src={member.photo}
                    alt={member.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="!object-cover !object-center !w-full !h-full group-hover:scale-110 transition-transform duration-700"
                    style={{ 
                      objectFit: 'cover',
                      objectPosition: 'center',
                      width: '100%',
                      height: '100%'
                    }}
                  />
                  
                  {/* Overlay escuro apenas embaixo para destacar texto */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/50 to-transparent z-10" />
                </div>
                
                {/* Content Premium */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2 leading-tight">
                        {member.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <div className="h-px flex-1 bg-gradient-to-r from-pharos-gold/40 to-transparent" />
                        <p className="text-pharos-gold text-sm font-semibold uppercase tracking-wide">
                          {member.role}
                        </p>
                      </div>
                    </div>
                    
                    <p className="text-white/85 text-sm leading-relaxed line-clamp-2">
                      {member.bio}
                    </p>
                    
                    {member.creci && (
                      <div>
                        <span className="text-white/60 text-xs font-medium">{member.creci}</span>
                      </div>
                    )}
                    
                    {/* Botão Premium */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleWhatsApp(member.whatsapp, member.name)}
                      className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-sm font-bold shadow-[0_8px_25px_rgba(34,197,94,0.35)] hover:shadow-[0_10px_35px_rgba(34,197,94,0.45)] transition-all duration-300"
                    >
                      <PhoneIcon className="w-4 h-4" />
                      <span>Chamar</span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
