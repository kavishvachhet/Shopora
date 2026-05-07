FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json first (this helps with caching)
COPY package*.json ./

# Install dependencies and PM2 globally
RUN npm install
RUN npm install -g pm2

# Copy the rest of your backend code
COPY . .

# Expose the port your backend runs on
EXPOSE 3000

# Start the app using PM2 for production performance
CMD ["pm2-runtime", "app.js", "-i", "max"]
