import { useState, useCallback, useRef, useMemo } from 'react';
import { View, ActivityIndicator, Text, TouchableOpacity, Platform } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import BottomSheet from '@gorhom/bottom-sheet';
import { Text as TextUI } from '@/registry/nativewind/components/ui/text';
import { Card, CardContent, CardTitle } from '@/registry/nativewind/components/ui/card';
import { Badge } from '@/registry/nativewind/components/ui/badge';
import { Button } from '@/registry/nativewind/components/ui/button';
import { linhaService, Linha, Ponto, HorarioItem } from '@/services/linhas';

// Platform-specific auto-import: Metro resolver picks .native.tsx or .web.tsx
import MapaLinha from '@/components/MapaLinha';

const diaDaSemana = (dia: string): string => {
  const diasMap: Record<string, string> = {
    '1': 'Segunda-feira',
    '2': 'Terça-feira',
    '3': 'Quarta-feira',
    '4': 'Quinta-feira',
    '5': 'Sexta-feira',
    '6': 'Sábado',
    '7': 'Domingo',
  };
  return diasMap[dia] || dia;
};

export default function LinhaDetailScreen() {
  const { codigo } = useLocalSearchParams<{ codigo: string }>();
  const router = useRouter();
  const bottomSheetRef = useRef<BottomSheet>(null);

  const snapPoints = useMemo(() => ['10%', '40%'], []);

  const [pontoSelecionado, setPontoSelecionado] = useState<Ponto | null>(null);

  const {
    data: linha,
    isLoading,
    isError,
    error,
  } = useQuery<Linha>({
    queryKey: ['linha', codigo],
    queryFn: () => linhaService.getLinhaById(String(codigo)),
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    enabled: !!codigo,
  });

  const { data: pontos, isLoading: isLoadingPontos } = useQuery<Ponto[]>({
    queryKey: ['pontos', codigo],
    queryFn: () => linhaService.getPontosByLinha(String(codigo)),
    staleTime: 5 * 60 * 1000,
    enabled: !!codigo,
  });

  const { data: horarios } = useQuery<HorarioItem[]>({
    queryKey: ['horarios', pontoSelecionado?.codigo],
    queryFn: () => linhaService.getHorariosPonto(String(pontoSelecionado!.codigo)),
    staleTime: 5 * 60 * 1000,
    enabled: !!pontoSelecionado?.codigo,
  });

  const handleMarcadorPress = (ponto: Ponto) => {
    setPontoSelecionado(ponto);
    bottomSheetRef.current?.expand();
  };

  const closeBottomSheet = () => {
    bottomSheetRef.current?.close();
  };

  const horariosAgrupados = useMemo(() => {
    if (!horarios || horarios.length === 0) return {};

    const grouped: Record<string, HorarioItem[]> = {};
    horarios.forEach((h) => {
      const dia = h.dia_semana || 'Indefinido';
      if (!grouped[dia]) grouped[dia] = [];
      grouped[dia].push(h);
    });
    return grouped;
  }, [horarios]);

  if (isLoading) {
    return (
      <View className="flex-1 bg-background pt-12 items-center justify-center">
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-4 text-muted-foreground">Carregando detalhes da linha...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 bg-background pt-12 items-center justify-center px-4">
        <StatusBar style="dark" />
        <Text className="text-destructive text-center mb-2">
          Erro: {error.message}
        </Text>
        <Text className="text-muted-foreground text-center text-sm">
          Não foi possível carregar os detalhes desta linha.
        </Text>
      </View>
    );
  }

  if (!linha) {
    return (
      <View className="flex-1 bg-background pt-12 items-center justify-center">
        <StatusBar style="dark" />
        <Text className="text-muted-foreground">Linha não encontrada.</Text>
      </View>
    );
  }

  const linhaCor = linha.cor || '#3b82f6';
  const pontosData = pontos || [];

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="dark" />
      <Stack.Screen
        options={{
          title: `${linha.codigo} - ${linha.nome}`,
          headerTitleStyle: { fontSize: 18 },
        }}
      />

      {/* Header with line info */}
      <View className="p-4 bg-card border-b border-border">
        <View className="flex flex-row items-center justify-between">
          <TextUI variant="h3">{linha.codigo} - {linha.nome}</TextUI>
          <Badge variant="default" style={{ backgroundColor: linhaCor }}>
            <TextUI className="text-white">{linhaCor}</TextUI>
          </Badge>
        </View>
      </View>

      {/* Map */}
      <View className="flex-1">
        {isLoadingPontos ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text className="mt-4 text-muted-foreground">Carregando pontos no mapa...</Text>
          </View>
        ) : pontosData.length > 0 ? (
          <MapaLinha
            pontos={pontosData}
            linhaCor={linhaCor}
            onMarcadorPress={handleMarcadorPress}
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Text className="text-muted-foreground">Nenhum ponto de parada cadastrado.</Text>
          </View>
        )}
      </View>

      {/* Bottom Sheet */}
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        onDismiss={closeBottomSheet}
        handleStyle={{ backgroundColor: linhaCor }}
        handleIndicatorStyle={{ backgroundColor: 'rgba(255,255,255,0.5)' }}
        backgroundStyle={{ backgroundColor: 'white' }}
      >
        <View className="flex-1 px-4 py-2">
          {pontoSelecionado && (
            <>
              <TextUI variant="h4" className="mb-2">
                {pontoSelecionado.descricao || pontoSelecionado.nome || `Ponto ${pontoSelecionado.codigo}`}
              </TextUI>
              <Badge variant="outline" className="mb-3">
                <TextUI className="text-xs">Código: {pontoSelecionado.codigo}</TextUI>
              </Badge>

              {horarios ? (
                Object.keys(horariosAgrupados).length > 0 ? (
                  Object.entries(horariosAgrupados)
                    .sort(([a], [b]) => {
                      const numA = parseInt(a, 10);
                      const numB = parseInt(b, 10);
                      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
                      return a.localeCompare(b);
                    })
                    .map(([dia, itens]) => (
                      <View key={dia} className="mb-4">
                        <TextUI variant="h4" className="text-sm font-semibold mb-2">
                          {diaDaSemana(dia)}
                        </TextUI>
                        <View className="ml-2">
                          {itens
                            .sort((a, b) => (a.hora || '').localeCompare(b.hora || ''))
                            .map((item, idx) => (
                              <TextUI key={idx} className="text-base py-1">
                                {item.hora || 'Horário não disponível'}
                              </TextUI>
                            ))}
                        </View>
                      </View>
                    ))
                ) : (
                  <Text className="text-muted-foreground">Nenhum horário disponível.</Text>
                )
              ) : (
                <View className="items-center justify-center py-4">
                  <ActivityIndicator size="small" color={linhaCor} />
                  <Text className="mt-2 text-muted-foreground">Carregando horários...</Text>
                </View>
              )}
            </>
          )}
        </View>
      </BottomSheet>
    </View>
  );
}
