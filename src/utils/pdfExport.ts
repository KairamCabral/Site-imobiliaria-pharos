import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Favorito } from '@/types';

/**
 * PHAROS - EXPORTAÇÃO DE PDF PREMIUM
 * Relatório minimalista e profissional com logo oficial e layout organizado
 */

// ========== CORES PHAROS (TOKENS OFICIAIS) ==========
const COLORS = {
  navy900: '#192233',
  blue500: '#054ADA',
  slate700: '#2C3444',
  slate500: '#585E6B',
  slate300: '#ADB4C0',
  offwhite: '#F7F9FC',
  white: '#FFFFFF',
  gold: '#C89C4D',
};

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [0, 0, 0];
}

// ========== FORMATAÇÃO PT-BR ==========

function formatPrice(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function formatPricePerSqm(pricePerSqm: number): string {
  const rounded = Math.round(pricePerSqm / 10) * 10;
  return `R$ ${rounded.toLocaleString('pt-BR')}/m²`;
}

function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

// ========== CARREGAR LOGO ==========

async function loadLogo(): Promise<string> {
  try {
    const response = await fetch('/images/logos/Logo-pharos.webp');
    const blob = await response.blob();
    
    // Converter para canvas e inverter cores para branco
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(blob);
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }
        
        // Manter proporção original (logo é ~2:1)
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Desenhar imagem
        ctx.drawImage(img, 0, 0);
        
        // Inverter cores para branco (filtro)
        ctx.globalCompositeOperation = 'difference';
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Converter para data URL
        resolve(canvas.toDataURL('image/png'));
        URL.revokeObjectURL(url);
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image'));
      };
      
      img.src = url;
    });
  } catch (error) {
    console.error('Erro ao carregar logo:', error);
    return '';
  }
}

// ========== CÁLCULOS DE MÉTRICAS ==========

interface Metrics {
  totalImoveis: number;
  avgPricePerSqmPriv: number;
  avgPricePerSqmTotal: number;
  cities: string[];
  neighborhoods: string[];
  cityDistribution: { city: string; count: number; percentage: number }[];
}

