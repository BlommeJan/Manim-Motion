# Build stage
FROM node:20-alpine AS build

# Create node user if not exists and set permissions
RUN addgroup -g 1000 -S node && adduser -u 1000 -S node -G node || true

WORKDIR /app

# Ensure /app is owned by node user
RUN chown -R node:node /app

# Switch to node user for build
USER node

COPY --chown=node:node package*.json ./
RUN npm install

COPY --chown=node:node . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Create nginx user and set permissions
RUN addgroup -g 1000 -S nginx && adduser -u 1000 -S nginx -G nginx || true

# Copy built assets with proper ownership
COPY --from=build --chown=nginx:nginx /app/dist /usr/share/nginx/html

# Copy nginx config
COPY --chown=nginx:nginx nginx.conf /etc/nginx/conf.d/default.conf

# Ensure nginx can write to necessary directories
RUN chown -R nginx:nginx /var/cache/nginx /var/log/nginx /etc/nginx/conf.d

# Switch to non-root user
USER nginx

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
