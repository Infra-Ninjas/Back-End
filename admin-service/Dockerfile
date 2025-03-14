FROM node:18-alpine

WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies and rebuild native modules
RUN npm ci

# Copy the rest of the code
COPY . .

EXPOSE 4001

CMD ["npm", "start"]

# docker build -t admin-service .
# docker run -d -p 4001:4001 admin-service
# docker ps
# docker logs <container_id>
# docker exec -it <container_id> sh

# docker tag admin-service:latest rupeshvanneldas27/admin-service:latest && docker push rupeshvanneldas27/admin-service:latest
# docker build -t rupeshvanneldas27/admin-service:latest . && docker push rupeshvanneldas27/admin-service:latest