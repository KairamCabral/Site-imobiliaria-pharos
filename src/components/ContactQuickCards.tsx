"use client";

import React from 'react';
import { Button } from './Button';
import { PhoneIcon } from '@heroicons/react/24/outline';

export const ContactQuickCards: React.FC = () => {
  const handleWhatsApp = () => {
    // Track event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'contact_whatsapp_click', {
        event_category: 'contact',
        event_label: 'Quick Button'
      });
    }
    
    window.open('https://wa.me/5547991878070?text=Olá! Gostaria de mais informações.', '_blank');
  };

  const handlePhone = () => {
    // Track event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'contact_phone_click', {
        event_category: 'contact',
        event_label: 'Quick Button'
      });
    }
    
    window.location.href = 'tel:+5547991878070';
  };

  return (
    <div className="flex items-center justify-center gap-3 -mt-8 relative z-20">
      <Button
        variant="primary"
        size="lg"
        onClick={handleWhatsApp}
        icon={<PhoneIcon className="w-5 h-5" />}
        aria-label="Chamar no WhatsApp"
      >
        WhatsApp
      </Button>
      
      <Button
        variant="secondary"
        size="lg"
        onClick={handlePhone}
        icon={<PhoneIcon className="w-5 h-5" />}
        aria-label="Ligar para telefone"
      >
        (47) 9 9187-8070
      </Button>
    </div>
  );
};

