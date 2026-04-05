FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

# Port dyal l-IA
EXPOSE 5003

CMD ["node", "src/index.js"]