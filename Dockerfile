FROM node:12

WORKDIR /usr/src/app

COPY . .

RUN yarn install

RUN yarn global add mocha knex

CMD [ "knex", "migrate:latest" ]