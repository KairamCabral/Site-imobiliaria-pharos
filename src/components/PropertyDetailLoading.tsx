/**
 * Componente de Loading para detalhes do imóvel
 */

export default function PropertyDetailLoading() {
  return (
    <div className="animate-pulse overflow-x-hidden">
      {/* Hero skeleton */}
      <div className="h-[400px] md:h-[600px] bg-gray-200 w-full"></div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 md:py-12 overflow-x-hidden">
        <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
          {/* Conteúdo principal */}
          <div className="lg:col-span-2 space-y-6 md:space-y-8 overflow-x-hidden">
            {/* Título */}
            <div className="space-y-3 md:space-y-4">
              <div className="h-8 md:h-10 bg-gray-200 rounded w-3/4 max-w-full"></div>
              <div className="h-5 md:h-6 bg-gray-200 rounded w-1/2 max-w-full"></div>
            </div>

            {/* Specs */}
            <div className="flex gap-3 md:gap-6 overflow-x-auto pb-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 md:h-20 bg-gray-200 rounded w-20 md:w-24 flex-shrink-0"></div>
              ))}
            </div>

            {/* Descrição */}
            <div className="space-y-2 md:space-y-3 max-w-full">
              <div className="h-5 md:h-6 bg-gray-200 rounded w-1/4 max-w-full"></div>
              <div className="h-3 md:h-4 bg-gray-200 rounded max-w-full"></div>
              <div className="h-3 md:h-4 bg-gray-200 rounded max-w-full"></div>
              <div className="h-3 md:h-4 bg-gray-200 rounded w-5/6 max-w-full"></div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-200 rounded-2xl h-64 md:h-96 max-w-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

