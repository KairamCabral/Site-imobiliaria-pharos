'use client';

/**
 * SwiperCarousel
 * 
 * Componente isolado do Swiper para lazy loading
 * Reduz bundle inicial em ~50KB
 */

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Keyboard, A11y } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface SwiperCarouselProps {
  children: React.ReactNode;
  modules?: any[];
  spaceBetween?: number;
  slidesPerView?: number | 'auto';
  breakpoints?: any;
  navigation?: boolean | any;
  pagination?: boolean | any;
  keyboard?: boolean | any;
  a11y?: boolean | any;
  className?: string;
  onSwiper?: (swiper: any) => void;
  onSlideChange?: () => void;
  allowTouchMove?: boolean;
  simulateTouch?: boolean;
  speed?: number;
  slidesOffsetBefore?: number;
  slidesOffsetAfter?: number;
  centeredSlides?: boolean;
  loop?: boolean;
  [key: string]: any; // Aceitar qualquer outra prop do Swiper
}

export default function SwiperCarousel({
  children,
  modules: propsModules,
  spaceBetween = 24,
  slidesPerView = 'auto',
  breakpoints,
  navigation = true,
  pagination = true,
  keyboard = true,
  a11y = true,
  className = '',
  onSwiper,
  onSlideChange,
  allowTouchMove = true,
  simulateTouch = true,
  speed = 300,
  slidesOffsetBefore,
  slidesOffsetAfter,
  centeredSlides,
  loop,
  ...rest
}: SwiperCarouselProps) {
  // Usar módulos fornecidos ou criar lista padrão
  const modules = propsModules || (() => {
    const mods = [];
    if (navigation) mods.push(Navigation);
    if (pagination) mods.push(Pagination);
    if (keyboard) mods.push(Keyboard);
    if (a11y) mods.push(A11y);
    return mods;
  })();

  return (
    <Swiper
      modules={modules}
      spaceBetween={spaceBetween}
      slidesPerView={slidesPerView}
      navigation={typeof navigation === 'boolean' ? navigation : navigation}
      pagination={typeof pagination === 'boolean' ? (pagination ? { clickable: true } : false) : pagination}
      keyboard={typeof keyboard === 'boolean' ? (keyboard ? { enabled: true } : false) : keyboard}
      a11y={typeof a11y === 'boolean' ? (a11y ? { enabled: true } : false) : a11y}
      breakpoints={breakpoints}
      className={className}
      onSwiper={onSwiper}
      onSlideChange={onSlideChange}
      allowTouchMove={allowTouchMove}
      simulateTouch={simulateTouch}
      speed={speed}
      slidesOffsetBefore={slidesOffsetBefore}
      slidesOffsetAfter={slidesOffsetAfter}
      centeredSlides={centeredSlides}
      loop={loop}
      {...rest}
    >
      {children}
    </Swiper>
  );
}

// Exportar SwiperSlide para uso externo
export { SwiperSlide };

