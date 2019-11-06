##################################
# node image for building the app 
##################################
FROM node:lts as builder

# set working directory
WORKDIR /app

# build app
COPY . /app
RUN npm install \
    && npm run build

##################################
# nginx for serving the app
##################################
FROM nginx:alpine
LABEL maintainer="Peter Stadler for the ViFE"
COPY --from=builder /app/dist/*  /usr/share/nginx/html/ 
