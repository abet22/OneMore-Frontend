# Usamos Node.js 22 (Vite lo necesita)
FROM node:22-slim

WORKDIR /app

# Copiamos package.json e instalamos dependencias
COPY package.json package-lock.json ./
RUN npm install

# Exponemos el puerto de Vite
EXPOSE 5173

# Comando para desarrollo
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]