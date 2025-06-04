FROM node:20-alpine3.20 AS build

WORKDIR /usr/src/app

COPY package*.json package-lock.json ./

RUN npm ci

COPY ./ ./

RUN npm run build

FROM nginx:stable-alpine AS production

COPY --from=build /usr/src/app/dist /usr/share/nginx/html