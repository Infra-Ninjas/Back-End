FROM node:18-alpine

WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies and rebuild native modules
RUN npm ci

# Copy the rest of the code
COPY . .

EXPOSE 5000

CMD ["npm", "start"]

# docker build -t db-service .
# docker run -d -p 5000:5000 db-service
# docker ps
# docker logs <container_id>
# docker exec -it <container_id> sh

# docker tag db-service:latest rupeshvanneldas27/db-service:latest && docker push rupeshvanneldas27/db-service:latest
# docker build -t rupeshvanneldas27/db-service:latest . && docker push rupeshvanneldas27/db-service:latest