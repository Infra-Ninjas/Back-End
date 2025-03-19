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


