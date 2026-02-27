# Dependencies stage (used by both dev and production)
FROM node:20-alpine AS deps

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build stage (production)
FROM deps AS build

RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
