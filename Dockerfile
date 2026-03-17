# Stage 1: Build the Vite application
FROM node:20-alpine as build-stage

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build the app to the dist folder (this runs Vite's build command)
RUN npm run build

# Stage 2: Serve the app with NGINX
FROM nginx:alpine as production-stage

# Copy the built assets from the previous stage
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Overwrite the default NGINX configuration to properly handle single-page apps (SPA)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Run NGINX in foreground
CMD ["nginx", "-g", "daemon off;"]
