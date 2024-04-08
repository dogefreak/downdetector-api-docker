FROM node:latest

WORKDIR /app

# Install git
RUN apt-get update && apt-get install -y git

# Clone the repository containing the script
RUN git clone https://github.com/dogefreak/downdetector-api-docker.git .

# Navigate to the directory containing the script
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install npm packages
RUN npm install

# Command to start the application
CMD ["node", "prometheus.js"]
