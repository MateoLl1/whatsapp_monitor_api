# Node 24.22.1 (LTS Krypton, release de seguridad). No usar versiones anteriores.
# Debe coincidir con .nvmrc y con "engines" de package.json.

# ---------- BUILD ----------
FROM node:24.22.1-alpine AS build

WORKDIR /app

COPY package*.json .npmrc ./
RUN npm ci --legacy-peer-deps

COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY src ./src

RUN npm run build


# ---------- RUNTIME ----------
FROM node:24.22.1-alpine

ENV NODE_ENV=production

WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY public ./public
COPY package.json ./

EXPOSE 3000

CMD ["sh", "-c", "npx typeorm migration:run -d dist/data-source.js && node dist/main.js"]
