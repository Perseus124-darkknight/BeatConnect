FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Expose the API port
EXPOSE 3001

# Start the server
CMD ["npm", "start"]
