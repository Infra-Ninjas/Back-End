FROM node:18-alpine

WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies and rebuild native modules
RUN npm ci

# Copy the rest of the code
COPY . .

EXPOSE 4002

CMD ["npm", "start"]

#docker build -t user-service .
#docker run -d -p 4002:4002 user-service
#docker ps
#docker logs <container_id>
#docker exec -it <container_id> sh

# docker tag user-service:latest rupeshvanneldas27/user-service:latest && docker push rupeshvanneldas27/user-service:latest
# docker build -t rupeshvanneldas27/user-service:latest . && docker push rupeshvanneldas27/user-service:latest