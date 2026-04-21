FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Ensure the uploads directory exists for Multer
RUN mkdir -p /app/public/uploads

# Expose the API port
EXPOSE 3000

# Start the server
CMD ["npm", "start"]
