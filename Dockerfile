FROM node:latest

# Navigate to the directory containing the script
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y git

# Clone the repository containing the script
RUN git clone https://github.com/dogefreak/downdetector-api-docker.git .

# Navigate to the directory containing the script
WORKDIR /app/test

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install npm packages
RUN npm install

# Navigate to the directory containing the script
WORKDIR /app

# Move the index.js file from the cloned repository to downdetector-api module
RUN mv index.js node_modules/downdetector-api/index.js

# Navigate to the directory containing the script
WORKDIR /app/test

# Command to start the application
CMD ["node", "prometheus.js"]
