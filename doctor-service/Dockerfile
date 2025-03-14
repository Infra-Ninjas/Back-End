FROM node:18-alpine

WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies and rebuild native modules
RUN npm ci

# Copy the rest of the code
COPY . .

EXPOSE 4003

CMD ["npm", "start"]

#docker build -t doctor-service .
#docker run -d -p 4003:4003 doctor-service
#docker ps
#docker logs <container_id>
#docker exec -it <container_id> sh

# docker tag doctor-service:latest rupeshvanneldas27/doctor-service:latest && docker push rupeshvanneldas27/doctor-service:latest
# docker build -t rupeshvanneldas27/doctor-service:latest . && docker push rupeshvanneldas27/doctor-service:latest