import { useEffect, useMemo, useRef } from 'react';
import MapView, { Marker, UrlTile, PROVIDER_DEFAULT } from 'react-native-maps';
import { View, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { Ponto } from '@/services/linhas';

interface MapaLinhaProps {
  pontos: Ponto[];
  linhaCor: string;
  onMarcadorPress: (ponto: Ponto) => void;
}

const MapaLinhaNative = ({ pontos, linhaCor, onMarcadorPress }: MapaLinhaProps) => {
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    // Ajusta a câmera para mostrar todos os marcadores
    if (pontos.length > 0 && mapRef.current) {
      const coordinates = pontos.map((p) => ({
        latitude: p.latitude,
        longitude: p.longitude,
      }));
      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }
  }, [pontos]);

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
