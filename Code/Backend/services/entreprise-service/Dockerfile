# -------------------------
# Étape 1: build du frontend React (Vite)
# -------------------------
FROM node:20 AS frontend-build

WORKDIR /frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend ./
RUN npm run build

# -------------------------
# Étape 2: image runtime (backend + fichiers frontend)
# -------------------------
FROM node:20

WORKDIR /app

# Installation dépendances backend.
COPY package*.json ./
RUN npm install --omit=dev

# Copie du code backend.
COPY src ./src

# Copie du build frontend sous /app/public
COPY --from=frontend-build /frontend/dist ./public

EXPOSE 5002

CMD ["node", "src/server.js"]

