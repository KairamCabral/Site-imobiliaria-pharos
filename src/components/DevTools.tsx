'use client';

import { useState, useEffect } from 'react';
import { useFavoritos } from '@/contexts/FavoritosContext';

/**
 * PHAROS - DEV TOOLS
 * Painel de debug para desenvolvimento
 * Aparece apenas em NODE_ENV=development
 */

export default function DevTools() {
  const [isOpen, setIsOpen] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const { favoritos, getTotalCount, removeFavorito, addFavorito } = useFavoritos();
  
  useEffect(() => {
    // Só mostrar em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      setShowPanel(true);
    }
  }, []);
  
  if (!showPanel) return null;
  
  const limparTodos = () => {
    if (confirm('Limpar TODOS os favoritos?')) {
      localStorage.removeItem('pharos_favoritos_guest');
      window.location.reload();
    }
  };
  
  const adicionarTeste = () => {
    const ids = ['imovel-001', 'imovel-002', 'imovel-003'];
    const randomId = ids[Math.floor(Math.random() * ids.length)];
    addFavorito(randomId);
  };
  
  return (
    <>
      {/* Botão flutuante */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-[9999] w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center font-mono font-bold text-sm"
        title="Dev Tools"
      >
        🔧
      </button>
      
      {/* Painel */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-[9999] w-80 bg-gray-900 text-white rounded-lg shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">🔧</span>
              <span className="font-bold text-sm">PHAROS DEV TOOLS</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white text-xl leading-none"
            >
              ×
            </button>
          </div>
          
          {/* Body */}
          <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
            {/* Status */}
            <div className="bg-gray-800 rounded-lg p-3 space-y-2">
              <h3 className="font-semibold text-xs text-gray-400 uppercase">Status</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <div className="text-gray-400 text-xs">Total Favoritos</div>
                  <div className="text-2xl font-bold text-green-400">{getTotalCount()}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs">LocalStorage</div>
                  <div className="text-xs text-gray-300 mt-1 font-mono">
                    {localStorage.getItem('pharos_favoritos_guest') ? '✅ OK' : '❌ Vazio'}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Favoritos */}
            <div className="bg-gray-800 rounded-lg p-3">
              <h3 className="font-semibold text-xs text-gray-400 uppercase mb-2">
                Favoritos ({favoritos.length})
              </h3>
              {favoritos.length === 0 ? (
                <p className="text-xs text-gray-500 italic">Nenhum favorito salvo</p>
              ) : (
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {favoritos.map((fav) => (
                    <div
                      key={fav.id}
                      className="flex items-center justify-between bg-gray-700/50 rounded px-2 py-1 text-xs"
                    >
                      <span className="font-mono text-gray-300">{fav.id}</span>
                      <button
                        onClick={() => {
                          if (confirm(`Remover ${fav.id}?`)) {
                            removeFavorito(fav.id);
                          }
                        }}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Ações */}
            <div className="space-y-2">
              <button
                onClick={adicionarTeste}
                className="w-full bg-green-600 hover:bg-green-700 text-white text-sm py-2 px-3 rounded-lg transition-colors"
              >
                ➕ Adicionar Favorito Teste
              </button>
              
              <button
                onClick={limparTodos}
                className="w-full bg-red-600 hover:bg-red-700 text-white text-sm py-2 px-3 rounded-lg transition-colors"
              >
                🗑️ Limpar Todos
              </button>
              
              <button
                onClick={() => {
                  const data = localStorage.getItem('pharos_favoritos_guest');
                  console.log('📋 Dados do localStorage:', JSON.parse(data || '{}'));
                  alert('Dados logados no console!');
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-3 rounded-lg transition-colors"
              >
                📋 Log no Console
              </button>
            </div>
            
            {/* Info */}
            <div className="text-xs text-gray-500 space-y-1">
              <div>💡 Use F12 → Console para mais logs</div>
              <div>🔄 Alterações atualizam em tempo real</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

