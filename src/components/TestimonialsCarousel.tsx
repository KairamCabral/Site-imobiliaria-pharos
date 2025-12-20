"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import { StarIcon } from '@heroicons/react/24/solid';
import { testimonials } from '@/data/testimonials';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';

export const TestimonialsCarousel: React.FC = () => {
  return (
    <section className="py-20 bg-pharos-offwhite">
      <div className="container max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="w-16 h-0.5 bg-pharos-gold mx-auto mb-6" />
          <h2 className="text-4xl font-bold text-pharos-navy-900 mb-4">
            O que dizem nossos clientes
          </h2>
          <p className="text-pharos-slate-700 text-lg max-w-2xl mx-auto">
            Confiança construída através de resultados e excelência no atendimento
          </p>
        </motion.div>

        <Swiper
          modules={[Pagination]}
          spaceBetween={30}
          slidesPerView={1}
          pagination={{ clickable: true }}
          breakpoints={{
            640: {
              slidesPerView: 1,
            },
            768: {
              slidesPerView: 2,
            },
            1024: {
              slidesPerView: 3,
            },
          }}
          className="!pb-12"
        >
          {testimonials.map((item) => (
            <SwiperSlide key={item.id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 h-full"
              >
                {/* Estrelas */}
                <div className="flex gap-1 mb-4">
                  {[...Array(item.rating)].map((_, i) => (
                    <StarIcon key={i} className="w-5 h-5 text-pharos-gold fill-pharos-gold" />
                  ))}
                </div>
                
                {/* Texto */}
                <p className="text-pharos-slate-700 leading-relaxed mb-6 italic text-base">
                  "{item.text}"
                </p>
                
                {/* Autor */}
                <div className="pt-4 border-t border-pharos-slate-300">
                  <p className="font-semibold text-pharos-navy-900">
                    {item.name}
                  </p>
                  <p className="text-sm text-pharos-slate-500">
                    {item.role}
                  </p>
                </div>
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <style jsx global>{`
        .swiper-pagination-bullet {
          background: var(--ph-slate-300);
          opacity: 1;
        }
        .swiper-pagination-bullet-active {
          background: var(--ph-blue-500);
        }
      `}</style>
    </section>
  );
};

