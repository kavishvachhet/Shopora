FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all frontend code
COPY . .

# Expose the Vite default port
EXPOSE 5173

# Start the Vite development server and expose to network
CMD ["npm", "run", "dev", "--", "--host"]
