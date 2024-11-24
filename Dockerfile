
# Build stage
FROM node:18.17.0-alpine3.18 AS builder
WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./
RUN npm install --include=dev
COPY src/ ./src/
RUN npm run build


# Production stage
FROM node:18.17.0-alpine3.18

WORKDIR /app
COPY package*.json ./

RUN npm install

COPY --from=builder /app/dist ./dist

CMD ["npm", "start"]