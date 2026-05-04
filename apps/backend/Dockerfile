# Imagem Base Node.js
FROM node:22-alpine

WORKDIR /app

# Copia pacotes para cache da layer
COPY package*.json ./

# Instala dependencias para producao
RUN npm ci --omit=dev

# Copia resto do código
COPY . .

# Porta do express
EXPOSE 8080

# Em prod/stage roda normal. Em docker-compose de dev vamos sobrescrever o command para npm run dev.
CMD ["npm", "start"]
