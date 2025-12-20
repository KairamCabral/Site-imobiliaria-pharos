# 🔌 Integração do Agendamento de Visitas

## Como integrar na página do imóvel

### 1. Importar o componente

```tsx
// Em src/app/imoveis/[id]/page.tsx
import AgendarVisita from '@/components/AgendarVisita';
```

### 2. Adicionar na estrutura da página

```tsx
export default async function ImovelDetalhesPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  // Buscar dados do imóvel
  const imovel = await getImovelById(params.id);
  
  if (!imovel) {
    notFound();
  }

  // Formatar endereço completo
  const enderecoCompleto = `${imovel.endereco.rua}, ${imovel.endereco.numero} - ${imovel.endereco.bairro}, ${imovel.endereco.cidade}/${imovel.endereco.estado}`;

  return (
    <div className="min-h-screen bg-white">
      {/* ========== GALERIA DE IMAGENS ========== */}
      <ImageGallery images={imovel.galeria} />

      {/* ========== CONTAINER PRINCIPAL ========== */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        
        {/* ========== CABEÇALHO: Título, Preço, Localização ========== */}
        <div className="mb-8">
          <Breadcrumb items={[
            { label: 'Início', href: '/' },
            { label: 'Imóveis', href: '/imoveis' },
            { label: imovel.titulo },
          ]} />
          
          <h1 className="text-3xl lg:text-4xl font-bold text-pharos-navy-900 mt-4 mb-3">
            {imovel.titulo}
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex items-center gap-2 text-pharos-slate-500">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
              <span className="text-sm">{enderecoCompleto}</span>
            </div>
            
            <StatusImovel status={imovel.status} />
          </div>
          
          <div className="text-3xl lg:text-4xl font-bold text-pharos-blue-500">
            {formatarPreco(imovel.preco)}
          </div>
        </div>

        {/* ========== GRID: Informações + Sidebar ========== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-8">
            {/* Características Principais */}
            <section>
              <h2 className="text-2xl font-bold text-pharos-navy-900 mb-4">
                Características
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-pharos-base-off rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-pharos-blue-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z" />
                    </svg>
                    <span className="text-sm text-pharos-slate-500">Área</span>
                  </div>
                  <p className="text-xl font-bold text-pharos-navy-900">
                    {imovel.areaTotal} m²
                  </p>
                </div>
                
                <div className="bg-pharos-base-off rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-pharos-blue-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 9.556V3h-2v2H6V3H4v6.556C2.81 10.25 2 11.526 2 13v4a1 1 0 001 1h1v4h2v-4h12v4h2v-4h1a1 1 0 001-1v-4c0-1.474-.811-2.75-2-3.444zM11 9a1.5 1.5 0 11-3.001-.001A1.5 1.5 0 0111 9zm5 0a1.5 1.5 0 11-3.001-.001A1.5 1.5 0 0116 9z" />
                    </svg>
                    <span className="text-sm text-pharos-slate-500">Quartos</span>
                  </div>
                  <p className="text-xl font-bold text-pharos-navy-900">
                    {imovel.quartos}
                  </p>
                </div>
                
                {/* Mais características... */}
              </div>
            </section>

            {/* Descrição */}
            <section>
              <h2 className="text-2xl font-bold text-pharos-navy-900 mb-4">
                Sobre o imóvel
              </h2>
              <p className="text-pharos-slate-700 leading-relaxed">
                {imovel.descricao}
              </p>
            </section>

            {/* Diferenciais */}
            <section>
              <h2 className="text-2xl font-bold text-pharos-navy-900 mb-4">
                Diferenciais
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {imovel.diferenciais.map((diferencial, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-pharos-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-pharos-slate-700">{diferencial}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar: Contato */}
          <div className="lg:col-span-1">
            <ContactSidebar imovel={imovel} />
          </div>
        </div>

        {/* ========== SEÇÃO DE AGENDAMENTO ========== */}
        <AgendarVisita
          propertyId={imovel.id}
          propertyTitle={imovel.titulo}
          propertyAddress={enderecoCompleto}
        />

        {/* ========== MAPA ========== */}
        {imovel.endereco.coordenadas && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-pharos-navy-900 mb-6">
              Localização
            </h2>
            <div className="h-[400px] rounded-2xl overflow-hidden border border-pharos-slate-300">
              <MapView
                center={[
                  imovel.endereco.coordenadas.latitude,
                  imovel.endereco.coordenadas.longitude,
                ]}
                zoom={16}
                markers={[
                  {
                    id: imovel.id,
                    latitude: imovel.endereco.coordenadas.latitude,
                    longitude: imovel.endereco.coordenadas.longitude,
                    titulo: imovel.titulo,
                    preco: imovel.preco,
                  },
                ]}
              />
            </div>
          </section>
        )}

        {/* ========== IMÓVEIS SIMILARES ========== */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-pharos-navy-900 mb-6">
            Imóveis similares
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {imoveisSimilares.map((similar) => (
              <ImovelCard key={similar.id} {...similar} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
```

