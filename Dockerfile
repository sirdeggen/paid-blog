# Custom Ghost application with full control over middleware
FROM node:20-bullseye

WORKDIR /app

# System dependencies needed by Ghost (image processing, SQLite, etc.)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    python3 \
    libvips-dev \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install Ghost CLI (the official and reliable way to install Ghost)
RUN npm install -g ghost-cli@latest

# Copy our package.json (for any extra deps we want on top of Ghost)
COPY package*.json ./

# Install any additional lightweight dependencies (express, etc.)
RUN npm install --omit=dev --no-audit --no-fund

# Copy our custom application code
COPY . .

# Use Ghost CLI to create a fully working Ghost installation
# This handles all the complex native module compilation correctly
RUN ghost install \
    --local \
    --no-setup \
    --no-start \
    --no-enable \
    --dir /app/ghost

# Replace the default Ghost index.js with our custom version
# (this is where we add middleware)
RUN cp /app/index.js /app/ghost/index.js

# Create the content directory (will be volume mounted for persistence)
RUN mkdir -p /app/ghost/content

# Ghost will run on whatever port we configure (default 2368 inside, we map 3000)
EXPOSE 3000

# Start from inside the ghost directory so Ghost finds its config and node_modules
WORKDIR /app/ghost

CMD ["node", "index.js"]
