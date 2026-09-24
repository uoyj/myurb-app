import { useEffect, useMemo } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents } from 'react-leaflet';
typeof document !== 'undefined' && document.querySelector('#leaflet-css') === null && (() => {
  const link = document.createElement('link');
  link.id = 'leaflet-css';
  link.rel = 'stylesheet';
  link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
  document.head.appendChild(link);
})();
import { Ponto, TrajetoFeature } from '@/services/linhas';
import L from 'leaflet';

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
  trajeto?: TrajetoFeature | null;
}

type Pos = [number, number];

// Aceita MultiLineString (3 niveis) ou LineString (2 niveis) e normaliza para segmentos
function segmentosDoTrajeto(trajeto: TrajetoFeature | null | undefined): Pos[][] {
  const coords = trajeto?.geometry?.coordinates as unknown;
  if (!Array.isArray(coords) || coords.length === 0) return [];

  const primeiro = (coords as unknown[])[0];
  if (Array.isArray(primeiro) && typeof (primeiro as unknown[])[0] === 'number') {
    return [coords as Pos[]]; // LineString -> embrulha em 1 segmento
  }
  return coords as Pos[][];   // MultiLineString
}

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
      "div>
    `,
    className: 'custom-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 24],
  });
}

function MapController({ pontos, trajeto }: { pontos: Ponto[]; trajeto?: TrajetoFeature | null }) {
  const map = useMapEvents({});

  useEffect(() => {
    if (!map) return;

    let bounds: L.LatLngBounds | null = null;
    const segmentos = segmentosDoTrajeto(trajeto);

    if (segmentos.length > 0) {
      const latLngs: L.LatLngExpression[] = [];
      segmentos.forEach((segmento) => {
        segmento.forEach(([lng, lat]) => {
          latLngs.push([lat, lng]);
        });
      });
      bounds = L.latLngBounds(latLngs);
    } else if (pontos && pontos.length > 0) {
      bounds = L.latLngBounds(
        pontos.map((p) => ({
          lat: p.latitude,
          lng: p.longitude,
        }))
      );
    }

    if (bounds && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [pontos, trajeto, map]);

  return null;
}

const MapaLinhaWeb = ({ pontos, linhaCor, onMarcadorPress, trajeto }: MapaLinhaProps) => {
  const customIcon = useMemo(() => createCustomIcon(linhaCor), [linhaCor]);
  const segmentosTrajeto = useMemo(() => segmentosDoTrajeto(trajeto), [trajeto]);

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
        <MapController pontos={pontos} trajeto={trajeto} />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
        />
        {segmentosTrajeto.map((segmento, idx) => (
          <Polyline
            key={`trajeto-${idx}`}
            positions={segmento
              .filter((p): p is Pos => Array.isArray(p) && p.length >= 2)
              .map(([lng, lat]): Pos => [lat, lng])}
            pathOptions={{ color: linhaCor, weight: 4, opacity: 0.9 }}
          />
        ))}
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