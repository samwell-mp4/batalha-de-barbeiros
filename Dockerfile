# Estágio 1: Build
FROM node:20-alpine as build-stage

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar o restante dos arquivos do projeto
COPY . .

# Rodar o build do projeto (Vite + TS)
RUN npm run build

# Estágio 2: Produção (Nginx)
FROM nginx:stable-alpine

# Copiar os arquivos compilados do estágio anterior
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Copiar a configuração personalizada do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expor a porta 80
EXPOSE 80

# Comando para rodar o Nginx
CMD ["nginx", "-g", "daemon off;"]
