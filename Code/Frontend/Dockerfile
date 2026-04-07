# Étape 1 : Build de l'application
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Étape 2 : Serveur web Nginx pour la production
FROM nginx:alpine
# Copie du build React (le dossier de sortie est généralement 'dist' pour Vite, ou 'build' pour Create React App)
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]