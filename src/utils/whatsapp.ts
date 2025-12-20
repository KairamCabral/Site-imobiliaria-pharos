/**
 * PHAROS - WhatsApp Utilities
 * 
 * Funções para integração com WhatsApp
 */

interface WhatsAppAppointmentData {
  propertyCode: string;
  propertyTitle: string;
  clientName: string;
  clientPhone: string;
  date: string;
  time: string;
  type: 'in_person' | 'video';
}

/**
 * Enviar informações de agendamento via WhatsApp
 */
export function sendWhatsAppAppointment(
  phoneNumber: string,
  data: WhatsAppAppointmentData
): void {
  const message = `
*Agendamento de Visita - Pharos Imobiliária*

📍 *Imóvel:* ${data.propertyCode} - ${data.propertyTitle}

👤 *Cliente:* ${data.clientName}
📞 *Telefone:* ${data.clientPhone}

📅 *Data:* ${data.date}
🕐 *Horário:* ${data.time}
${data.type === 'in_person' ? '🏠 *Tipo:* Visita Presencial' : '📹 *Tipo:* Visita por Vídeo'}

---
_Agendamento realizado via site oficial_
  `.trim();

  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${phoneNumber.replace(/\D/g, '')}?text=${encodedMessage}`;

  // Abrir WhatsApp
  window.open(whatsappUrl, '_blank');

  // Analytics
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'whatsapp_redirect', {
      type: 'appointment',
      property_code: data.propertyCode,
    });
  }
}

/**
 * Gerar link de WhatsApp para contato geral
 */
export function getWhatsAppLink(
  phoneNumber: string,
  message: string
): string {
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${phoneNumber.replace(/\D/g, '')}?text=${encodedMessage}`;
}

/**
 * Gerar arquivo .ics para adicionar ao calendário
 */
export function generateICSFile(data: {
  title: string;
  description: string;
  location: string;
  startDate: Date;
  endDate: Date;
}): string {
  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Pharos Imobiliária//Agendamento//PT
BEGIN:VEVENT
UID:${Date.now()}@pharos.imobiliaria
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(data.startDate)}
DTEND:${formatDate(data.endDate)}
SUMMARY:${data.title}
DESCRIPTION:${data.description}
LOCATION:${data.location}
END:VEVENT
END:VCALENDAR`;

  return icsContent;
}

/**
 * Download de arquivo .ics
 */
export function downloadICS(
  icsContent: string,
  filename: string = 'agendamento-pharos.ics'
): void {
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

