FROM node:20-alpine3.20 AS build

WORKDIR /usr/src/app

COPY package*.json package-lock.json ./

RUN npm ci

ARG VITE_DOMAIN_NAME
ARG VITE_SESSION_TIMEOUT

ENV VITE_DOMAIN_NAME=$VITE_DOMAIN_NAME
ENV VITE_SESSION_TIMEOUT=$VITE_SESSION_TIMEOUT

COPY ./ ./

RUN npm run build

FROM nginx:stable-alpine AS production

COPY --from=build /usr/src/app/dist /usr/share/nginx/html