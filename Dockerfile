# Use the official Node.js 18 image based on Alpine
FROM node:18-alpine

# Install Python and other build dependencies
# RUN apk add --no-cache python3 make g++ build-base yarn

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Install the Nest CLI globally
RUN npm install -g @nestjs/cli

# Expose the application port
EXPOSE 3000

# Start the application with hot-reload
CMD ["npm", "run", "start:dev"]