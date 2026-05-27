# Custom Ghost application (your own Express app that uses Ghost)
FROM node:20-bullseye

WORKDIR /app

# System deps for Ghost native modules
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    python3 \
    libvips-dev \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

RUN npm install -g ghost-cli@latest

# Your custom server dependencies (lightweight)
COPY package*.json ./
RUN npm install --omit=dev --no-audit --no-fund

COPY . .

# Install Ghost using the CLI (this is the reliable way to get Ghost + all native deps)
RUN ghost install 5.130.6 \
    --local \
    --no-setup \
    --no-start \
    --no-enable \
    --allow-root \
    --dir /app/ghost

# Make sure content directory exists for volume mount
RUN mkdir -p /app/ghost/content

# Main entrypoint is your custom server.js (not inside the ghost dir)
# server.js will chdir into /app/ghost before requiring Ghost
EXPOSE 3000

CMD ["node", "server.js"]
