# Create image based on the official Node image from dockerhub
FROM node:18

# Set the working directory inside the container
WORKDIR /app/server

# Copy package.json
COPY package.json .

# Install dependencies
RUN npm install

# Copy the rest of the back end code
COPY . .

# Expose port 3000
EXPOSE 3000

# Start the Node.js server
CMD ["npm", "start"]
