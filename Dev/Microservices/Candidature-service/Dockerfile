FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
# Retries / timeouts: reduit les echecs Docker (ECONNRESET) sur reseaux instables vers registry.npmjs.org
RUN npm install --omit=dev \
  --fetch-retries=5 \
  --fetch-retry-mintimeout=20000 \
  --fetch-retry-maxtimeout=120000

COPY . .

ENV NODE_ENV=production
EXPOSE 8003

CMD ["node", "server.js"]
