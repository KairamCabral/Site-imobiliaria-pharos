/**
 * Componente de Loading para detalhes do imóvel
 */

export default function PropertyDetailLoading() {
  return (
    <div className="animate-pulse">
      {/* Hero skeleton */}
      <div className="h-[600px] bg-gray-200"></div>

      <div className="container mx-auto px-6 sm:px-10 md:px-16 lg:px-24 max-w-screen-2xl py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Conteúdo principal */}
          <div className="lg:col-span-2 space-y-8">
            {/* Título */}
            <div className="space-y-4">
              <div className="h-10 bg-gray-200 rounded w-3/4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </div>

            {/* Specs */}
            <div className="flex gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded w-24"></div>
              ))}
            </div>

            {/* Descrição */}
            <div className="space-y-3">
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-200 rounded-2xl h-96"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

