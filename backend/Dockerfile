# EventLay Backend Dockerfile
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies based on lockfile
COPY package*.json ./
RUN npm ci --omit=dev

# Copy application source code
COPY . .

# Expose backend port
EXPOSE 5000

# Start production server
CMD ["npm", "start"]
