# Create image based on the official Node image from dockerhub
FROM node:18

# Set the working directory inside the container
WORKDIR /app/client

# Copy package.json
COPY package.json .

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the front end code
COPY . .

# Expose port 3001
EXPOSE 3001

# Serve the app
CMD ["npm", "start"]
