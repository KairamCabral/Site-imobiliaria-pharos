'use client';

import { useState, useMemo } from 'react';
import { FavoritosProvider, useFavoritos } from '@/contexts/FavoritosContext';
import CollectionSidebar from '@/components/favoritos/CollectionSidebar';
import FavoritesToolbar from '@/components/favoritos/FavoritesToolbar';
import FavoriteCard from '@/components/favoritos/FavoriteCard';
import ComparisonTable from '@/components/favoritos/ComparisonTable';
import ShareModal from '@/components/favoritos/ShareModal';
import EmptyState, { FavoritesLoadingGrid } from '@/components/favoritos/EmptyStates';
import MapViewWrapper from '@/components/map/MapViewWrapper';
import { useGeocodedProperties } from '@/hooks/useGeocodedProperties';

/**
 * PHAROS - PÁGINA DE FAVORITOS
 * Experiência completa para gerenciar, organizar e comparar imóveis favoritos
 */

function FavoritosContent() {
  const {
    favoritos,
    viewMode,
    selectedIds,
    isLoading,
    toggleSelection,
    clearSelection,
    getFilteredFavoritos,
    currentQuery,
    colecoes,
  } = useFavoritos();

  const [showComparison, setShowComparison] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [pinnedComparisonId, setPinnedComparisonId] = useState<string | undefined>(undefined);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filteredFavoritos = useMemo(() => getFilteredFavoritos(), [getFilteredFavoritos]);
  const selectedFavoritos = useMemo(
    () => filteredFavoritos.filter(f => selectedIds.includes(f.id)),
    [filteredFavoritos, selectedIds]
  );

  const currentCollection = colecoes.find(c => c.id === currentQuery.collectionId);

  // Preparar propriedades para o mapa com geocoding
  const propertiesForMap = useMemo(() => {
    return filteredFavoritos.map(f => {
      if (!f.imovel) return null;

      // Buscar coordenadas em diferentes estruturas
      const lat = (f.imovel as any).endereco?.coordenadas?.lat
        ?? (f.imovel as any).endereco?.coordenadas?.latitude
        ?? (f.imovel as any).coordenadas?.lat
        ?? (f.imovel as any).coordenadas?.latitude
        ?? null;

      const lng = (f.imovel as any).endereco?.coordenadas?.lng
        ?? (f.imovel as any).endereco?.coordenadas?.longitude
        ?? (f.imovel as any).coordenadas?.lng
        ?? (f.imovel as any).coordenadas?.longitude
        ?? null;

      const hasValidCoords = lat && lng && isFinite(lat) && isFinite(lng);

      return {
        id: f.id,
        titulo: f.imovel.titulo,
        preco: f.imovel.preco,
        quartos: f.imovel.quartos,
        suites: f.imovel.suites,
        vagas: f.imovel.vagasGaragem,
        area: f.imovel.areaTotal,
        latitude: hasValidCoords ? lat : -26.9906,
        longitude: hasValidCoords ? lng : -48.6450,
        imagem: (f.imovel.galeria && f.imovel.galeria[0]) || f.imovel.imagemCapa,
        imagens: f.imovel.galeria || [f.imovel.imagemCapa],
        destaque: f.imovel.destaque,
        distanciaMar: f.imovel.distanciaMar,
        needsGeocoding: !hasValidCoords,
        addressForGeocoding: !hasValidCoords 
          ? `${f.imovel.endereco || ''}, ${(f.imovel as any).bairro || ''}, ${(f.imovel as any).cidade || 'Balneário Camboriú'}, SC, Brasil`.replace(/,\s*,/g, ',').trim()
          : undefined,
      };
    }).filter((p): p is NonNullable<typeof p> => p !== null);
  }, [filteredFavoritos]);

  // Aplicar geocoding automático
  const geocodedPropertiesForMap = useGeocodedProperties(propertiesForMap, viewMode === 'map');

  const handleShareClick = () => {
    setShowShareModal(true);
  };

  const handleExportClick = async () => {
    try {
      // Usar favoritos filtrados ou todos
      const favoritosParaExportar = filteredFavoritos.length > 0 
        ? filteredFavoritos 
        : favoritos;

      if (favoritosParaExportar.length === 0) {
        alert('Não há favoritos para exportar.');
        return;
      }

      // Mostrar loading
      const loadingToast = document.createElement('div');
      loadingToast.className = 'fixed top-4 right-4 z-[9999] bg-white border border-pharos-slate-300 rounded-lg shadow-xl p-4 flex items-center gap-3 animate-slide-in';
      loadingToast.innerHTML = `
        <div class="w-5 h-5 border-2 border-pharos-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span class="text-sm font-medium text-pharos-navy-900">Gerando PDF...</span>
      `;
      document.body.appendChild(loadingToast);

      // Importação dinâmica para reduzir o bundle
      const { exportFavoritosToPDF } = await import('@/utils/pdfExport');

      // Nome da coleção para o PDF
      const collectionName = currentCollection?.id !== 'default' 
        ? currentCollection?.name 
        : undefined;

      // Gerar PDF
      await exportFavoritosToPDF(favoritosParaExportar, collectionName);

      // Remover loading e mostrar sucesso
      document.body.removeChild(loadingToast);
      
      const successToast = document.createElement('div');
      successToast.className = 'fixed top-4 right-4 z-[9999] bg-white border border-green-300 rounded-lg shadow-xl p-4 flex items-center gap-3 animate-slide-in';
      successToast.innerHTML = `
        <svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
        <span class="text-sm font-medium text-pharos-navy-900">PDF gerado com sucesso!</span>
      `;
      document.body.appendChild(successToast);
      
      setTimeout(() => {
        if (document.body.contains(successToast)) {
          document.body.removeChild(successToast);
        }
      }, 3000);

      // Analytics
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'favorites_export_pdf', {
          collection: collectionName || 'all',
          count: favoritosParaExportar.length,
        });
      }
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      
      // Remover qualquer toast existente
      const existingToasts = document.querySelectorAll('.fixed.top-4.right-4');
      existingToasts.forEach(toast => document.body.removeChild(toast));
      
      // Mostrar erro
      const errorToast = document.createElement('div');
      errorToast.className = 'fixed top-4 right-4 z-[9999] bg-white border border-red-300 rounded-lg shadow-xl p-4 flex items-center gap-3 animate-slide-in';
      errorToast.innerHTML = `
        <svg class="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
        <span class="text-sm font-medium text-pharos-navy-900">Erro ao gerar o PDF</span>
      `;
      document.body.appendChild(errorToast);
      
      setTimeout(() => {
        if (document.body.contains(errorToast)) {
          document.body.removeChild(errorToast);
        }
      }, 3000);
    }
  };

  const handleRemoveFromComparison = (id: string) => {
    toggleSelection(id);
  };

  // Determinar estado vazio
  const isEmpty = filteredFavoritos.length === 0;
  const isEmptySearch = currentQuery.q || currentQuery.filters;
  const isDefaultCollection = currentQuery.collectionId === 'default';

  return (
    <div className="min-h-screen bg-pharos-base-off flex">
      {/* Sidebar (desktop) */}
      <div className="hidden lg:block">
        <CollectionSidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-[800] lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed left-0 top-0 bottom-0 z-[810] lg:hidden">
            <CollectionSidebar />
          </div>
        </>
      )}

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header com título e ações - Mobile Otimizado */}
        <div className="bg-white border-b border-pharos-slate-300 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
              {/* Menu mobile */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2.5 -ml-2 text-pharos-slate-700 hover:bg-pharos-base-off rounded-lg active:scale-95 transition-all"
                aria-label="Abrir menu de pastas"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-pharos-navy-900 truncate">
                  Favoritos
                </h1>
                <p className="text-xs sm:text-sm text-pharos-slate-500 mt-0.5 sm:mt-1 truncate">
                  {currentCollection?.name || 'Todos os favoritos'}
                  {filteredFavoritos.length > 0 && (
                    <span className="ml-2 hidden sm:inline">• {filteredFavoritos.length} {filteredFavoritos.length === 1 ? 'imóvel' : 'imóveis'}</span>
                  )}
                </p>
              </div>
            </div>

            {/* Botão de comparação (mobile) */}
            {selectedIds.length > 0 && (
              <button
                onClick={() => setShowComparison(true)}
                className="lg:hidden px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-medium text-white bg-pharos-blue-500 rounded-lg hover:bg-pharos-blue-600 active:scale-95 transition-all flex items-center gap-1.5 whitespace-nowrap flex-shrink-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 2 0 012 2" />
                </svg>
                <span className="hidden sm:inline">Comparar</span>
                <span>({selectedIds.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Toolbar */}
        <FavoritesToolbar
          onShareClick={handleShareClick}
          onExportClick={handleExportClick}
          showBulkActions={selectedIds.length > 0}
        />

        {/* Área de conteúdo - Mobile Otimizado */}
        <div className={`flex-1 ${viewMode === 'map' ? 'overflow-hidden' : 'overflow-auto'}`}>
          <div className={`${viewMode === 'map' ? 'h-full' : 'max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8'}`}>
            {isLoading ? (
              <FavoritesLoadingGrid count={6} />
            ) : isEmpty ? (
              isEmptySearch ? (
                <EmptyState type="no-results" />
              ) : isDefaultCollection ? (
                <EmptyState type="no-favorites" />
              ) : (
                <EmptyState type="empty-collection" collectionName={currentCollection?.name} />
              )
            ) : (
              <>
                {/* Grade de cards - Grid Responsivo */}
                {viewMode === 'grid' && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
                      {filteredFavoritos.map((favorito) => (
                        <FavoriteCard
                          key={favorito.id}
                          favorito={favorito}
                          isSelected={selectedIds.includes(favorito.id)}
                          onToggleSelection={() => toggleSelection(favorito.id)}
                          showCheckbox={selectedIds.length > 0}
                        />
                      ))}
                    </div>
                    
                    {/* Aviso de fim de lista - Portfólio Exclusivo */}
                    {filteredFavoritos.length >= 3 && (
                      <div className="mt-12">
                        <EmptyState type="end-of-favorites" />
                      </div>
                    )}
                  </>
                )}

                {/* Mapa - Mobile Otimizado com Geocoding */}
                {viewMode === 'map' && (
                  <div className="h-[calc(100vh-200px)] sm:h-[calc(100vh-240px)] lg:h-[calc(100vh-280px)] min-h-[500px] sm:min-h-[600px] rounded-lg sm:rounded-2xl overflow-hidden border border-pharos-slate-300">
                    {geocodedPropertiesForMap.length > 0 ? (
                      <MapViewWrapper
                        properties={geocodedPropertiesForMap}
                        onPropertySelect={(id: string) => {
                          if (id) {
                            window.open(`/imoveis/${id}`, '_blank');
                          }
                        }}
                        selectedPropertyId={selectedIds[0]}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gradient-to-br from-[#F7F9FC] to-[#E8ECF2] p-8">
                        <div className="text-center max-w-md">
                          <div className="bg-white rounded-2xl p-8 shadow-lg">
                            <svg className="w-16 h-16 text-[#054ADA] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <h3 className="text-xl font-bold text-[#192233] mb-3">
                              Adicione Favoritos
                            </h3>
                            <p className="text-[#8E99AB] font-medium leading-relaxed">
                              Você ainda não tem imóveis favoritos para exibir no mapa.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Barra flutuante de comparação (desktop) */}
        {selectedIds.length > 0 && !showComparison && (
          <div className="hidden lg:block fixed bottom-6 left-1/2 -translate-x-1/2 z-[500]">
            <div className="bg-pharos-navy-900 text-white rounded-2xl shadow-2xl px-6 py-4 flex items-center gap-4">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-pharos-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="font-semibold">
                  {selectedIds.length} {selectedIds.length === 1 ? 'imóvel selecionado' : 'imóveis selecionados'}
                </span>
              </div>

              <div className="w-px h-8 bg-white/20" />

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowComparison(true)}
                  className="px-4 py-2 text-sm font-medium text-pharos-navy-900 bg-white rounded-lg hover:bg-pharos-slate-300 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Comparar
                </button>

                <button
                  onClick={clearSelection}
                  className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  aria-label="Limpar seleção"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de comparação */}
        {showComparison && selectedFavoritos.length > 0 && (
          <ComparisonTable
            favoritos={selectedFavoritos}
            onClose={() => setShowComparison(false)}
            onRemove={handleRemoveFromComparison}
            onPin={setPinnedComparisonId}
            pinnedId={pinnedComparisonId}
          />
        )}

        {/* Modal de compartilhamento */}
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          collectionId={currentQuery.collectionId}
          collectionName={currentCollection?.name}
        />
      </div>
    </div>
  );
}

export default function FavoritosPage() {
  return (
    <FavoritosProvider>
      <FavoritosContent />
    </FavoritosProvider>
  );
}

