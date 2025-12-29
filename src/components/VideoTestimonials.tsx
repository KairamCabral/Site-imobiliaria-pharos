"use client";

import React, { useRef, useState, useEffect, createContext, useContext } from 'react';
import { motion } from 'framer-motion';
import { PlayIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/solid';

interface VideoTestimonial {
  id: number;
  videoUrl: string;
  nome: string;
  cargo: string;
}

const depoimentos: VideoTestimonial[] = [
  {
    id: 1,
    videoUrl: '/videos/depoimentos/Depoimento 1.mp4',
    nome: 'Gisele Darós',
    cargo: 'Nutricionista E Proprietária da Gi Clinic de BC',
  },
  {
    id: 2,
    videoUrl: '/videos/depoimentos/Depoimento 2.mp4',
    nome: 'Yasmin Meireles',
    cargo: 'Modelo, bailarina e Diretora do Yasmin Meireles Dance',
  },
  {
    id: 3,
    videoUrl: '/videos/depoimentos/Depoimento 3.mp4',
    nome: 'Caroline Sampaio',
    cargo: 'Educadora Física',
  },
  {
    id: 4,
    videoUrl: '/videos/depoimentos/Depoimento 4.mp4',
    nome: 'Leandro Gamba',
    cargo: 'Administrador e Investidor',
  },
];

// Context para controlar qual vídeo tem som ativo
interface VideoAudioContextType {
  activeAudioId: number | null;
  setActiveAudioId: (id: number | null) => void;
}

const VideoAudioContext = createContext<VideoAudioContextType>({
  activeAudioId: null,
  setActiveAudioId: () => {},
});

interface VideoCardProps {
  depoimento: VideoTestimonial;
  isInView: boolean;
}

const VideoCard: React.FC<VideoCardProps> = ({ depoimento, isInView }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [progress, setProgress] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const { activeAudioId, setActiveAudioId } = useContext(VideoAudioContext);
  
  // Este vídeo tem som ativo?
  const hasActiveAudio = activeAudioId === depoimento.id;
  const isMuted = !hasActiveAudio;

  // Auto-play quando o card entrar na viewport
  useEffect(() => {
    if (isInView && videoRef.current) {
      if (!isPaused) {
        videoRef.current.play().catch(() => {
          // Autoplay bloqueado pelo navegador
        });
      }
    } else if (!isInView && videoRef.current) {
      videoRef.current.pause();
      setIsPaused(false); // Reset ao sair da viewport
    }
  }, [isInView, isPaused]);

  // Sincronizar mute com o estado global
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Atualizar progresso do vídeo
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => {
      const progress = (video.currentTime / video.duration) * 100;
      setProgress(progress);
    };

    video.addEventListener('timeupdate', updateProgress);
    return () => video.removeEventListener('timeupdate', updateProgress);
  }, []);

  const handlePlayPause = () => {
    if (!videoRef.current) return;
    
    if (isPaused) {
      // Se está pausado, volta a tocar
      videoRef.current.play();
      setIsPaused(false);
    } else if (hasActiveAudio) {
      // Se está tocando com som, pausa
      videoRef.current.pause();
      setIsPaused(true);
    } else {
      // Se está tocando sem som, ativa o som e recomeça do início
      videoRef.current.currentTime = 0;
      setActiveAudioId(depoimento.id);
      videoRef.current.play();
      setIsPaused(false);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (hasActiveAudio) {
      // Se este vídeo tem som, desativa
      setActiveAudioId(null);
    } else {
      // Se não tem som, ativa (e desativa os outros)
      setActiveAudioId(depoimento.id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="relative w-full h-full group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Container do vídeo com aspect ratio 9:16 (vertical) */}
      <div className="relative w-full aspect-[9/16] rounded-3xl overflow-hidden bg-pharos-navy-900 shadow-2xl">
        {/* Vídeo */}
        <video
          ref={videoRef}
          src={depoimento.videoUrl}
          className="absolute inset-0 w-full h-full object-cover cursor-pointer"
          loop
          muted={isMuted}
          playsInline
          preload="none"
          loading="lazy"
          onClick={handlePlayPause}
        />

        {/* Overlay gradiente inferior */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />

        {/* Barra de progresso */}
        <div className="absolute top-4 left-4 right-4 h-1 bg-white/20 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-white rounded-full"
            style={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>

        {/* Botão Play/Pause - Lógica inteligente de visibilidade */}
        {/* Aparece SEMPRE quando pausado, ou no HOVER quando rodando */}
        {(isPaused || (isHovered && !isPaused)) && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-in fade-in duration-200">
            <button
              onClick={handlePlayPause}
              className="pointer-events-auto w-24 h-24 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm hover:bg-white hover:scale-110 transition-all duration-300 shadow-2xl"
              aria-label={isPaused ? "Reproduzir vídeo" : hasActiveAudio ? "Pausar vídeo" : "Reproduzir com som"}
            >
              {isPaused ? (
                <PlayIcon className="w-12 h-12 text-pharos-navy-900 drop-shadow-lg ml-1" />
              ) : hasActiveAudio ? (
                <svg className="w-12 h-12 text-pharos-navy-900 drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <PlayIcon className="w-12 h-12 text-pharos-navy-900 drop-shadow-lg ml-1" />
              )}
            </button>
          </div>
        )}

        {/* Botão de mute/unmute */}
        <button
          onClick={toggleMute}
          className="absolute top-6 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-all duration-300 z-10"
          aria-label={isMuted ? 'Ativar som' : 'Silenciar'}
        >
          {isMuted ? (
            <SpeakerXMarkIcon className="w-5 h-5 text-white" />
          ) : (
            <SpeakerWaveIcon className="w-5 h-5 text-white" />
          )}
        </button>

        {/* Informações do cliente */}
        <div className="absolute bottom-0 left-0 right-0 p-6 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-white font-bold text-xl mb-1 drop-shadow-lg">
              {depoimento.nome}
            </h3>
            <p className="text-white/90 text-sm uppercase tracking-wider drop-shadow-lg">
              {depoimento.cargo}
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

const VideoTestimonials: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visibleCards, setVisibleCards] = useState<Set<number>>(new Set());
  const [activeAudioId, setActiveAudioId] = useState<number | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const cardId = parseInt(entry.target.getAttribute('data-card-id') || '0');
          
          if (entry.isIntersecting) {
            setVisibleCards((prev) => new Set(prev).add(cardId));
          } else {
            setVisibleCards((prev) => {
              const newSet = new Set(prev);
              newSet.delete(cardId);
              return newSet;
            });
          }
        });
      },
      {
        threshold: 0.5, // Considera visível quando 50% do card está na viewport
      }
    );

    const cards = sectionRef.current?.querySelectorAll('[data-card-id]');
    cards?.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, []);

  return (
    <VideoAudioContext.Provider value={{ activeAudioId, setActiveAudioId }}>
      <section 
        ref={sectionRef}
        className="py-24 md:py-28 lg:py-32 bg-gradient-to-b from-pharos-base-off to-white relative overflow-hidden"
      >
      {/* Background decorativo */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-pharos-blue-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="container mx-auto px-6 sm:px-10 md:px-16 lg:px-24 max-w-screen-2xl relative z-10">
        {/* Cabeçalho */}
        <div className="text-center mb-16 md:mb-20">
          <motion.span
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block text-[10px] font-semibold text-pharos-blue-500 uppercase tracking-[0.2em] mb-6"
          >
            Histórias de Sucesso
          </motion.span>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-pharos-navy-900 mb-6 leading-tight"
          >
            O Que Nossos Clientes Dizem
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed"
          >
            Experiências reais de quem confiou na Pharos para realizar o sonho do imóvel perfeito
          </motion.p>
        </div>

        {/* Grid de vídeos - tipo Stories/TikTok */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-7xl mx-auto">
          {depoimentos.map((depoimento) => (
            <div
              key={depoimento.id}
              data-card-id={depoimento.id}
              className="flex justify-center"
            >
              <VideoCard
                depoimento={depoimento}
                isInView={visibleCards.has(depoimento.id)}
              />
            </div>
          ))}
        </div>

        {/* Dica de interação */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <p className="text-sm text-gray-500">
            Passe o mouse sobre os vídeos e clique em PLAY para ouvir os depoimentos
          </p>
        </motion.div>
        </div>
      </section>
    </VideoAudioContext.Provider>
  );
};

export default VideoTestimonials;

