# Stage 1
# FROM node:16.14 as react-build
FROM node:18.17.0 as react-build
WORKDIR /app
COPY . ./
RUN npm install
#RUN npm audit fix --force
RUN npm run build


# Stage 2 - the production environment
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=react-build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
