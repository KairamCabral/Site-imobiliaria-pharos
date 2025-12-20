'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';

interface Logo {
  id: string;
  src: string;
  alt: string;
}

interface LogosCarouselProps {
  logos: Logo[];
}

export default function LogosCarousel({ logos }: LogosCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentTranslate, setCurrentTranslate] = useState(0);
  const [prevTranslate, setPrevTranslate] = useState(0);
  const animationRef = useRef<number | null>(null);

  const handleDragStart = (clientX: number) => {
    setIsDragging(true);
    setStartX(clientX);
    if (trackRef.current) {
      trackRef.current.classList.add('dragging');
      // Pega o transform atual
      const style = window.getComputedStyle(trackRef.current);
      const matrix = new DOMMatrix(style.transform);
      setPrevTranslate(matrix.m41);
      setCurrentTranslate(matrix.m41);
    }
  };

  const handleDragMove = (clientX: number) => {
    if (!isDragging) return;
    const currentPosition = clientX;
    const diff = currentPosition - startX;
    const newTranslate = prevTranslate + diff;
    setCurrentTranslate(newTranslate);
    
    if (trackRef.current) {
      trackRef.current.style.transform = `translateX(${newTranslate}px)`;
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setPrevTranslate(currentTranslate);
    if (trackRef.current) {
      trackRef.current.classList.remove('dragging');
    }
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleDragMove(e.clientX);
  };

  const handleMouseUp = () => {
    handleDragEnd();
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      handleDragEnd();
    }
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleDragMove(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    handleDragEnd();
  };

  return (
    <div 
      ref={containerRef}
      className="relative marquee overflow-hidden"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div 
        ref={trackRef}
        className="marquee-track gap-10 md:gap-16 py-6"
      >
        {[...logos, ...logos, ...logos].map((logo, idx) => (
          <div 
            key={`${logo.id}-${idx}`} 
            className="flex items-center justify-center h-[140px] md:h-[168px] w-[250px] md:w-[280px] flex-shrink-0 group"
          >
            <Image 
              src={logo.src} 
              alt={logo.alt} 
              width={280} 
              height={168} 
              className="object-contain grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500 ease-out max-w-full max-h-full select-none" 
              draggable={false}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

