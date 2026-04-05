# Stage 1: Build l-React app
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve b Nginx (Professional way)
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
# Ila kanti khdam b React Router, zid had l-ligne:
# COPY nginx.conf /etc/nginx/conf.d/default.conf 

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]