FROM node:18-alpine AS builder
WORKDIR /app

# Recibe variables en build-time (por ejemplo JWT_SECRET)
ARG JWT_SECRET
ENV JWT_SECRET=${JWT_SECRET}

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY package*.json ./
RUN npm ci --omit=dev --production

EXPOSE 3000
CMD ["node", "dist/main.js"]
