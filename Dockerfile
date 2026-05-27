FROM node:20-slim AS build
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ ca-certificates \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .

FROM node:20-slim
WORKDIR /app
COPY --from=build /app /app
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "app.js"]
