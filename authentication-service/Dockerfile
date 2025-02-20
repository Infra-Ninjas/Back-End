FROM node:18-alpine

# Install required build tools
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files first
COPY package*.json ./

# Remove any existing node_modules (if any)
RUN rm -rf node_modules

# Install dependencies and rebuild native modules
RUN npm ci
RUN npm rebuild bcrypt --build-from-source

# Copy the rest of the code
COPY . .

# Copy the .env file into the container (ensure the .env file is in the same directory as your Dockerfile)
COPY .env .env

EXPOSE 4000

CMD ["npm", "start"]

#docker build -t infra-ninjas-auth-service .
#docker run -p -d 4000:4000 infra-ninjas-auth-service
#docker ps
#docker logs <container_id>
#docker exec -it <container_id> sh