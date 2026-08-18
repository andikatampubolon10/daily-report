# ==========================================
# Next.js Application Dockerfile
# ==========================================

FROM node:20-alpine

WORKDIR /app

# Install dependencies first (for better caching)
COPY package.json package-lock.json* ./
RUN npm ci

# Copy the rest of the application files
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build the production application
# We provide a dummy DATABASE_URL because the prisma client is initialized at build time during module import.
# The actual connection string is provided at runtime.
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
RUN npm run build

# Expose port
EXPOSE 3000

# Start command
# Runs migrations, seeds initial data, and starts Next.js in production
CMD npx prisma migrate deploy && npx prisma db seed && npm run start

