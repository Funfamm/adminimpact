# ==========================================
# STAGE 1: Build the React Frontend
# ==========================================
FROM node:20-slim as builder

# Set working directory
WORKDIR /app

# Copy root dependency files
COPY package*.json ./

# Install frontend dependencies
RUN npm install

# Copy all source code
COPY . .

# Build the static website (Output goes to /app/dist)
RUN npm run build

# ==========================================
# STAGE 2: Setup the Backend Server
# ==========================================
FROM node:20-slim

# Set working directory for the server
WORKDIR /app

# Copy server dependency definition
COPY server/package*.json ./

# Install backend dependencies (including ts-node for running TypeScript)
RUN npm install

# Copy backend source code (index.ts, etc.) into the container
COPY server/ ./

# Copy the built frontend website from Stage 1 into the server's folder
# The server logic expects files at ./dist
COPY --from=builder /app/dist ./dist

# Expose the port Cloud Run expects
ENV PORT=8080
ENV NODE_ENV=production

# Start the application
CMD ["npm", "start"]
