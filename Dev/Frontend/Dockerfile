FROM node:20-alpine

WORKDIR /app

# Nkopiw ghir package files bach Docker cache ykhdem mzyan.
COPY package*.json ./

# Installation n9iya dyal dependencies (retries si reseau Docker -> npm instable).
RUN npm ci \
  --fetch-retries=5 \
  --fetch-retry-mintimeout=20000 \
  --fetch-retry-maxtimeout=120000

# Nkopiw baqi source code.
COPY . .

COPY docker-entrypoint.dev.sh /docker-entrypoint.dev.sh
RUN chmod +x /docker-entrypoint.dev.sh

EXPOSE 5173

# Au demarrage : si le volume node_modules est vieux, npm ci reprend les deps du lockfile.
ENTRYPOINT ["/bin/sh", "/docker-entrypoint.dev.sh"]
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
