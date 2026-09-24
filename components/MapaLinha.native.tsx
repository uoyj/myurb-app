import { useEffect, useMemo, useRef } from 'react';
import MapView, { Marker, UrlTile, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import { View, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { Ponto, TrajetoFeature } from '@/services/linhas';

interface MapaLinhaProps {
  pontos: Ponto[];
  linhaCor: string;
  onMarcadorPress: (ponto: Ponto) => void;
  trajeto?: TrajetoFeature | null;
}

const MapaLinhaNative = ({ pontos, linhaCor, onMarcadorPress, trajeto }: MapaLinhaProps) => {
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    // Ajusta a câmera para mostrar o trajeto (se houver) ou todos os marcadores
    if (!mapRef.current) return;

    let coordinates: { latitude: number; longitude: number }[] = [];

    if (trajeto?.geometry?.coordinates?.length) {
      coordinates = trajeto.geometry.coordinates.flatMap((segmento) =>
        segmento.map(([lng, lat]) => ({ latitude: lat, longitude: lng }))
      );
    } else if (pontos.length > 0) {
      coordinates = pontos.map((p) => ({
        latitude: p.latitude,
        longitude: p.longitude,
      }));
    }

    if (coordinates.length > 0) {
      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }
  }, [pontos, trajeto]);

  if (!pontos || pontos.length === 0) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-4 text-muted-foreground">Carregando pontos no mapa...</Text>
      </View>
    );
  }

  return (
    <MapView
      ref={mapRef}
      style={{ flex: 1 }}
      provider={PROVIDER_DEFAULT}
      showsUserLocation={true}
      showsMyLocationButton={true}
    >
      <UrlTile
        urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        maximumZ={19}
      />
      {trajeto?.geometry?.coordinates?.map((segmento, idx) => (
        <Polyline
          key={`trajeto-${idx}`}
          coordinates={segmento.map(([lng, lat]) => ({ latitude: lat, longitude: lng }))}
          strokeColor={linhaCor}
          strokeWidth={4}
          tappable={false}
        />
      ))}
      {pontos.map((ponto) => (
        <Marker
          key={ponto.codigo}
          coordinate={{ latitude: ponto.latitude, longitude: ponto.longitude }}
          title={ponto.nome}
          description={ponto.cor || linhaCor}
          pinColor={ponto.cor || linhaCor}
          onPress={() => onMarcadorPress(ponto)}
        />
      ))}
    </MapView>
  );
};

export default MapaLinhaNative;
