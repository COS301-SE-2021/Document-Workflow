FROM node:14-alpine

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

EXPOSE 80

#ENV MONGODB_USERNAME=root
#ENV MONGODB_PASSWORD=secret
#ENV MONGODB_URL=mongodb
#ENV MONGODB_NAME=goals-dev

ENV MONGODB_USERNAME=admin
ENV MONGODB_PASSWORD=I14K7G0lSroGrQvG
ENV MONGODB_URL=cluster0.b1wre.mongodb.net
ENV MONGODB_NAME=docwdb

CMD ["npm", "start"]