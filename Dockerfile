# ---------- STAGE 1: build ----------
FROM node:22-alpine AS build
WORKDIR /app

# EXPO_PUBLIC_* é inlinada no bundle NA HORA DO BUILD
ARG EXPO_PUBLIC_API_URL
ENV EXPO_PUBLIC_API_URL=${EXPO_PUBLIC_API_URL}

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .
RUN npx expo export --platform web

# ---------- STAGE 2: serve ----------
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80