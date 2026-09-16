# myurb-app

Aplicativo mobile (Expo / React Native) para consulta de linhas, pontos e horários da URBS (Curitiba), com visualização no mapa.

## Stack

- **Expo** ~57.0.23 + **React Native** 0.86.3
- **React Navigation** v7 (`native-stack`)
- **NativeWind** v4.2.7 (Tailwind CSS v3)
- **React Query** v5 — cache e fetching de dados
- **react-native-maps** — mapas (Android/iOS)
- **expo-router** — navegação baseada em arquivos
- **TypeScript** ~6.0.3

## Requisitos

- Node.js >= 20
- Yarn ou npm
- Conta Expo (para build e publicação)

## Instalação

```bash
git clone <repo-url> myurb-app
cd myurb-app
npm install
```

## Scripts

| Script | Descrição |
|--------|-----------|
| `npm start` | Inicia o Expo Dev Server (geralmente abre no modo "w" / web) |
| `npm run android` | Abre o emulador Android (ou dispositivo conectado) |
| `npm run ios` | Abre o simulador iOS |
| `npm run web` | Inicia a versão web via `expo start --web` |
| `npm run lint` | Executa `expo lint` |

## Configuração

### API URBS

A API consumida é o projeto **`transporte-urbs-api`** (FastAPI), acessível em:

```
http://192.168.2.115:8000
```

> ⚠️ A API roda no **LXC 115** (`urbs-api`). CORS já está configurado para permitir requisições do dev server (`localhost:8081` e `192.168.2.115:8081`).

### Estrutura de endpoints (sem prefixo `/api`)

- `GET /linhas` — Lista de linhas (filtrar client-side)
- `GET /pontos?linha=<codigo>` — Pontos de uma linha
- `GET /horarios?ponto=<codigo>&dia=<codigo>` — Horários por ponto e dia

### Detalhes da API

- Pontos usam o campo `descricao` (não `nome`)
- Horários usam o campo `hora` (não `horario`)
- `dia_semana` é um código numérico (1–7)
- Não existe `/linhas/{codigo}` — filtrar client-side sempre

## Desenvolvimento

### Web (desenvolvimento rápido)

```bash
npm run web
```

Acesse `http://localhost:8081` no navegador.

### Mobile (dispositivo ou emulador)

```bash
npm start
```

- **Android**: escaneie o QR code com o app Expo Go ou execute `npm run android`
- **iOS**: escaneie com a câmera ou execute `npm run ios`

### Variáveis de ambiente

Se houver `.env` ou `app.config.ts`, ajuste a URL da API:

```ts
// app.config.ts (ou .env)
API_BASE_URL=http://192.168.2.115:8000
```

## Build

```bash
npx expo build:android
npx expo build:ios
```

## Licença

MIT
