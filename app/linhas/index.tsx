import { useState, useMemo } from 'react';
import { View, FlatList, ActivityIndicator, TouchableOpacity, TextInput } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Text } from '@/registry/nativewind/components/ui/text';
import { Input } from '@/registry/nativewind/components/ui/input';
import { Card, CardContent, CardTitle } from '@/registry/nativewind/components/ui/card';
import { Badge } from '@/registry/nativewind/components/ui/badge';
import { linhaService, Linha } from '@/services/linhas';

export default function LinhasListScreen() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');

  const {
    data: linhas,
    isLoading,
    isError,
    error,
  } = useQuery<Linha[]>({
    queryKey: ['linhas'],
    queryFn: () => linhaService.getLinhas(),
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
  });

  // Filtragem client-side
  const filteredLinhas = useMemo(() => {
    if (!linhas) return [];
    const search = searchText.toLowerCase().trim();
    if (!search) return linhas;
    return linhas.filter(
      (linha) =>
        linha.codigo?.toString().toLowerCase().includes(search) ||
        linha.nome?.toLowerCase().includes(search),
    );
  }, [linhas, searchText]);

  const handleLinhaPress = (codigo: string) => {
    router.push(`/linha/${codigo}`);
  };

  const renderLinha = ({ item }: { item: Linha }) => {
    const linhaCor = item.cor || '#3b82f6';
    return (
      <TouchableOpacity
        onPress={() => handleLinhaPress(item.codigo)}
        activeOpacity={0.7}
      >
        <Card className="mb-3 border-l-4" style={{ borderLeftColor: linhaCor }}>
          <CardContent className="flex flex-row items-center justify-between p-4">
            <View className="flex-1">
              <CardTitle className="text-lg">{item.codigo} - {item.nome}</CardTitle>
            </View>
            <Badge variant="default" style={{ backgroundColor: linhaCor }}>
              <Text className="text-white text-xs">{item.cor || 'Sem cor'}</Text>
            </Badge>
          </CardContent>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-background pt-12">
      <StatusBar style="dark" />

      <View className="px-4 mb-4">
        <Text variant="h3" className="mb-3">
          Linhas de Ônibus
        </Text>
        <Input
          placeholder="Buscar por código ou nome..."
          value={searchText}
          onChangeText={setSearchText}
          className="w-full"
        />
      </View>

      {isLoading && (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="mt-4 text-muted-foreground">Carregando linhas...</Text>
        </View>
      )}

      {isError && (
        <View className="flex-1 items-center justify-center px-4">
          <Text className="text-destructive text-center mb-2">
            Erro ao carregar linhas: {error.message}
          </Text>
          <Text className="text-muted-foreground text-center text-sm">
            Verifique a conexão com a API.
          </Text>
        </View>
      )}

      {!isLoading && !isError && filteredLinhas.length > 0 && (
        <FlatList
          data={filteredLinhas}
          keyExtractor={(item) => String(item.codigo || item.id || Math.random())}
          renderItem={renderLinha}
          className="px-4"
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}

      {!isLoading && !isError && filteredLinhas.length === 0 && searchText && (
        <View className="flex-1 items-center justify-center">
          <Text className="text-muted-foreground">
            Nenhuma linha encontrada para "{searchText}".
          </Text>
        </View>
      )}

      {!isLoading && !isError && linhas && linhas.length === 0 && (
        <View className="flex-1 items-center justify-center">
          <Text className="text-muted-foreground">Nenhuma linha encontrada.</Text>
        </View>
      )}
    </View>
  );
}
