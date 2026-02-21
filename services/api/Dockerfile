FROM node:20-alpine

# node:20-alpine already has node user/group; ensure /app and /data writable
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
