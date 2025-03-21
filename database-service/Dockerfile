FROM node:18-alpine

WORKDIR /app

# Accept build arguments
ARG MONGODB_URI
ARG CLOUDINARY_NAME
ARG CLOUDINARY_API_KEY
ARG CLOUDINARY_SECRET_KEY

# Make them available inside the container
ENV MONGODB_URI=$MONGODB_URI
ENV CLOUDINARY_NAME=$CLOUDINARY_NAME
ENV CLOUDINARY_API_KEY=$CLOUDINARY_API_KEY
ENV CLOUDINARY_SECRET_KEY=$CLOUDINARY_SECRET_KEY

# Copy package files first
COPY package*.json ./

# Install dependencies and rebuild native modules
RUN npm ci

# Copy the rest of the code
COPY . .

EXPOSE 5000

CMD ["npm", "start"]
