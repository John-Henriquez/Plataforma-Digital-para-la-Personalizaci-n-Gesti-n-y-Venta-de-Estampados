FROM node:20 AS build

# Establece el directorio de trabajo
WORKDIR /app

ARG VITE_BASE_URL
ENV VITE_BASE_URL=$VITE_BASE_URL

# Copia archivos
COPY package*.json ./
COPY vite.config.js ./
COPY . .

# Instala dependencias y genera build
RUN npm install && npm run build

# Instala un servidor web estático
RUN npm install -g serve

# Expone el puerto que usará serve
EXPOSE 4173

# Ejecuta el servidor para servir el build
CMD ["serve", "-s", "dist", "-l", "4173"]
