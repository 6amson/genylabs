FROM node:18-alpine

# Install build dependencies for native modules like bcrypt
RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./

# Install ALL dependencies (including dev) for building
RUN npm ci

# Install Nest CLI globally
RUN npm install -g @nestjs/cli

COPY . .

# Build the application
RUN npm run build

# Remove dev dependencies after build
# RUN npm ci --omit=dev && npm cache clean --force

EXPOSE 3000

CMD ["npm", "run", "start:prod"]