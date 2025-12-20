/**
 * Componente de Loading para lista de imóveis
 */

export default function PropertiesLoading({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse"
        >
          {/* Imagem skeleton */}
          <div className="h-64 bg-gray-200"></div>
          
          {/* Conteúdo skeleton */}
          <div className="p-6 space-y-4">
            {/* Título */}
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            
            {/* Endereço */}
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            
            {/* Specs */}
            <div className="flex gap-4">
              <div className="h-4 bg-gray-200 rounded w-16"></div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
            
            {/* Preço */}
            <div className="h-8 bg-gray-200 rounded w-2/3"></div>
            
            {/* Botão */}
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

