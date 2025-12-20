/**
 * StructuredData Component
 * 
 * Componente para adicionar structured data (Schema.org) nas páginas
 * Melhora SEO e possibilita rich snippets no Google
 */

interface StructuredDataProps {
  data: object | object[];
}

export default function StructuredData({ data }: StructuredDataProps) {
  // Se for array, usar @graph
  const jsonLd = Array.isArray(data)
    ? {
        '@context': 'https://schema.org',
        '@graph': data,
      }
    : data;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd),
      }}
    />
  );
}





