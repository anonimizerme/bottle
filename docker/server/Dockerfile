FROM node:12-alpine

WORKDIR /usr/src/app

COPY package.json .

RUN yarn install

COPY . .

CMD [ "node", "server/index.js" ]