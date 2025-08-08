FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY package*.json ./
RUN npm install --omit=dev

EXPOSE 5000
CMD ["node", "dist/server.js"]
