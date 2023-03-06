##################################
# node image for building the app 
##################################
FROM node:lts as builder

# set working directory
WORKDIR /app

# build app
COPY . /app/
RUN npm install && 
    npm run build --openssl-legacy-provider

##################################
# nginx for serving the app
##################################
FROM nginx:latest
LABEL maintainer="Peter Stadler for the ViFE" org.opencontainers.image.source="https://github.com/Edirom/CollAna"
COPY nginx_config/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist/*  /usr/share/nginx/html
