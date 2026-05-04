# Imagem Base Node.js
FROM node:22-alpine

WORKDIR /app

# Copia pacotes para cache da layer
COPY package*.json ./

# Instala dependencias para producao
RUN npm install --omit=dev

# Copia resto do código
COPY . .

# Porta do microsserviço
EXPOSE 9090

# Command padrão
CMD ["npm", "start"]
