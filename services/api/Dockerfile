FROM node:20-alpine

# Create node user and group
RUN addgroup -g 1000 -S node && adduser -u 1000 -S node -G node

WORKDIR /app

# Create /data directory for persistent storage and set ownership
RUN mkdir -p /data && chown -R node:node /app /data

# Switch to node user
USER node

# Install dependencies
COPY --chown=node:node package*.json ./
RUN npm install

# Copy source
COPY --chown=node:node . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
