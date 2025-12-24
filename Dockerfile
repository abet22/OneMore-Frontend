# Usamos Node.js ligero
FROM node:20-alpine

WORKDIR /app

# Copiamos los archivos de dependencias primero (para aprovechar caché)
COPY package.json package-lock.json ./

# Instalamos
RUN npm install

# Copiamos el resto
COPY . .

# Exponemos el puerto de Vite
EXPOSE 5173

# Arrancamos en modo desarrollo visible para la red
CMD ["npm", "run", "dev", "--", "--host"]
