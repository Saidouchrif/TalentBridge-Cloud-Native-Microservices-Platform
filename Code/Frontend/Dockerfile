FROM node:20-alpine

WORKDIR /app

# Nkopiw ghir package files bach Docker cache ykhdem mzyan.
COPY package*.json ./

# Installation n9iya dyal dependencies.
RUN npm ci

# Nkopiw baqi source code.
COPY . .

EXPOSE 5173

# Serveur Vite f mode dev accessible mn barra container.
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
