FROM node:20

# Establece el directorio de trabajo
WORKDIR /app

# Copia archivos
COPY package*.json ./
COPY . .

# Instala dependencias
RUN npm install

# Expone el puerto
EXPOSE 3000

# Comando para ejecutar la app
CMD ["npm", "start"]
