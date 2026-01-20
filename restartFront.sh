# 1. Parar el servicio
sudo systemctl stop onemore.service

# 2. Construir la web nueva
cd ~/Projects/OneMore/frontend
npm run build

# 3. Arrancar de nuevo
sudo systemctl start onemore.service
