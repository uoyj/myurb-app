import { useEffect, useMemo } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
// CSS import via link tag in HTML is needed for Leaflet on web
// O import estático 'leaflet/dist/leaflet.css' não funciona com o bundler do Expo
typeof document !== 'undefined' && document.querySelector('#leaflet-css') === null && (() => {
  const link = document.createElement('link');
  link.id = 'leaflet-css';
  link.rel = 'stylesheet';
  link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
  document.head.appendChild(link);
})();
import { Ponto } from '@/services/linhas';
import L from 'leaflet';

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.3/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.3/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.3/images/marker-shadow.png',
});

interface MapaLinhaProps {
  pontos: Ponto[];
  linhaCor: string;
  onMarcadorPress: (ponto: Ponto) => void;
}

// Custom icon with line color
function createCustomIcon(color: string) {
  return L.divIcon({
    html: `
      <div style="
        width: 24px;
        height: 24px;
        border-radius: 50% 50% 50% 0;
        background-color: ${color};
        transform: rotate(45deg);
        border: 2px solid white;
        box-shadow: 0 0 3px rgba(0,0,0,0.5);
      "></div>
    `,
    className: 'custom-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 24],
  });
}

// Component to handle map interactions and fit bounds
function MapController({ pontos }: { pontos: Ponto[] }) {
  const map = useMapEvents({});

  useEffect(() => {
    if (pontos && pontos.length > 0 && map) {
      const bounds = L.latLngBounds(
        pontos.map((p) => ({
          lat: p.latitude,
          lng: p.longitude,
        }))
      );
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [pontos, map]);

  return null;
}

const MapaLinhaWeb = ({ pontos, linhaCor, onMarcadorPress }: MapaLinhaProps) => {
  const customIcon = useMemo(() => createCustomIcon(linhaCor), [linhaCor]);

  if (!pontos || pontos.length === 0) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-4 text-muted-foreground">Carregando pontos no mapa...</Text>
      </View>
    );
  }

  const center: [number, number] = [
    pontos[0].latitude,
    pontos[0].longitude,
  ];

  return (
    <View style={{ height: '100%', width: '100%' }}>
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        key={`map-${pontos.length}`}
      >
        <MapController pontos={pontos} />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
        />
        {pontos.map((ponto) => (
          <Marker
            key={ponto.codigo}
            position={[ponto.latitude, ponto.longitude]}
            icon={customIcon}
            eventHandlers={{
              click: () => onMarcadorPress(ponto),
            }}
          />
        ))}
      </MapContainer>
    </View>
  );
};

export default MapaLinhaWeb;
