# Build stage
FROM node:20 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build  # tsconfig.json debe compilar a /dist

# Production stage
FROM node:20-alpine

WORKDIR /app

COPY --from=build /app/dist ./dist
COPY package*.json ./
RUN npm install --production

ENV PORT=3000

EXPOSE 3000

CMD ["node", "dist/index.js"]
