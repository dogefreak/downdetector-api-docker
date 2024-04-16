# Use a base image with node.js
FROM node:latest

# Install git
RUN apt-get update && apt-get install -y \
    git \
    vim \
    nano \
    gconf-service \
    chromium-browser \
    libasound2 \
    libatk2.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgcc1 \
    libgconf-2-4 \
    libgdk-pixbuf2.0-0 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    ca-certificates \
    fonts-liberation \
    libappindicator1 \
    libnss3 \
    lsb-release \
    xdg-utils \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Create a directory for your app
WORKDIR /app

# Clone the GitHub repo
RUN git clone https://github.com/dogefreak/downdetector-api-docker.git

# Change directory to your cloned repo
WORKDIR /app/downdetector-api-docker

# Install npm packages
RUN npm install

# Move index.js to downdetector-api npm package
RUN mv index.js /app/downdetector-api-docker/node_modules/downdetector-api/index.js

# Move puWorker.js to downdetector-api npm package
RUN mv puWorker.js /app/downdetector-api-docker/node_modules/downdetector-api/puWorker.js

# Change directory to the installed npm package
WORKDIR /app/downdetector-api-docker

# Start prometheus.js
CMD ["node", "prometheus.js"]
