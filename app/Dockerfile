FROM node:14-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "run","build"]

FROM nginx
EXPOSE 3000
COPY ./nginx/configs/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/www/ /usr/share/nginx/html
