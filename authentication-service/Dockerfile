FROM node:18-alpine

WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies and rebuild native modules
RUN npm ci

# Copy the rest of the code
COPY . .

EXPOSE 4000

CMD ["npm", "start"]

# docker build -t auth-service .
# docker run -d -p 4000:4000 auth-service
# docker ps
# docker logs <container_id>
# docker exec -it <container_id> sh