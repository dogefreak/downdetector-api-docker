FROM node:latest

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    vim \
    nano \
    gconf-service \
    libasound2 \
    libatk1.0-0 \
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

# Clone the repository containing the script
RUN git clone https://github.com/dogefreak/downdetector-api-docker.git .

# Navigate to the directory containing the script
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install npm packages
RUN npm install

# Move the index.js file from the cloned repository to downdetector-api module
# RUN mv index.js node_modules/downdetector-api/index.js

# Copy the prometheus.js file to the root directory
COPY prometheus.js .

# Command to start the application
CMD ["node", "prometheus.js"]
