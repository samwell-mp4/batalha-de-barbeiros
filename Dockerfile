# Estágio 1: Build Frontend
FROM node:20-alpine as build-frontend
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Estágio 2: Build Backend
FROM node:20-alpine as build-backend
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install
COPY server/ .
RUN npx prisma generate
RUN npm run build

# Estágio 3: Produção
FROM node:20-alpine
WORKDIR /app

# Copiar arquivos necessários
COPY --from=build-frontend /app/dist ./server/public
COPY --from=build-backend /app/server/dist ./server/dist
COPY --from=build-backend /app/server/package*.json ./server/
COPY --from=build-backend /app/server/node_modules ./server/node_modules
COPY --from=build-backend /app/server/prisma ./server/prisma

WORKDIR /app/server
EXPOSE 3000

# Comando para rodar a aplicação completa
CMD ["npm", "start"]
