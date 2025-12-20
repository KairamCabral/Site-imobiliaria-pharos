"use client";

import React, { useState } from 'react';
import { Button } from './Button';

interface Office {
  id: string;
  name: string;
  address: string;
  phone: string;
  hours: string;
  coordinates: { lat: number; lng: number };
  googleMapsUrl: string;
}

const offices: Office[] = [
  {
    id: 'bc-principal',
    name: 'Pharos Balneário Camboriú',
    address: 'Av. Atlântica, 5678 - Centro, Balneário Camboriú - SC',
    phone: '(47) 3333-3333',
    hours: 'Seg a Sex: 9h às 18h | Sáb: 9h às 13h',
    coordinates: { lat: -26.9936, lng: -48.6358 },
    googleMapsUrl: 'https://maps.google.com/?q=-26.9936,-48.6358'
  },
];

export const ContactMap: React.FC = () => {
  const [selectedOffice, setSelectedOffice] = useState<string>(offices[0].id);

  const currentOffice = offices.find(o => o.id === selectedOffice) || offices[0];

  const getCurrentTime = () => {
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();

    // Seg a Sex: 9-18h, Sáb: 9-13h, Dom: fechado
    if (day === 0) return 'Fechado';
    if (day === 6) {
      if (hour >= 9 && hour < 13) return 'Aberto agora';
      return 'Fechado';
    }
    if (hour >= 9 && hour < 18) return 'Aberto agora';
    return 'Fechado';
  };

  const getResponseTime = () => {
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();

    // Horário comercial
    if (day >= 1 && day <= 5 && hour >= 9 && hour < 18) {
      return 'Hoje, em até 1h útil';
    }
    if (day === 6 && hour >= 9 && hour < 13) {
      return 'Hoje, em até 2h';
    }
    return 'No próximo dia útil';
  };

  const status = getCurrentTime();
  const isOpen = status === 'Aberto agora';

  return (
    <div className="space-y-6">
      {/* Tempo de resposta */}
      <div className="bg-pharos-blue-500 text-white rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <h3 className="text-lg font-semibold">Tempo de resposta</h3>
        </div>
        <p className="text-2xl font-bold">{getResponseTime()}</p>
      </div>

      {/* Escritório principal */}
      <div className="bg-white rounded-2xl border border-pharos-slate-300 overflow-hidden">
        {/* Mapa placeholder (integrar com Leaflet/Google Maps) */}
        <div className="h-64 bg-pharos-slate-300 relative overflow-hidden">
          <iframe
            src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3558.5!2d${currentOffice.coordinates.lng}!3d${currentOffice.coordinates.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjbCsDU5JzM3LjAiUyA0OMKwMzgnMDguOSJX!5e0!3m2!1spt-BR!2sbr!4v1234567890`}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Mapa do escritório Pharos"
          />
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold text-pharos-navy-900 mb-1">
                {currentOffice.name}
              </h3>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                isOpen 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                <span className={`w-2 h-2 rounded-full ${isOpen ? 'bg-green-500' : 'bg-red-500'}`}></span>
                {status}
              </div>
            </div>
          </div>

          <div className="space-y-3 text-pharos-slate-700">
            <div className="flex items-start gap-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-pharos-blue-500 flex-shrink-0 mt-0.5">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="currentColor" strokeWidth="2"/>
                <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <p>{currentOffice.address}</p>
            </div>

            <div className="flex items-center gap-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-pharos-blue-500 flex-shrink-0">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <a href={`tel:${currentOffice.phone.replace(/\D/g, '')}`} className="hover:text-pharos-blue-500 transition-colors">
                {currentOffice.phone}
              </a>
            </div>

            <div className="flex items-center gap-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-pharos-blue-500 flex-shrink-0">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <p>{currentOffice.hours}</p>
            </div>
          </div>

          <Button
            variant="primary"
            size="md"
            fullWidth
            onClick={() => window.open(currentOffice.googleMapsUrl, '_blank')}
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            }
            iconPosition="right"
          >
            Como chegar
          </Button>
        </div>
      </div>

      {/* Canais oficiais */}
      <div className="bg-pharos-offwhite rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-pharos-navy-900 mb-4">
          Nossos canais oficiais
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <a
            href="https://wa.me/5547999999999"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 bg-white rounded-lg hover:shadow-md transition-all duration-200 border border-pharos-slate-300 hover:border-pharos-blue-500"
          >
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              </svg>
            </div>
            <span className="text-sm font-medium text-pharos-slate-700">WhatsApp</span>
          </a>

          <a
            href="tel:+554733333333"
            className="flex items-center gap-3 p-3 bg-white rounded-lg hover:shadow-md transition-all duration-200 border border-pharos-slate-300 hover:border-pharos-blue-500"
          >
            <div className="w-10 h-10 bg-pharos-blue-500 rounded-full flex items-center justify-center text-white flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <span className="text-sm font-medium text-pharos-slate-700">Telefone</span>
          </a>

          <a
            href="mailto:contato@pharosnegocios.com.br"
            className="flex items-center gap-3 p-3 bg-white rounded-lg hover:shadow-md transition-all duration-200 border border-pharos-slate-300 hover:border-pharos-blue-500"
          >
            <div className="w-10 h-10 bg-pharos-navy-900 rounded-full flex items-center justify-center text-white flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
                <path d="M3 7l9 6 9-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="text-sm font-medium text-pharos-slate-700">E-mail</span>
          </a>

          <a
            href="https://instagram.com/pharosnegocios"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 bg-white rounded-lg hover:shadow-md transition-all duration-200 border border-pharos-slate-300 hover:border-pharos-blue-500"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="2"/>
                <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2"/>
                <circle cx="18" cy="6" r="1" fill="currentColor"/>
              </svg>
            </div>
            <span className="text-sm font-medium text-pharos-slate-700">Instagram</span>
          </a>
        </div>
      </div>
    </div>
  );
};

