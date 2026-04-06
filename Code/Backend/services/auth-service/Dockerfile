<<<<<<< HEAD
FROM node:18-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5001
CMD ["npm", "run", "dev"]
=======
FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5001

CMD ["npx", "nodemon", "src/app.js"]
>>>>>>> b955a41bdc8111f7a93e78bc679344b7d7d789e8
