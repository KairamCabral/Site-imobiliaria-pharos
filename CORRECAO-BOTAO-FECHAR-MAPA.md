# Correção: Botão de Fechar no Mini-Card do Mapa

## 🐛 Problema

O botão de fechar (X) estava **visível**, mas **não funcionava** quando clicado.

## 🔍 Causa Raiz

O callback `handleCloseMiniCard` apenas atualizava o estado React (`setSelectedProperty(null)`), mas **não fechava o Popup do Leaflet**.

O Leaflet gerencia seus popups internamente, então é necessário chamar `map.closePopup()` programaticamente.

## ✅ Solução Implementada

### 1. Criado Componente Helper para Capturar o Mapa

```tsx
/**
 * Componente que captura a instância do mapa
 */
function MapInstanceGetter({ onMapReady }: { onMapReady: (map: L.Map) => void }) {
  const map = useMap();
  
  useEffect(() => {
    if (map) {
      onMapReady(map);
    }
  }, [map, onMapReady]);

  return null;
}
```

### 2. Adicionado State para Armazenar a Instância do Mapa

```tsx
// Referência para o mapa
const [mapInstance, setMapInstance] = useState<L.Map | null>(null);

// Callback quando o mapa está pronto
const handleMapReady = useCallback((map: L.Map) => {
  setMapInstance(map);
}, []);
```

### 3. Atualizado `handleCloseMiniCard` para Fechar o Popup

```tsx
// Fechar mini card e popup
const handleCloseMiniCard = useCallback(() => {
  setSelectedProperty(null);
  if (onPropertySelect) {
    onPropertySelect(null);
  }
  // Fechar todos os popups abertos
  if (mapInstance) {
    mapInstance.closePopup(); // ← CHAVE DA SOLUÇÃO
  }
}, [onPropertySelect, mapInstance]);
```

### 4. Adicionado o Helper no MapContainer

```tsx
<MapContainer>
  <TileLayer />
  
  {/* Capturar instância do mapa */}
  <MapInstanceGetter onMapReady={handleMapReady} />
  
  {/* Resto dos componentes */}
</MapContainer>
```

## 🧪 Como Testar

1. Acesse: http://localhost:3600/imoveis?view=map
2. Clique em qualquer **marcador azul** no mapa
3. O mini-card deve abrir
4. Clique no **botão X azul** no canto superior direito
5. ✅ O popup deve **fechar imediatamente**

## 📚 Referência Técnica

- **Hook usado**: `useMap()` do `react-leaflet`
- **Método Leaflet**: `map.closePopup()`
- **Documentação**: https://leafletjs.com/reference.html#map-closepopup

## 🎯 Resultado

✅ Botão de fechar **visível**  
✅ Botão de fechar **funcional**  
✅ Popup fecha **instantaneamente** ao clicar  
✅ Estado React sincronizado com Leaflet

---

**Arquivo modificado:**
- `src/components/map/MapView.tsx`