function calculateMetrics(favoritos: Favorito[]): Metrics {
  const validPriv = favoritos.filter(f => 
    f.imovel?.preco && f.imovel?.areaPrivativa && f.imovel.areaPrivativa > 0
  );
  
  const validTotal = favoritos.filter(f => 
    f.imovel?.preco && f.imovel?.areaTotal && f.imovel.areaTotal > 0
  );

  const avgPricePerSqmPriv = validPriv.length > 0
    ? validPriv.reduce((sum, f) => sum + (f.imovel!.preco / f.imovel!.areaPrivativa!), 0) / validPriv.length
    : 0;

  const avgPricePerSqmTotal = validTotal.length > 0
    ? validTotal.reduce((sum, f) => sum + (f.imovel!.preco / f.imovel!.areaTotal), 0) / validTotal.length
    : 0;

  const cities = Array.from(new Set(favoritos.map(f => f.imovel?.endereco?.cidade).filter(Boolean))) as string[];
  const neighborhoods = Array.from(new Set(favoritos.map(f => f.imovel?.endereco?.bairro).filter(Boolean))) as string[];

  const cityCount = new Map<string, number>();
  favoritos.forEach(f => {
    const city = f.imovel?.endereco?.cidade;
    if (city) {
      cityCount.set(city, (cityCount.get(city) || 0) + 1);
    }
  });

  const cityDistribution = Array.from(cityCount.entries())
    .map(([city, count]) => ({
      city,
      count,
      percentage: (count / favoritos.length) * 100,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalImoveis: favoritos.length,
    avgPricePerSqmPriv,
    avgPricePerSqmTotal,
    cities,
    neighborhoods,
    cityDistribution,
  };
}

// ========== GERAÇÃO DO PDF ==========

export async function exportFavoritosToPDF(
  favoritos: Favorito[],
  collectionName?: string,
  clientName?: string
): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 24;
  let yPosition = margin;

  // Carregar logo
  const logoDataUrl = await loadLogo();

  // Calcular métricas
  const metrics = calculateMetrics(favoritos);

  // ========== CAPA ==========
  
  // Faixa superior Navy
  doc.setFillColor(...hexToRgb(COLORS.navy900));
  doc.rect(0, 0, pageWidth, 32, 'F');

  // Logo oficial Pharos (proporção correta, branca invertida)
  if (logoDataUrl) {
    // Logo Pharos tem proporção ~3:1 (mais larga que alta)
    // Altura: 12mm, Largura: 36mm (proporção 3:1)
    doc.addImage(logoDataUrl, 'PNG', margin, 10, 36, 12, '', 'FAST', 0);
  }

  // Título H1 (sem sobrepor a logo)
  doc.setTextColor(...hexToRgb(COLORS.white));
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('Relatório de Favoritos', pageWidth / 2, 18, { align: 'center' });

  // Metadados (direita, compacto)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const metaX = pageWidth - margin;
  
  doc.text(`Gerado em ${formatDate(new Date())}`, metaX, 12, { align: 'right' });
  
  if (clientName) {
    doc.text(`Cliente: ${clientName}`, metaX, 16, { align: 'right' });
  }
  
  const collectionLabel = collectionName || 'Todos';
  doc.text(`Coleção: ${collectionLabel}`, metaX, (clientName ? 20 : 16), { align: 'right' });

  yPosition = 40;

  // ========== SUMÁRIO (COMPACTO) ==========
  
  doc.setFillColor(...hexToRgb(COLORS.offwhite));
  doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 62, 2, 2, 'F');

  doc.setDrawColor(...hexToRgb(COLORS.slate300));
  doc.setLineWidth(0.25);
  doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 62, 2, 2, 'S');

  yPosition += 6;

  doc.setTextColor(...hexToRgb(COLORS.navy900));
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Resumo', margin + 5, yPosition);
  
  yPosition += 8;

  // KPIs em cards (compactos, sem sobreposição)
  const kpiWidth = (pageWidth - 2 * margin - 12) / 3;
  const kpiHeight = 24;
  const kpiStartX = margin + 5;

  const kpis = [
    {
      label: 'Imóveis',
      value: `${metrics.totalImoveis}`,
    },
    {
      label: 'R$/m² (priv.)',
      value: metrics.avgPricePerSqmPriv > 0 ? formatPricePerSqm(metrics.avgPricePerSqmPriv) : '—',
    },
    {
      label: 'R$/m² (total)',
      value: metrics.avgPricePerSqmTotal > 0 ? formatPricePerSqm(metrics.avgPricePerSqmTotal) : '—',
    },
  ];

  kpis.forEach((kpi, index) => {
    const x = kpiStartX + index * (kpiWidth + 4);
    
    doc.setFillColor(...hexToRgb(COLORS.white));
    doc.roundedRect(x, yPosition, kpiWidth, kpiHeight, 1.5, 1.5, 'F');
    
    doc.setDrawColor(...hexToRgb(COLORS.slate300));
    doc.setLineWidth(0.15);
    doc.roundedRect(x, yPosition, kpiWidth, kpiHeight, 1.5, 1.5, 'S');

    // Label (no topo, com espaço)
    doc.setTextColor(...hexToRgb(COLORS.slate500));
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.text(kpi.label, x + kpiWidth / 2, yPosition + 6, { align: 'center', maxWidth: kpiWidth - 4 });

    // Valor (abaixo, sem sobrepor)
    doc.setTextColor(...hexToRgb(COLORS.navy900));
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(kpi.value, x + kpiWidth / 2, yPosition + 16, { align: 'center' });
  });

  yPosition += kpiHeight + 6;

  doc.setTextColor(...hexToRgb(COLORS.slate700));
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  const locationText = `${metrics.cities.length} ${metrics.cities.length === 1 ? 'cidade' : 'cidades'} · ${metrics.neighborhoods.length} ${metrics.neighborhoods.length === 1 ? 'bairro' : 'bairros'}`;
  doc.text(locationText, margin + 5, yPosition);

  yPosition += 5;

  if (metrics.cityDistribution.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...hexToRgb(COLORS.slate700));
    doc.text('Distribuição:', margin + 5, yPosition);
    yPosition += 3.5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    // Limitar a 3 cidades para economizar espaço
    metrics.cityDistribution.slice(0, 3).forEach((dist) => {
      const distText = `${dist.city}: ${dist.count} (${dist.percentage.toFixed(0)}%)`;
      doc.text(distText, margin + 5, yPosition);
      yPosition += 3.5;
    });
  }

  // ========== LISTA DE IMÓVEIS (MESMA PÁGINA) ==========
  
  yPosition += 8;

  doc.setTextColor(...hexToRgb(COLORS.navy900));
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Imóveis Selecionados', margin, yPosition);
  
  yPosition += 2;
  doc.setDrawColor(...hexToRgb(COLORS.blue500));
  doc.setLineWidth(0.4);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  
  yPosition += 8;

  // Renderizar cada imóvel (compacto)
  favoritos.forEach((fav, index) => {
    const imovel = fav.imovel;
    if (!imovel) return;

    // Verificar espaço (card ultra-compacto: 2 linhas de dados)
    const cardHeight = 47;
    if (yPosition + cardHeight > pageHeight - margin - 15) {
      doc.addPage();
      yPosition = margin;
    }

    const cardStartY = yPosition;
    const cardWidth = pageWidth - 2 * margin;

    // ========== CARD ULTRA-MINIMALISTA ==========
    
    // Fundo branco
    doc.setFillColor(...hexToRgb(COLORS.white));
    doc.roundedRect(margin, cardStartY, cardWidth, cardHeight, 2, 2, 'F');

    // Borda sutil
    doc.setDrawColor(...hexToRgb(COLORS.slate300));
    doc.setLineWidth(0.2);
    doc.roundedRect(margin, cardStartY, cardWidth, cardHeight, 2, 2, 'S');

    let cardY = cardStartY + 4;

    // ========== LINHA 1: Badge + Código + Título + Status ==========
    
    // Badge de índice
    doc.setFillColor(...hexToRgb(COLORS.blue500));
    doc.circle(margin + 5, cardY + 2.5, 2.5, 'F');
    doc.setTextColor(...hexToRgb(COLORS.white));
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text(`${index + 1}`, margin + 5, cardY + 3.5, { align: 'center' });

    // Código
    const codigo = imovel.codigo || `PHR-${String(index + 1).padStart(3, '0')}`;
    doc.setTextColor(...hexToRgb(COLORS.slate500));
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.text(`Cód: ${codigo}`, margin + 10, cardY + 3.5);

    // Status (direita, compacto)
    const statusText = imovel.status === 'disponivel' ? 'Disponível' : 
                      imovel.status === 'vendido' ? 'Vendido' : 'Lançamento';
    const statusX = pageWidth - margin - 20;
    doc.setFillColor(...hexToRgb(COLORS.offwhite));
    doc.roundedRect(statusX, cardY, 16, 4, 0.8, 0.8, 'F');
    doc.setTextColor(...hexToRgb(COLORS.slate700));
    doc.setFontSize(5.5);
    doc.text(statusText, statusX + 8, cardY + 2.8, { align: 'center' });

    cardY += 5;

    // Título (bold, grande)
    const titulo = imovel.titulo.length > 75 
      ? imovel.titulo.substring(0, 75) + '...'
      : imovel.titulo;
    
    doc.setTextColor(...hexToRgb(COLORS.navy900));
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(titulo, margin + 4, cardY, { maxWidth: cardWidth - 28 });

    cardY += 5;

    // ========== LINHA 2: Endereço ==========
    doc.setTextColor(...hexToRgb(COLORS.slate500));
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    const endereco = `${imovel.endereco.rua}, ${imovel.endereco.numero} — ${imovel.endereco.bairro}, ${imovel.endereco.cidade}`;
    doc.text(endereco, margin + 4, cardY, { maxWidth: cardWidth - 32 });

    // Distância do mar (badge direita)
    if (imovel.distanciaMar !== undefined) {
      const distText = imovel.distanciaMar === 0 ? 'Frente' : `${imovel.distanciaMar}m`;
      const distX = pageWidth - margin - 15;
      doc.setFillColor(220, 240, 255);
      doc.roundedRect(distX, cardY - 2.2, 11, 3.5, 0.8, 0.8, 'F');
      doc.setTextColor(...hexToRgb(COLORS.blue500));
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(5.5);
      doc.text(distText, distX + 5.5, cardY, { align: 'center' });
    }

    cardY += 5.5;

    // ========== TABELA DE DADOS (MINIMALISTA E ALINHADA - 2 LINHAS) ==========
    
    // Fundo cinza claro
    doc.setFillColor(...hexToRgb(COLORS.offwhite));
    doc.rect(margin + 4, cardY, cardWidth - 8, 13, 'F');

    // Linha divisória horizontal
    doc.setDrawColor(...hexToRgb(COLORS.slate300));
    doc.setLineWidth(0.12);
    doc.line(margin + 4, cardY + 6.5, pageWidth - margin - 4, cardY + 6.5);

    // Linhas divisórias verticais (4 colunas)
    const col1X = margin + 4;
    const col2X = margin + 45;
    const col3X = margin + 86;
    const col4X = margin + 127;

    doc.line(col2X, cardY, col2X, cardY + 13);
    doc.line(col3X, cardY, col3X, cardY + 13);
    doc.line(col4X, cardY, col4X, cardY + 13);

    // Função para renderizar célula (compacta, sem sobreposição)
    const renderCell = (label: string, value: string, x: number, y: number) => {
      doc.setTextColor(...hexToRgb(COLORS.slate500));
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(5.5);
      doc.text(label, x + 1.5, y + 2.2);
      
      doc.setTextColor(...hexToRgb(COLORS.navy900));
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.text(value, x + 1.5, y + 5);
    };

    // Linha 1: Características principais
    renderCell('Quartos', `${imovel.quartos}`, col1X, cardY);
    renderCell('Suítes', `${imovel.suites || 0}`, col2X, cardY);
    renderCell('Vagas', `${imovel.vagasGaragem || 0}`, col3X, cardY);
    renderCell('Área Priv.', imovel.areaPrivativa ? `${imovel.areaPrivativa}m²` : '—', col4X, cardY);

    // Linha 2: Valores e custos
    renderCell('Área Total', imovel.areaTotal ? `${imovel.areaTotal}m²` : '—', col1X, cardY + 6.5);
    renderCell('Condomínio', imovel.precoCondominio ? formatPrice(imovel.precoCondominio).replace('R$', '').trim() : '—', col2X, cardY + 6.5);
    renderCell('IPTU/ano', imovel.iptu ? formatPrice(imovel.iptu).replace('R$', '').trim() : '—', col3X, cardY + 6.5);
    
    // R$/m² (usar privativo se disponível, senão total)
    let pricePerSqm = 0;
    let priceLabel = 'R$/m²';
    if (imovel.areaPrivativa && imovel.areaPrivativa > 0) {
      pricePerSqm = Math.round((imovel.preco / imovel.areaPrivativa) / 10) * 10;
      priceLabel = 'R$/m² priv.';
    } else if (imovel.areaTotal && imovel.areaTotal > 0) {
      pricePerSqm = Math.round((imovel.preco / imovel.areaTotal) / 10) * 10;
      priceLabel = 'R$/m² total';
    }
    renderCell(priceLabel, pricePerSqm > 0 ? `${pricePerSqm.toLocaleString('pt-BR')}` : '—', col4X, cardY + 6.5);

    cardY += 15;

    // ========== LINHA FINAL: Preço + Link ==========
    
    // Preço (pill destaque, compacto)
    const priceText = formatPrice(imovel.preco);
    const priceWidth = doc.getTextWidth(priceText) * 1.05 + 10;
    doc.setFillColor(...hexToRgb(COLORS.blue500));
    doc.roundedRect(margin + 4, cardY, priceWidth, 6, 1.5, 1.5, 'F');
    
    doc.setTextColor(...hexToRgb(COLORS.white));
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(priceText, margin + 4 + priceWidth / 2, cardY + 4.2, { align: 'center' });

    // Link/QR (direita, compacto)
    doc.setTextColor(...hexToRgb(COLORS.slate500));
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.5);
    const linkX = pageWidth - margin - 4;
    doc.text('pharos.com.br', linkX, cardY + 2.5, { align: 'right' });
    doc.text(`Cód: ${codigo}`, linkX, cardY + 5, { align: 'right' });

    // Nota (opcional, se houver espaço extra no card)
    if (fav.notes && cardHeight >= 52) {
      cardY += 7;
      doc.setTextColor(...hexToRgb(COLORS.slate500));
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(5.5);
      const notesText = fav.notes.length > 100 
        ? fav.notes.substring(0, 100) + '...'
        : fav.notes;
      doc.text(`Nota: ${notesText}`, margin + 4, cardY, { maxWidth: cardWidth - 8 });
    }

    yPosition = cardStartY + cardHeight + 3.5;
  });

  // ========== RODAPÉS ==========
  
  const totalPages = doc.getNumberOfPages();
  
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    
    doc.setDrawColor(...hexToRgb(COLORS.slate300));
    doc.setLineWidth(0.2);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
    
    doc.setTextColor(...hexToRgb(COLORS.slate500));
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    
    doc.text('Pharos | Relatório de Favoritos', margin, pageHeight - 8);
    
    const pageText = `p. ${i} de ${totalPages}`;
    const pageTextWidth = doc.getTextWidth(pageText);
    doc.text(pageText, pageWidth - margin - pageTextWidth, pageHeight - 8);
    
    if (i === totalPages) {
      doc.setFontSize(6);
      doc.text(
        'Valores e disponibilidade sujeitos a alteração sem aviso prévio.',
        pageWidth / 2,
        pageHeight - 4,
        { align: 'center' }
      );
    }
  }

  // ========== SALVAR ==========
  
  const filename = `Pharos_Favoritos_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);

  // Analytics
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'pdf_export_premium', {
      collection: collectionName || 'all',
      total_properties: favoritos.length,
      avg_price_per_sqm_priv: metrics.avgPricePerSqmPriv,
    });
  }
}

/**
 * Exportar comparação
 */
export async function exportComparisonToPDF(favoritos: Favorito[]): Promise<void> {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPosition = margin;

  // Carregar logo
  const logoDataUrl = await loadLogo();

  // Cabeçalho
  doc.setFillColor(...hexToRgb(COLORS.navy900));
  doc.rect(0, 0, pageWidth, 30, 'F');

  if (logoDataUrl) {
    doc.addImage(logoDataUrl, 'WEBP', margin, 8, 35, 15);
  }

  doc.setTextColor(...hexToRgb(COLORS.white));
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Comparação de Imóveis', margin + 40, 18);

  yPosition = 40;

  // Tabela
  const tableData: any[][] = [];
  const headers = ['Característica', ...favoritos.map((_, i) => `Imóvel ${i + 1}`)];

  const comparacaoItems = [
    { label: 'Código', getValue: (f: Favorito) => f.imovel?.codigo || `PHR-${favoritos.indexOf(f) + 1}` },
    { label: 'Título', getValue: (f: Favorito) => f.imovel?.titulo.substring(0, 30) || '—' },
    { label: 'Localização', getValue: (f: Favorito) => `${f.imovel?.endereco.bairro || '—'}` },
    { label: 'Preço', getValue: (f: Favorito) => formatPrice(f.imovel?.preco || 0) },
    { label: 'Área Privativa', getValue: (f: Favorito) => f.imovel?.areaPrivativa ? `${f.imovel.areaPrivativa}m²` : '—' },
    { label: 'Área Total', getValue: (f: Favorito) => f.imovel?.areaTotal ? `${f.imovel.areaTotal}m²` : '—' },
    { label: 'R$/m² (priv.)', getValue: (f: Favorito) => {
      if (f.imovel?.preco && f.imovel?.areaPrivativa) {
        return formatPricePerSqm(f.imovel.preco / f.imovel.areaPrivativa);
      }
      return '—';
    }},
    { label: 'Quartos', getValue: (f: Favorito) => `${f.imovel?.quartos || 0}` },
    { label: 'Suítes', getValue: (f: Favorito) => `${f.imovel?.suites || 0}` },
    { label: 'Vagas', getValue: (f: Favorito) => `${f.imovel?.vagasGaragem || 0}` },
    { label: 'Status', getValue: (f: Favorito) => f.imovel?.status || '—' },
  ];

  comparacaoItems.forEach(item => {
    const row = [item.label, ...favoritos.map(f => item.getValue(f))];
    tableData.push(row);
  });

  autoTable(doc, {
    startY: yPosition,
    head: [headers],
    body: tableData,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 3,
      textColor: hexToRgb(COLORS.slate700),
    },
    headStyles: {
      fillColor: hexToRgb(COLORS.blue500),
      textColor: hexToRgb(COLORS.white),
      fontStyle: 'bold',
      fontSize: 9,
    },
    alternateRowStyles: {
      fillColor: hexToRgb(COLORS.offwhite),
    },
    columnStyles: {
      0: { fontStyle: 'bold', fillColor: hexToRgb(COLORS.offwhite) },
    },
  });

  doc.save(`Pharos_Comparacao_${new Date().toISOString().split('T')[0]}.pdf`);
}
