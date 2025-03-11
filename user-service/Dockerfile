# Use a base image with build tools
FROM node:18

# Set the working directory
WORKDIR /app

# Install system dependencies required for bcrypt
RUN apt-get update && apt-get install -y python3 make g++ gcc

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Manually rebuild bcrypt
RUN npm rebuild bcrypt --build-from-source

# Copy the rest of the application code
COPY . .

# Expose port and start the application
EXPOSE 4002
CMD ["node", "user-server.js"]
