# Dockerfile multi-stage pour notifications-service
# Permet un déploiement lean et optimisé avec frontend React build

FROM node:20 AS frontend-builder
WORKDIR /app

COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install

COPY frontend ./frontend
RUN cd frontend && npm run build

FROM node:20 AS backend
WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY src ./src
COPY --from=frontend-builder /app/frontend/dist ./public

EXPOSE 5003

CMD ["node", "src/server.js"]
