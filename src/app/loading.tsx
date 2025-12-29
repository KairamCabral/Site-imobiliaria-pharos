export default function Loading() {
  return (
    <div className="fixed inset-0 z-[999999] bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
      <div className="relative">
        {/* Círculo externo pulsante */}
        <div className="absolute inset-0 rounded-full bg-blue-500/10 animate-ping"></div>
        
        {/* Círculo principal */}
        <div className="relative w-16 h-16 rounded-full border-2 border-gray-200 flex items-center justify-center">
          {/* Spinner interno */}
          <div className="absolute inset-0 rounded-full border-t-2 border-blue-600 animate-spin"></div>
          
          {/* Centro com gradiente */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 opacity-20 animate-pulse"></div>
        </div>
        
        {/* Texto minimalista */}
        <div className="absolute top-full mt-8 left-1/2 -translate-x-1/2 w-max">
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0ms]"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:150ms]"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:300ms]"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

