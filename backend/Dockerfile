# Use Node.js image
FROM node:20

# Set working directory inside container
WORKDIR /app

# Copy package files first (for caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the code
COPY . .

# Expose port
EXPOSE 3000

# Generate Prisma client, then run the app
CMD ["sh", "-c", "npm run prisma:generate && npm run prisma:seed && npm run dev"]