---

## 3. Posicionamento Ideal

```
┌─────────────────────────────────────────┐
│  Galeria de Imagens                     │
├─────────────────────────────────────────┤
│  Título, Preço, Localização             │
├─────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐    │
│  │ Informações  │  │ Sidebar      │    │
│  │ • Caract.    │  │ Contato      │    │
│  │ • Descrição  │  │              │    │
│  │ • Diferenc.  │  └──────────────┘    │
│  └──────────────┘                       │
├─────────────────────────────────────────┤
│  ⭐ SEÇÃO DE AGENDAMENTO ⭐             │ ← AQUI
├─────────────────────────────────────────┤
│  Mapa de Localização                    │
├─────────────────────────────────────────┤
│  Imóveis Similares                      │
└─────────────────────────────────────────┘
```

**Razão**: Depois que o usuário viu todas as informações principais, ele está pronto para agendar a visita.

---

## 4. Analytics na Página

```tsx
// Rastrear visualização da seção
useEffect(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('event', 'visit_section_view', {
              property_id: imovel.id,
            });
          }
        }
      });
    },
    { threshold: 0.5 }
  );

  const section = document.getElementById('agendar-visita');
  if (section) observer.observe(section);

  return () => {
    if (section) observer.unobserve(section);
  };
}, [imovel.id]);
```

---

## 5. SEO e Meta Tags

```tsx
// Em app/imoveis/[id]/page.tsx
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const imovel = await getImovelById(params.id);
  
  if (!imovel) {
    return { title: 'Imóvel não encontrado' };
  }

  return {
    title: `${imovel.titulo} - Agende sua visita | Pharos Imobiliária`,
    description: `${imovel.descricao.substring(0, 150)}... Agende agora sua visita presencial ou por vídeo.`,
    openGraph: {
      title: `${imovel.titulo} - Agende sua visita`,
      description: 'Agende agora sua visita presencial ou por videoconferência',
      images: [imovel.imagemCapa],
    },
  };
}
```

---

## 6. Schema.org (Structured Data)

```tsx
// Adicionar JSON-LD para SEO
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "RealEstateListing",
      "name": imovel.titulo,
      "description": imovel.descricao,
      "url": `https://pharos.com.br/imoveis/${imovel.id}`,
      "image": imovel.imagemCapa,
      "offers": {
        "@type": "Offer",
        "price": imovel.preco,
        "priceCurrency": "BRL"
      },
      "address": {
        "@type": "PostalAddress",
        "streetAddress": `${imovel.endereco.rua}, ${imovel.endereco.numero}`,
        "addressLocality": imovel.endereco.cidade,
        "addressRegion": imovel.endereco.estado,
        "postalCode": imovel.endereco.cep,
        "addressCountry": "BR"
      },
      // Adicionar disponibilidade de agendamento
      "potentialAction": {
        "@type": "ScheduleAction",
        "name": "Agendar visita",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `https://pharos.com.br/imoveis/${imovel.id}#agendar-visita`
        }
      }
    })
  }}
/>
```

---

## 7. Botão de Atalho Flutuante (Opcional)

Para melhorar a conversão, adicione um botão flutuante que leva à seção:

```tsx
'use client';

import { useState, useEffect } from 'react';

export function FloatingScheduleButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Mostrar botão após rolar 300px
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSchedule = () => {
    const section = document.getElementById('agendar-visita');
    section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToSchedule}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-6 py-4 bg-pharos-blue-500 text-white rounded-full shadow-xl hover:bg-pharos-blue-600 transition-all hover:scale-105 active:scale-95"
      aria-label="Agendar visita"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <span className="font-bold hidden sm:inline">Agendar visita</span>
    </button>
  );
}
```

Uso:

```tsx
// Em app/imoveis/[id]/page.tsx
import { FloatingScheduleButton } from '@/components/FloatingScheduleButton';

export default function ImovelDetalhesPage() {
  return (
    <>
      {/* Conteúdo da página */}
      <FloatingScheduleButton />
    </>
  );
}
```

---

## 8. Link Direto para Agendamento

Para campanhas e links externos:

```
https://pharos.com.br/imoveis/apt-001#agendar-visita
```

O navegador vai automaticamente rolar até a seção.

---

## 9. Teste A/B (Opcional)

Testar diferentes posicionamentos:

```tsx
// Variante A: Após informações principais (padrão)
<AgendarVisita ... />

// Variante B: No topo (prioridade máxima)
// Mover para logo após o título

// Variante C: Sidebar flutuante
// Versão sticky na sidebar
```

---

## ✅ Checklist de Integração

- [ ] Componente importado
- [ ] Props corretas (id, título, endereço)
- [ ] Posicionamento após informações principais
- [ ] Seção tem id="agendar-visita"
- [ ] Analytics configurado
- [ ] Meta tags atualizadas
- [ ] Schema.org adicionado
- [ ] Testado em mobile/desktop
- [ ] Botão flutuante (opcional)
- [ ] Links diretos funcionando

---

**Implementação completa! 🎉**

