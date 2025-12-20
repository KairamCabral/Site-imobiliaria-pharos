export default function PropertyCardSkeleton() {
  return (
    <div className="block bg-white rounded-[20px] border border-[#E8ECF2] overflow-hidden">
      <div className="flex flex-col sm:flex-row h-full">
        {/* Imagem Skeleton */}
        <div className="relative w-full sm:w-[280px] lg:w-[320px] h-[240px] sm:h-auto flex-shrink-0 bg-[#F5F7FA] skeleton" />

        {/* Conteúdo Skeleton */}
        <div className="flex-1 p-4 sm:p-5 lg:p-6 min-w-0">
          {/* Título */}
          <div className="h-6 bg-[#F5F7FA] rounded-lg mb-3 w-4/5 skeleton" />

          {/* Endereço */}
          <div className="h-4 bg-[#F5F7FA] rounded-lg mb-4 w-2/3 skeleton" />

          {/* Metadados */}
          <div className="flex items-center gap-4 mb-3">
            <div className="h-4 bg-[#F5F7FA] rounded-lg w-16 skeleton" />
            <div className="h-4 bg-[#F5F7FA] rounded-lg w-20 skeleton" />
            <div className="h-4 bg-[#F5F7FA] rounded-lg w-16 skeleton" />
            <div className="h-4 bg-[#F5F7FA] rounded-lg w-14 skeleton" />
          </div>

          {/* Tags */}
          <div className="flex items-center gap-2">
            <div className="h-6 bg-[#F5F7FA] rounded-lg w-24 skeleton" />
            <div className="h-6 bg-[#F5F7FA] rounded-lg w-32 skeleton" />
          </div>
        </div>

        {/* CTA Skeleton */}
        <div className="flex flex-col justify-between p-4 sm:p-5 lg:p-6 sm:w-[200px] lg:w-[240px] border-t sm:border-t-0 sm:border-l border-[#E8ECF2] bg-[#F5F7FA]/30">
          <div className="mb-4">
            <div className="h-8 bg-[#F5F7FA] rounded-lg w-full mb-2 skeleton" />
          </div>
          <div className="space-y-2">
            <div className="h-12 bg-[#F5F7FA] rounded-xl w-full skeleton" />
            <div className="h-11 bg-[#F5F7FA] rounded-xl w-full skeleton" />
          </div>
        </div>
      </div>
    </div>
  );
}

