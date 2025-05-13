## Dockerfile
################################
## BUILD ENVIRONMENT ###########
################################

# Use the official Node.js Alpine image (adjust based on your project's requirements)
FROM node:20-alpine3.20 AS build

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json into the container
# Adjust path to be relative to the build context (root directory)
COPY ./ZenWealth.Web/package.json ./ZenWealth.Web/package-lock.json ./

# Install dependencies using npm
RUN npm ci

# Copy the project files into the working directory
# Adjust to copy only what's needed for the web application
COPY ./ZenWealth.Web/ ./

# Build the React app for production
RUN npm run build

################################
#### PRODUCTION ENVIRONMENT ####
################################

# Use the official NGINX image for production
FROM nginx:stable-alpine AS production

# copy nginx configuration in side conf.d folder and remove the default conf so there are no conflicts
RUN rm -rf /etc/nginx/conf.d/default.conf
COPY --from=build /usr/src/app/nginx /etc/nginx/conf.d

# Copy the build output from the dist folder into the Nginx html directory
COPY --from=build /usr/src/app/dist /usr/share/nginx/html

# Expose port 80 to allow access to the app
EXPOSE 80

# Run Nginx in the foreground
ENTRYPOINT ["nginx", "-g", "daemon off;"]