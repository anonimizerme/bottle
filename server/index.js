const {init: initKnex} = require('./knex');
const server = require('./src/server');

process.on('uncaughtException', (error) => {
    console.log(error)
    console.trace();
});

initKnex();

server.init();