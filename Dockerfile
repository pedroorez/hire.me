FROM mhart/alpine-node:7.5.0

WORKDIR /jshort
ADD . .
RUN npm install

env MONGO_URL=mongodb

EXPOSE 3000
CMD ["npm", "run", "dockerstart"]
