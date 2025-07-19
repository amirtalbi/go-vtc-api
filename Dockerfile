# Use the official Node.js 20 image with Alpine for Apple Silicon optimization
FROM --platform=linux/arm64 node:20-alpine

# Install necessary build tools for native dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    build-base \
    curl \
    git

# Create app directory with proper permissions
WORKDIR /usr/src/app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs \
    && adduser -S nestjs -u 1001

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy the rest of the application code
COPY . .

# Change ownership of the app directory
RUN chown -R nestjs:nodejs /usr/src/app

# Switch to non-root user
USER nestjs

# Expose the application port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Start the application
CMD ["npm", "run", "start:prod"]