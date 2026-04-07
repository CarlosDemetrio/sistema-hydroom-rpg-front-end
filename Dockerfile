# Development stage with hot-reload
FROM node:20-alpine AS development

WORKDIR /app

# Copy package files first for better caching
COPY package.json package-lock.json ./

# Install dependencies (including devDependencies)
RUN npm install

# Copy configuration files
COPY angular.json tsconfig.json tsconfig.app.json tsconfig.spec.json proxy.conf.json ./

# Copy source code
COPY src ./src

# Expose ports
EXPOSE 4201 49153

# Start development server with hot-reload
CMD ["npm", "start"]

# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine AS production

# Copy built application from build stage
COPY --from=build /app/dist/ficha-controlador-front-end/browser /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
