# Use official Node.js runtime as base image
FROM node:22-alpine

# Set working directory in container
WORKDIR /app

# Copy package.json first (for better Docker layer caching)
COPY package*.json ./

# Install dependencies
RUN npm install --only=production

# Copy application code
COPY index.js ./

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S expressjs -u 1001
USER expressjs

# Expose port
EXPOSE 8000

# Start the application
CMD ["npm", "start"]