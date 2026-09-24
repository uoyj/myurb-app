# AGENTS.md — myurb-app (Expo/React Native + Leaflet web)

App de consulta de linhas de onibus da URBS (Curitiba). Consome a API
transporte-urbs-api (ver services/linhas.ts, base via EXPO_PUBLIC_API_URL).

## Stack fixa (NUNCA subir versoes sem necessidade)

Expo SDK 57 (RN 0.86, React 19.2), expo-router, nativewind v4 + tailwind 3.4,
@tanstack/react-query v5, react-leaflet v5 (web), react-native-maps 1.27 (nativo).
Docs sempre na versao exata: https://docs.expo.dev/versions/v57.0.0/

## Estrutura e padroes

- Rotas em app/ (expo-router file-based). Detalhe da linha: app/linha/[codigo].tsx
- Componentes de mapa sao PLATFORM-SPLIT: MapaLinha.native.tsx (react-native-maps)
e MapaLinha.web.tsx (react-leaflet). Metro resolve por extensao. Ao mudar a
interface de um, mude do outro na mesma tarefa.
- Servicos em services/*.ts: classe Service com baseUrl de env var, metodos
fetch com tratamento {ok} / 404->null quando a ausencia for caso normal.
- Tipos das respostas da API exportados no proprio service.
- Estilos: classes tailwind/nativewind (className). Cores semantigas do tema
(bg-background, text-muted-foreground etc.). Cores de dominio vem da API
(linha.cor, hex).
- Textos de UI em pt-BR, com acentos. Comentarios em pt-BR.

## Dados e cache

- React Query com staleTime 5 min para listas/detalhes; dados diarios
(ex.: trajeto, atualizado 1x/dia) usam staleTime de 24 h.
ETag da API complementa o cache — nao implementar cache manual.
- Queries chaveadas por entidade: ['linhas'], ['linha', codigo], ['pontos',
codigo], ['trajeto', codigo], ['horarios', pontoCodigo].
- Dados de melhoria (ex.: trajeto) nunca bloqueiam a tela: renderiza o que tem,
o restante aparece quando resolver. Erro de melhoria = silencioso.

## Geo/Mapas — cuidados obrigatorios

- GeoJSON e RFC 7946: coordinates [lng, lat]. Toda conversao para leaflet /
react-native-maps deve inverter para {latitude, longitude} / [lat, lng].
Esquecer a inversao e o bug classico — revise sempre.
- react-leaflet v5: Polyline positions=[lat, lng]; Polyline vai ANTES dos
Marker no JSX para ficar sob os pontos.
- react-native-maps: <Polyline coordinates strokeColor strokeWidth>; mesmo
posicionamento antes dos Marker.

## Variaveis de ambiente

EXPO_PUBLIC_API_URL — unica var obrigatoria (.env / .env.example). Expo exige
prefixo EXPO_PUBLIC_ para expor ao bundle. Dev: http://192.168.2.115:8000.

## Build / validacao

- npx tsc --noEmit (tipos)
- npx expo export --platform web (build web; usado no Dockerfile)
- npm start (dev; expo start)
- Web em producao: Dockerfile (nginx) + scripts/proxy.js (proxy /linhas, /pontos
etc. para a API real + CORS). Qualquer endpoint novo sob /linhas ou /pontos
passa pelo proxy automaticamente.

## Definicao de pronto

- [ ] tsc --noEmit limpo
- [ ] export web compila
- [ ] comportamento validado nas DUAS plataformas (web e nativo) quando a
mudanca toca MapaLinha ou services
- [ ] interface .native/.web consistente
- [ ] sem dependencias novas sem justificativa no commit
