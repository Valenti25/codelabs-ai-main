# Use the official Node.js runtime as a parent image
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the application (with TypeScript installed)
RUN npm run build

# Remove devDependencies but keep TypeScript for next.config.ts
RUN npm ci --only=production --ignore-scripts && \
    npm install typescript@latest && \
    npm cache clean --force

# Expose port 3000 (internal container port)
EXPOSE 3000

# Start the application
CMD ["npm", "start"]